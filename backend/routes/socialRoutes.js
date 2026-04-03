const express = require('express')
const router = express.Router()
const socialController = require('../controllers/socialController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.get('/compare', socialController.getCompare)

module.exports = router
