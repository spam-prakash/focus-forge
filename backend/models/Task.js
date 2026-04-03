const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  deadline: {
    type: Date,
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  marksWeight: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  estimatedHours: {
    type: Number,
    required: true,
    min: 0.5,
    max: 100
  },
  actualHours: {
    type: Number,
    default: null
  },
  backlogCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'postponed'],
    default: 'pending'
  },
  priorityScore: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Index for faster queries
taskSchema.index({ userId: 1, status: 1, priorityScore: -1 })

module.exports = mongoose.model('Task', taskSchema)
