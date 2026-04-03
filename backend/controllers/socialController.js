const User = require('../models/User')
const Task = require('../models/Task')
const StudySession = require('../models/StudySession')

// Get leaderboard - REAL DATA from database
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'week' } = req.query

    let startDate = new Date()
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === 'all') {
      startDate = new Date(0)
    }

    // Get all users with their task completion stats
    const users = await User.find().select('_id name level streak totalXp')

    const leaderboardData = await Promise.all(users.map(async (user) => {
      // Count tasks completed in the period
      const tasksCompleted = await Task.countDocuments({
        userId: user._id,
        status: 'completed',
        completedAt: { $gte: startDate }
      })

      // Count total tasks created in period
      const totalTasks = await Task.countDocuments({
        userId: user._id,
        createdAt: { $gte: startDate }
      })

      // Calculate completion rate
      const completionRate = totalTasks > 0
        ? Math.round((tasksCompleted / totalTasks) * 100)
        : 0

      // Get total focus hours from study sessions
      const sessions = await StudySession.aggregate([
        {
          $match: {
            userId: user._id,
            startTime: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: '$durationMinutes' }
          }
        }
      ])

      const focusHours = sessions.length > 0
        ? Math.round(sessions[0].totalMinutes / 60)
        : 0

      return {
        userId: user._id,
        name: user.name,
        level: user.level,
        streak: user.streak,
        totalXp: user.totalXp,
        tasksCompleted,
        completionRate,
        focusHours
      }
    }))

    // Sort by tasks completed (descending)
    const sortedLeaderboard = leaderboardData.sort((a, b) => b.tasksCompleted - a.tasksCompleted)

    res.json({ leaderboard: sortedLeaderboard })
  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message })
  }
}

// Get weekly challenge - REAL progress from user's actual data
exports.getWeeklyChallenge = async (req, res) => {
  try {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Count user's completed tasks this week
    const completedThisWeek = await Task.countDocuments({
      userId: req.userId,
      status: 'completed',
      completedAt: { $gte: startOfWeek }
    })

    // Count user's study sessions this week
    const studySessionsThisWeek = await StudySession.countDocuments({
      userId: req.userId,
      startTime: { $gte: startOfWeek }
    })

    // Calculate progress based on multiple metrics
    const taskGoal = 10
    const sessionGoal = 15

    const taskProgress = Math.min(100, (completedThisWeek / taskGoal) * 100)
    const sessionProgress = Math.min(100, (studySessionsThisWeek / sessionGoal) * 100)
    const overallProgress = Math.min(100, Math.round((taskProgress + sessionProgress) / 2))

    const challenge = {
      title: 'Productivity Warrior',
      description: `Complete ${taskGoal} tasks AND ${sessionGoal} study sessions this week`,
      progress: overallProgress,
      current: {
        tasks: completedThisWeek,
        sessions: studySessionsThisWeek
      },
      goals: {
        tasks: taskGoal,
        sessions: sessionGoal
      },
      reward: "100 XP + Exclusive 'Warrior' Badge"
    }

    res.json({ challenge })
  } catch (error) {
    console.error('Challenge error:', error)
    res.status(500).json({ message: 'Error fetching challenge', error: error.message })
  }
}

