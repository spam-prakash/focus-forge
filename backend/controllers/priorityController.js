const Task = require('../models/Task')
const { calculatePriorityScore, getRecommendation } = require('../utils/priorityAlgorithm')

exports.getFocusTask = async (req, res) => {
  try {
    const focusTask = await Task.findOne({
      userId: req.userId,
      status: 'pending'
    }).sort({ priorityScore: -1 })

    if (!focusTask) {
      return res.json({
        hasTask: false,
        message: '🎉 No pending tasks! Great job!'
      })
    }

    const recommendation = getRecommendation(focusTask.priorityScore)

    res.json({
      hasTask: true,
      task: focusTask,
      recommendation,
      priorityScore: focusTask.priorityScore
    })
  } catch (error) {
    res.status(500).json({ message: 'Error getting focus task' })
  }
}

exports.recalculateAllScores = async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.userId,
      status: 'pending'
    })

    for (const task of tasks) {
      task.priorityScore = calculatePriorityScore(task)
      await task.save()
    }

    res.json({
      message: `Recalculated ${tasks.length} tasks`,
      count: tasks.length
    })
  } catch (error) {
    res.status(500).json({ message: 'Error recalculating scores' })
  }
}
