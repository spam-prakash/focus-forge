const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const socialController = require('../controllers/socialController')

// Apply auth middleware to all routes
router.use(authMiddleware)

// Define routes - make sure each references a valid controller function
router.get('/leaderboard', socialController.getLeaderboard)
router.get('/my-rank', socialController.getMyRank)
router.get('/weekly-challenge', socialController.getWeeklyChallenge)
router.get('/friend-activity', socialController.getFriendActivity)
router.get('/community-stats', socialController.getCommunityStats)
router.get('/compare/:friendId', socialController.compareWithFriend)

module.exports = router
