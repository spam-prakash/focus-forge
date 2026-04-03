const StudySession = require('../models/StudySession')
const UserActivity = require('../models/UserActivity')
const Task = require('../models/Task')
const User = require('../models/User')

// Track a new study session
exports.trackStudySession = async (req, res) => {
  try {
    const { taskId, subject, startTime, endTime, focusScore, distractions } = req.body

    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMinutes = Math.round((end - start) / (1000 * 60))

    const session = new StudySession({
      userId: req.userId,
      taskId,
      subject,
      startTime: start,
      endTime: end,
      durationMinutes,
      focusScore,
      distractions
    })

    await session.save()

    // Update daily activity - use UTC date at midnight for consistency
    const today = new Date()
    const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))

    await UserActivity.findOneAndUpdate(
      { userId: req.userId, date: utcToday },
      {
        $inc: {
          totalFocusMinutes: durationMinutes,
          distractionsCount: distractions || 0
        }
      },
      { upsert: true }
    )

    res.status(201).json({ session })
  } catch (error) {
    res.status(500).json({ message: 'Error tracking session', error: error.message })
  }
}

// Get weekly study pattern
exports.getWeeklyPattern = async (req, res) => {
  try {
    const { weeks = 1 } = req.query
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (7 * weeks))

    const sessions = await StudySession.aggregate([
      {
        $match: {
          userId: req.userId,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$startTime' },
            week: { $week: '$startTime' }
          },
          totalHours: { $sum: { $divide: ['$durationMinutes', 60] } },
          totalSessions: { $sum: 1 },
          avgFocusScore: { $avg: '$focusScore' },
          totalDistractions: { $sum: '$distractions' }
        }
      },
      {
        $sort: { '_id.week': 1, '_id.dayOfWeek': 1 }
      }
    ])

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weeklyData = dayNames.map((day, index) => {
      const daySessions = sessions.filter(s => s._id.dayOfWeek === index + 1)
      return {
        day,
        hours: daySessions.reduce((sum, s) => sum + s.totalHours, 0),
        sessions: daySessions.reduce((sum, s) => sum + s.totalSessions, 0),
        focusScore: daySessions.length > 0
          ? daySessions.reduce((sum, s) => sum + s.avgFocusScore, 0) / daySessions.length
          : 0
      }
    })

    res.json({ weeklyPattern: weeklyData })
  } catch (error) {
    res.status(500).json({ message: 'Error getting weekly pattern', error: error.message })
  }
}

// Get subject distribution
exports.getSubjectDistribution = async (req, res) => {
  try {
    const distribution = await StudySession.aggregate([
      {
        $match: { userId: req.userId }
      },
      {
        $group: {
          _id: '$subject',
          totalHours: { $sum: { $divide: ['$durationMinutes', 60] } },
          totalSessions: { $sum: 1 },
          totalFocusScore: { $sum: '$focusScore' },
          tasksCompleted: { $sum: { $cond: ['$completedTask', 1, 0] } }
        }
      },
      {
        $project: {
          subject: '$_id',
          hours: { $round: ['$totalHours', 1] },
          sessions: '$totalSessions',
          avgFocusScore: { $round: [{ $divide: ['$totalFocusScore', '$totalSessions'] }, 1] },
          tasksCompleted: 1
        }
      }
    ])

    res.json({ subjectDistribution: distribution })
  } catch (error) {
    res.status(500).json({ message: 'Error getting subject distribution', error: error.message })
  }
}

// Get completion trend
exports.getCompletionTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query
    const startDate = new Date()
    // Use UTC date for consistency
    startDate.setUTCDate(startDate.getUTCDate() - days)
    startDate.setUTCHours(0, 0, 0, 0)

    const activities = await UserActivity.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 })

    const trend = activities.map(activity => ({
      date: activity.date.toISOString().split('T')[0], // Return ISO date format (YYYY-MM-DD)
      completed: activity.tasksCompleted,
      created: activity.tasksCreated,
      focusMinutes: activity.totalFocusMinutes,
      distractions: activity.distractionsCount
    }))

    res.json({ completionTrend: trend })
  } catch (error) {
    res.status(500).json({ message: 'Error getting completion trend', error: error.message })
  }
}

