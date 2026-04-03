const Task = require('../models/Task')
const User = require('../models/User')
const { calculatePriorityScore } = require('../utils/priorityAlgorithm')

exports.createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.userId
    }
    
    const task = new Task(taskData)
    
    // Calculate initial priority score
    task.priorityScore = calculatePriorityScore(task)
    
    await task.save()
    
    res.status(201).json({ task })
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message })
  }
}

exports.getTasks = async (req, res) => {
  try {
    const { status = 'pending' } = req.query
    const tasks = await Task.find({
      userId: req.userId,
      status
    }).sort({ priorityScore: -1, deadline: 1 })
    
    res.json({ tasks })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' })
  }
}

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const task = await Task.findOne({ _id: id, userId: req.userId })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Handle postponing
    if (updates.status === 'postponed' && task.status !== 'postponed') {
      updates.backlogCount = (task.backlogCount || 0) + 1
    }

    // Handle completion
    if (updates.status === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date()
      
      // Award XP (10 XP per task)
      const user = await User.findById(req.userId)
      user.totalXp += 10
      
      // Level up logic
      const newLevel = Math.floor(user.totalXp / 100) + 1
      if (newLevel > user.level) {
        user.level = newLevel
      }

      // Update streak
      const today = new Date().toDateString()
      if (user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate).toDateString()
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (lastActive === yesterday.toDateString()) {
          user.streak += 1
        } else if (lastActive !== today) {
          user.streak = 1
        }
      } else {
        user.streak = 1
      }

      user.lastActiveDate = new Date()
      await user.save()
    }

    Object.assign(task, updates)
    
    // Recalculate priority score if pending
    if (task.status === 'pending') {
      task.priorityScore = calculatePriorityScore(task)
    }

    await task.save()
    
    res.json({ task })
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    await Task.findOneAndDelete({ _id: id, userId: req.userId })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' })
  }
}
