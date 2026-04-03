const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const analyticsRoutes = require('./routes/analyticsRoutes')

const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const priorityRoutes = require('./routes/priorityRoutes')
const reportRoutes = require('./routes/reportRoutes')
const socialRoutes = require('./routes/socialRoutes')
const emailRoutes = require('./routes/emailRoutes')
const { scheduleDailyReminders, scheduleWeeklyReports, checkDeadlines, checkStreakMilestones } = require('./services/emailQueue')
// const aiRoutes = require('./routes/aiRoutes')

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://myproductionapp.com'
]

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps / Postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  })
)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/priority', priorityRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/email', emailRoutes)
// app.use('/api/ai', aiRoutes)

// Start scheduled jobs
setInterval(() => {
  // Run daily at 9 AM
  const now = new Date()
  if (now.getHours() === 9 && now.getMinutes() === 0) {
    scheduleDailyReminders()
  }

  // Run weekly on Monday at 8 AM
  if (now.getDay() === 1 && now.getHours() === 8 && now.getMinutes() === 0) {
    scheduleWeeklyReports()
  }

  // Check deadlines every hour
  checkDeadlines()

  // Check streak milestones daily
  if (now.getHours() === 10 && now.getMinutes() === 0) {
    checkStreakMilestones()
  }
}, 60000) // Check every minute
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
