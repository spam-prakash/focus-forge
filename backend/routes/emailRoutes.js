const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const { emailQueue } = require('../services/emailQueue')
const User = require('../models/User')

// Test email sending
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    await emailQueue.add({
      type: 'welcome',
      to: user.email,
      name: user.name,
      data: {}
    })
    res.json({ message: 'Test email sent!' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update email preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { emailNotifications, weeklyReport, deadlineReminders } = req.body
    await User.findByIdAndUpdate(req.userId, {
      settings: {
        emailNotifications,
        weeklyReport,
        deadlineReminders
      }
    })
    res.json({ message: 'Email preferences updated' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Send manual weekly report
router.post('/send-weekly-report', authMiddleware, async (req, res) => {
  try {
    const { scheduleWeeklyReports } = require('../services/emailQueue')
    await scheduleWeeklyReports()
    res.json({ message: 'Weekly reports scheduled!' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
