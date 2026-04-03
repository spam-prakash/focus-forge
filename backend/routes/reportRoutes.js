const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.get('/weekly', reportController.getWeeklyReport)

module.exports = router
