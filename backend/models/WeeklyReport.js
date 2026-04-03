const mongoose = require('mongoose')

const weeklyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  totalFocusHours: {
    type: Number,
    default: 0
  },
  totalDistractionHours: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  timeSaved: {
    type: Number,
    default: 0
  },
  rankVsPeers: {
    type: String,
    default: 'Average'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema)
