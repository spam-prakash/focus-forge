const WeeklyReport = require('../models/WeeklyReport')
const User = require('../models/User')

exports.getCompare = async (req, res) => {
  try {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    
    const userReport = await WeeklyReport.findOne({
      userId: req.userId,
      weekStart
    })
    
    // Get all reports for this week
    const allReports = await WeeklyReport.find({ weekStart })
    const avgTasksCompleted = allReports.reduce((sum, r) => sum + r.tasksCompleted, 0) / (allReports.length || 1)
    
    let rank = 'Average'
    if (userReport && userReport.tasksCompleted > avgTasksCompleted * 1.5) rank = 'Top 10% 🔥'
    else if (userReport && userReport.tasksCompleted > avgTasksCompleted) rank = 'Above Average 📈'
    else if (userReport && userReport.tasksCompleted < avgTasksCompleted * 0.5) rank = 'Needs Focus ⚠️'
    
    const shareText = `FocusForge Weekly Report: ${userReport?.tasksCompleted || 0} tasks completed! ${userReport?.totalFocusHours || 0} hours of focus. ${rank === 'Top 10% 🔥' ? 'Crushing it!' : 'Keep going!'}`
    
    res.json({
      rank,
      avgTasksCompleted,
      yourTasks: userReport?.tasksCompleted || 0,
      shareText
    })
  } catch (error) {
    res.status(500).json({ message: 'Error generating comparison' })
  }
}
