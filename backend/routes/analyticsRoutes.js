const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analyticsController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.post('/track-session', analyticsController.trackStudySession)
router.get('/recent-sessions', analyticsController.getRecentSessions)
router.get('/weekly-pattern', analyticsController.getWeeklyPattern)
router.get('/subject-distribution', analyticsController.getSubjectDistribution)
router.get('/completion-trend', analyticsController.getCompletionTrend)
router.get('/insights', analyticsController.getProductivityInsights)
router.get('/all', analyticsController.getAllAnalytics)

module.exports = router
