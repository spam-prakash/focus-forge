const WeeklyReport = require('../models/WeeklyReport')
const Task = require('../models/Task')
const User = require('../models/User')

exports.getWeeklyReport = async (req, res) => {
  try {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    let report = await WeeklyReport.findOne({
      userId: req.userId,
      weekStart
    })

    if (!report) {
      // Generate fresh report
      const tasksCompleted = await Task.countDocuments({
        userId: req.userId,
        status: 'completed',
        completedAt: { $gte: weekStart }
      })

      const user = await User.findById(req.userId)

      report = new WeeklyReport({
        userId: req.userId,
        weekStart,
        totalFocusHours: user.focusHoursThisWeek || 0,
        totalDistractionHours: user.distractionHoursThisWeek || 0,
        tasksCompleted,
        timeSaved: (user.focusHoursThisWeek || 0) * 0.2 // Placeholder
      })

      await report.save()
    }

    // Calculate pain reminder
    const lostHours = report.totalDistractionHours
    let painMessage = ''
    if (lostHours > 20) painMessage = `⚠️ You lost ${lostHours} hours this week. That's ${Math.floor(lostHours / 8)} full days of study.`
    else if (lostHours > 10) painMessage = `😬 ${lostHours} hours lost to distractions. You could've completed ${Math.floor(lostHours / 3)} assignments.`
    else if (lostHours > 5) painMessage = `📉 ${lostHours} hours slipped away. Small changes = big gains.`
    else painMessage = `✅ Great job! Only ${lostHours} hours lost. Keep forging!`

    res.json({ report, painMessage })
  } catch (error) {
    res.status(500).json({ message: 'Error generating report' })
  }
}
