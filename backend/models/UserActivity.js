const mongoose = require('mongoose')

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalFocusMinutes: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  tasksCreated: {
    type: Number,
    default: 0
  },
  distractionsCount: {
    type: Number,
    default: 0
  },
  priorityScoreSum: {
    type: Number,
    default: 0
  }
})

userActivitySchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('UserActivity', userActivitySchema)
