const Queue = require('bull')
const { transporter, emailTemplates } = require('../config/email')
const User = require('../models/User')
const Task = require('../models/Task')

// Create email queue
const emailQueue = new Queue('email-queue', {
  redis: { host: 'localhost', port: 6379 } // Optional: add Redis for production
})

// Process emails
emailQueue.process(async (job) => {
  const { type, to, name, data } = job.data
  
  let emailContent
  switch (type) {
    case 'welcome':
      emailContent = emailTemplates.welcome(name)
      break;
    case 'daily-reminder':
      emailContent = emailTemplates.dailyReminder(name, data.pendingTasks)
      break;
    case 'weekly-report':
      emailContent = emailTemplates.weeklyReport(name, data)
      break;
    case 'deadline-reminder':
      emailContent = emailTemplates.deadlineReminder(name, data.tasks)
      break;
    case 'streak-milestone':
      emailContent = emailTemplates.streakMilestone(name, data.streak)
      break;
    default:
      return
  }

  await transporter.sendMail({
    from: `"FocusForge" <${process.env.EMAIL_USER}>`,
    to,
    subject: emailContent.subject,
    html: emailContent.html
  })
  
  console.log(`📧 Email sent: ${type} to ${to}`)
})

// Schedule daily reminders (runs at 9 AM)
const scheduleDailyReminders = async () => {
  const users = await User.find({ 'settings.emailNotifications': true })
  
  for (const user of users) {
    const pendingTasks = await Task.countDocuments({
      userId: user._id,
      status: 'pending'
    })
    
    if (pendingTasks > 0) {
      await emailQueue.add({
        type: 'daily-reminder',
        to: user.email,
        name: user.name,
        data: { pendingTasks }
      })
    }
  }
}

// Schedule weekly reports (runs every Monday at 8 AM)
const scheduleWeeklyReports = async () => {
  const users = await User.find({ 'settings.weeklyReport': true })
  
  for (const user of users) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const tasks = await Task.find({
      userId: user._id,
      completedAt: { $gte: weekStart }
    })
    
    const studySessions = await StudySession.find({
      userId: user._id,
      startTime: { $gte: weekStart }
    })
    
    const totalFocusMinutes = studySessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const tasksCompleted = tasks.length
    const completionRate = tasksCompleted > 0 ? (tasksCompleted / await Task.countDocuments({ userId: user._id })) * 100 : 0
    
    const achievements = []
    if (tasksCompleted >= 10) achievements.push('🎯 Completed 10+ tasks')
    if (user.streak >= 7) achievements.push(`🔥 ${user.streak} day streak`)
    if (totalFocusMinutes >= 600) achievements.push('⏰ 10+ hours of focus')
    
    await emailQueue.add({
      type: 'weekly-report',
      to: user.email,
      name: user.name,
      data: {
        weekRange: `${weekStart.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
        tasksCompleted,
        focusHours: Math.round(totalFocusMinutes / 60),
        streak: user.streak,
        completionRate: Math.round(completionRate),
        achievements
      }
    })
  }
}

// Check deadlines every hour
const checkDeadlines = async () => {
  const upcomingDeadlines = await Task.find({
    status: 'pending',
    deadline: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
    }
  }).populate('userId', 'email name settings')
  
  // Group by user
  const userTasks = {}
  for (const task of upcomingDeadlines) {
    if (!userTasks[task.userId._id]) {
      userTasks[task.userId._id] = {
        user: task.userId,
        tasks: []
      }
    }
    userTasks[task.userId._id].tasks.push(task)
  }

  for (const userId in userTasks) {
    const { user, tasks } = userTasks[userId]
    if (user.settings?.emailNotifications !== false) {
      await emailQueue.add({
        type: 'deadline-reminder',
        to: user.email,
        name: user.name,
        data: { tasks }
      })
    }
  }
}

// Check streak milestones (7, 14, 21, 30, 50, 100 days)
const checkStreakMilestones = async () => {
  const milestoneDays = [7, 14, 21, 30, 50, 100]
  const users = await User.find({ streak: { $in: milestoneDays } })
  
  for (const user of users) {
    // Check if we already sent notification for this streak
    const milestoneKey = `streak_${user.streak}_sent`
    if (!user[milestoneKey]) {
      await emailQueue.add({
        type: 'streak-milestone',
        to: user.email,
        name: user.name,
        data: { streak: user.streak }
      })
      
      // Mark as sent
      await User.findByIdAndUpdate(user._id, { [milestoneKey]: true })
    }
  }
}

// Send welcome email
const sendWelcomeEmail = async (user) => {
  await emailQueue.add({
    type: 'welcome',
    to: user.email,
    name: user.name,
    data: {}
  })
};

module.exports = {
  emailQueue,
  sendWelcomeEmail,
  scheduleDailyReminders,
  scheduleWeeklyReports,
  checkDeadlines,
  checkStreakMilestones
}