// Get friend activity - REAL recent activities
exports.getFriendActivity = async (req, res) => {
  try {
    // Get recent task completions from ALL users
    const recentCompletions = await Task.find({
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .sort({ completedAt: -1 })
      .limit(15)
      .populate('userId', 'name')

    // Get recent level ups and streak achievements
    const recentUsers = await User.find({
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).select('name level streak updatedAt')

    const activities = []

    // Add completion activities
    recentCompletions.forEach(task => {
      if (task.userId) {
        activities.push({
          userName: task.userId.name,
          userId: task.userId._id,
          action: `completed "${task.title}"`,
          type: 'completion',
          timestamp: task.completedAt,
          details: { taskTitle: task.title }
        })
      }
    })

    // Add streak activities (users who achieved 7+ day streaks)
    const streakUsers = await User.find({
      streak: { $gte: 7 },
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).select('name streak updatedAt')

    streakUsers.forEach(user => {
      activities.push({
        userName: user.name,
        userId: user._id,
        action: `achieved a ${user.streak} day streak! 🔥`,
        type: 'streak',
        timestamp: user.updatedAt,
        details: { streak: user.streak }
      })
    })

    // Sort by timestamp (newest first) and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20)

    res.json({ activities: sortedActivities })
  } catch (error) {
    console.error('Activity error:', error)
    res.status(500).json({ message: 'Error fetching activity', error: error.message })
  }
}

// Get community stats - REAL aggregated data
exports.getCommunityStats = async (req, res) => {
  try {
    // Total number of users
    const totalStudents = await User.countDocuments()

    // Get all tasks statistics
    const allTasks = await Task.find()
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.status === 'completed').length
    const avgCompletionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0

    // Get total study hours across all users
    const studyStats = await StudySession.aggregate([
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$durationMinutes' },
          avgFocusScore: { $avg: '$focusScore' }
        }
      }
    ])

    const totalStudyHours = studyStats.length > 0
      ? Math.round(studyStats[0].totalMinutes / 60)
      : 0
    const avgFocusScore = studyStats.length > 0
      ? Math.round(studyStats[0].avgFocusScore * 10) / 10
      : 0

    // Calculate user's percentile
    const userTasks = await Task.find({ userId: req.userId })
    const userCompleted = userTasks.filter(t => t.status === 'completed').length

    // Find how many users have fewer completions
    const allUsers = await User.find()
    const allUsersWithCompletions = await Promise.all(
      allUsers.map(async (u) => {
        const tasks = await Task.find({ userId: u._id })
        return tasks.filter(t => t.status === 'completed').length
      })
    )

    const betterThan = allUsersWithCompletions.filter(count => count < userCompleted).length
    const yourPercentile = totalStudents > 0
      ? Math.round((betterThan / totalStudents) * 100)
      : 0

    const stats = {
      totalStudents,
      totalTasks,
      totalStudyHours,
      avgCompletionRate,
      avgFocusScore,
      yourPercentile
    }

    res.json({ stats })
  } catch (error) {
    console.error('Community stats error:', error)
    res.status(500).json({ message: 'Error fetching community stats', error: error.message })
  }
}

// Compare with specific friend
exports.compareWithFriend = async (req, res) => {
  try {
    const { friendId } = req.params

    const [user, friend] = await Promise.all([
      User.findById(req.userId),
      User.findById(friendId)
    ])

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' })
    }

    const [userTasks, friendTasks] = await Promise.all([
      Task.find({ userId: req.userId }),
      Task.find({ userId: friendId })
    ])

    const userCompleted = userTasks.filter(t => t.status === 'completed').length
    const friendCompleted = friendTasks.filter(t => t.status === 'completed').length

    const comparison = {
      you: {
        name: user.name,
        level: user.level,
        streak: user.streak,
        tasksCompleted: userCompleted,
        totalXp: user.totalXp
      },
      friend: {
        name: friend.name,
        level: friend.level,
        streak: friend.streak,
        tasksCompleted: friendCompleted,
        totalXp: friend.totalXp
      },
      youAreAhead: userCompleted > friendCompleted
    }

    res.json({ comparison })
  } catch (error) {
    console.error('Comparison error:', error)
    res.status(500).json({ message: 'Error comparing users', error: error.message })
  }
}

// Get logged-in user's rank
exports.getMyRank = async (req, res) => {
  try {
    const { period = 'week' } = req.query
    
    let startDate = new Date()
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1)
    } else if (period === 'all') {
      startDate = new Date(0)
    }

    // Get all users with their task completion stats
    const users = await User.find().select('_id name level streak totalXp')
    
    const leaderboardData = await Promise.all(users.map(async (user) => {
      const tasksCompleted = await Task.countDocuments({
        userId: user._id,
        status: 'completed',
        completedAt: { $gte: startDate }
      })
      
      const totalTasks = await Task.countDocuments({
        userId: user._id,
        createdAt: { $gte: startDate }
      })
      
      const completionRate = totalTasks > 0
        ? Math.round((tasksCompleted / totalTasks) * 100)
        : 0
      
      return {
        userId: user._id,
        name: user.name,
        level: user.level,
        streak: user.streak,
        totalXp: user.totalXp,
        tasksCompleted,
        completionRate
      }
    }))
    
    // Sort by tasks completed (descending)
    const sortedLeaderboard = leaderboardData.sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    
    // Find current user's rank
    const userRank = sortedLeaderboard.findIndex(u => u.userId.toString() === req.userId) + 1
    const currentUser = sortedLeaderboard.find(u => u.userId.toString() === req.userId)
    
    // Get nearby users (2 above, 2 below)
    const userIndex = sortedLeaderboard.findIndex(u => u.userId.toString() === req.userId)
    const nearbyUsers = sortedLeaderboard.slice(
      Math.max(0, userIndex - 2),
      Math.min(sortedLeaderboard.length, userIndex + 3)
    )
    
    res.json({
      rank: userRank,
      totalUsers: sortedLeaderboard.length,
      userStats: currentUser,
      nearbyUsers,
      period
    })
    
  } catch (error) {
    console.error('Get my rank error:', error)
    res.status(500).json({ message: 'Error fetching user rank', error: error.message })
  }
}