// Get productivity insights
exports.getProductivityInsights = async (req, res) => {
  try {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const [activities, sessions, tasks, user] = await Promise.all([
      UserActivity.find({ userId: req.userId, date: { $gte: last30Days } }),
      StudySession.find({ userId: req.userId, startTime: { $gte: last30Days } }),
      Task.find({ userId: req.userId, createdAt: { $gte: last30Days } }),
      User.findById(req.userId)
    ])

    const totalFocusHours = activities.reduce((sum, a) => sum + a.totalFocusMinutes, 0) / 60
    const totalTasksCompleted = activities.reduce((sum, a) => sum + a.tasksCompleted, 0)
    const totalDistractions = activities.reduce((sum, a) => sum + a.distractionsCount, 0)
    const avgFocusScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length
      : 0

    // Find peak productivity hours
    const hourDistribution = {}
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours()
      hourDistribution[hour] = (hourDistribution[hour] || 0) + session.durationMinutes
    })

    const peakHour = Object.entries(hourDistribution).sort((a, b) => b[1] - a[1])[0]

    // Calculate productivity score
    const productivityScore = Math.min(100, Math.round(
      (totalTasksCompleted * 5) +
      (avgFocusScore * 5) +
      (user.streak * 2) -
      (totalDistractions * 0.5)
    ))

    const insights = {
      totalFocusHours: Math.round(totalFocusHours),
      totalTasksCompleted,
      totalDistractions,
      avgFocusScore: Math.round(avgFocusScore),
      peakProductivityHour: peakHour ? `${peakHour[0]}:00` : '9:00',
      productivityScore: Math.max(0, productivityScore),
      completionRate: tasks.length > 0 ? Math.round((totalTasksCompleted / tasks.length) * 100) : 0,
      currentStreak: user.streak,
      level: user.level
    }

    res.json({ insights })
  } catch (error) {
    res.status(500).json({ message: 'Error getting insights', error: error.message })
  }
}

// Get all analytics data in one call
exports.getAllAnalytics = async (req, res) => {
  try {
    const [weeklyPattern, subjectDistribution, completionTrend, insights] = await Promise.all([
      exports.getWeeklyPatternData(req.userId),
      exports.getSubjectDistributionData(req.userId),
      exports.getCompletionTrendData(req.userId),
      exports.getProductivityInsightsData(req.userId)
    ])

    res.json({
      weeklyPattern,
      subjectDistribution,
      completionTrend,
      insights
    })
  } catch (error) {
    res.status(500).json({ message: 'Error getting analytics', error: error.message })
  }
}

// Get recent study sessions
exports.getRecentSessions = async (req, res) => {
  try {
    const { limit = 5 } = req.query
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .select('subject durationMinutes focusScore startTime taskId')
      .lean()

    res.json({ sessions })
  } catch (error) {
    res.status(500).json({ message: 'Error getting recent sessions', error: error.message })
  }
}

// Helper functions
exports.getWeeklyPatternData = async (userId) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const sessions = await StudySession.aggregate([
    { $match: { userId, startTime: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dayOfWeek: '$startTime' },
        hours: { $sum: { $divide: ['$durationMinutes', 60] } },
        sessions: { $sum: 1 }
      }
    }
  ])

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return dayNames.map((day, index) => ({
    day,
    hours: sessions.find(s => s._id === index + 1)?.hours || 0,
    sessions: sessions.find(s => s._id === index + 1)?.sessions || 0
  }))
}

exports.getSubjectDistributionData = async (userId) => {
  return await StudySession.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$subject',
        hours: { $sum: { $divide: ['$durationMinutes', 60] } },
        tasksCompleted: { $sum: { $cond: ['$completedTask', 1, 0] } }
      }
    },
    { $project: { subject: '$_id', hours: { $round: ['$hours', 1] }, tasksCompleted: 1 } }
  ])
}

exports.getCompletionTrendData = async (userId) => {
  const activities = await UserActivity.find({ userId }).sort({ date: -1 }).limit(14)
  return activities.reverse().map(activity => ({
    date: activity.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completed: activity.tasksCompleted,
    focusMinutes: Math.round(activity.totalFocusMinutes / 60)
  }))
}

exports.getProductivityInsightsData = async (userId) => {
  const user = await User.findById(userId)
  const tasks = await Task.find({ userId })
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  return {
    productivityScore: Math.min(100, Math.round((completedTasks / (tasks.length || 1)) * 100 + user.streak)),
    completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
    currentStreak: user.streak,
    level: user.level,
    totalXp: user.totalXp
  }
}
