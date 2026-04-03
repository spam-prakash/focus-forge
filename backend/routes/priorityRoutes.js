const express = require('express')
const router = express.Router()
const priorityController = require('../controllers/priorityController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.get('/focus', priorityController.getFocusTask)
router.post('/recalculate', priorityController.recalculateAllScores)

module.exports = router
