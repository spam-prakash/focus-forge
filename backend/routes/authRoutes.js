const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User') // ← ADD THIS LINE

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware, authController.getMe)

router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select('-password')
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' })
  }
})

router.post('/forgot-password', async (req, res) => {
  // Implement password reset logic
  res.json({ message: 'Reset link sent' })
})

router.put('/update-settings', authMiddleware, async (req, res) => {
  const { notifications, weeklyReport, painReminders } = req.body
  await User.findByIdAndUpdate(req.userId, {
    settings: { notifications, weeklyReport, painReminders }
  })
  res.json({ message: 'Settings updated' })
})

module.exports = router
