const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const aiController = require('../controllers/aiController')

// Apply auth middleware to all AI routes
router.use(authMiddleware)

// AI Features Routes
router.get('/smart-prioritization', aiController.getSmartPrioritization)
router.get('/predict-time/:taskId', aiController.predictCompletionTime)
router.get('/optimal-study-times', aiController.getOptimalStudyTimes)
router.get('/task-breakdown/:taskId', aiController.suggestTaskBreakdown)
router.get('/motivation-prediction', aiController.getMotivationPrediction)
router.get('/study-plan', aiController.generateStudyPlan)
router.post('/assistant', aiController.aiAssistant)
router.post('/update-weights', aiController.updateAiWeights)
router.get('/dashboard', aiController.getAiDashboard)  // ← ADD THIS LINE HERE

module.exports = router