const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const priorityRoutes = require('./routes/priorityRoutes')
const reportRoutes = require('./routes/reportRoutes')
const socialRoutes = require('./routes/socialRoutes')

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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
