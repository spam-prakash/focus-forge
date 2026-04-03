const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  streak: {
    type: Number,
    default: 0
  },
  totalXp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  distractionHoursThisWeek: {
    type: Number,
    default: 0
  },
  focusHoursThisWeek: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Calculate level based on XP (virtual)
userSchema.virtual('levelInfo').get(function () {
  return {
    currentLevel: this.level,
    xpToNextLevel: 100 - (this.totalXp % 100),
    currentXp: this.totalXp % 100
  }
})

module.exports = mongoose.model('User', userSchema)
