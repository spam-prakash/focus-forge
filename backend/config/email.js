const nodemailer = require('nodemailer')

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', or custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS // Your app password (not regular password)
  }
})

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error)
  } else {
    console.log('✅ Email service ready to send messages')
  }
})

// Email templates
const emailTemplates = {
  // Welcome email
  welcome: (name) => ({
    subject: '🎉 Welcome to FocusForge! Let\'s Forge Your Focus',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1;">🔥 FocusForge</h1>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; color: white;">
          <h2 style="margin: 0 0 10px 0;">Welcome ${name}! 👋</h2>
          <p style="margin: 0; opacity: 0.9;">You've taken the first step towards mastering your productivity!</p>
        </div>
        <div style="padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Getting Started:</h3>
          <ul style="color: #4b5563;">
            <li>📝 Add your first task</li>
            <li>🎯 Set priority levels</li>
            <li>⏰ Start a study session</li>
            <li>📊 Track your analytics</li>
          </ul>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          <p>Stay focused, stay productive! 🔥</p>
        </div>
      </div>
    `
  }),

  // Daily reminder
  dailyReminder: (name, pendingTasks) => ({
    subject: `📌 FocusForge: You have ${pendingTasks} tasks waiting!`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1; text-align: center;">🔥 FocusForge</h1>
        <div style="background: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">Good morning ${name}! ☀️</p>
          <p style="margin: 10px 0 0 0; color: #92400e;">You have <strong>${pendingTasks} pending tasks</strong> waiting for your attention.</p>
        </div>
        <div style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Your Tasks →</a>
        </div>
      </div>
    `
  }),

  // Weekly report
  weeklyReport: (name, stats) => ({
    subject: `📊 Your FocusForge Weekly Report - ${stats.weekRange}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; text-align: center; color: white;">
          <h2 style="margin: 0;">Weekly Report</h2>
          <p style="margin: 5px 0 0;">${stats.weekRange}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #10b981;">${stats.tasksCompleted}</div>
            <div style="color: #6b7280; font-size: 12px;">Tasks Completed</div>
          </div>
          <div style="background: #eff6ff; padding: 15px; border-radius: 10px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${stats.focusHours}</div>
            <div style="color: #6b7280; font-size: 12px;">Focus Hours</div>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 10px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">${stats.streak}</div>
            <div style="color: #6b7280; font-size: 12px;">Day Streak</div>
          </div>
          <div style="background: #f3e8ff; padding: 15px; border-radius: 10px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #8b5cf6;">${stats.completionRate}%</div>
            <div style="color: #6b7280; font-size: 12px;">Completion Rate</div>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 10px;">
          <h3 style="margin: 0 0 10px; color: #374151;">🏆 Achievements This Week</h3>
          <ul style="color: #4b5563; margin: 0;">
            ${stats.achievements.map(ach => `<li>${ach}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL}/analytics" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Detailed Analytics →</a>
        </div>
      </div>
    `
  }),

  // Deadline reminder
  deadlineReminder: (name, tasks) => ({
    subject: `⚠️ FocusForge: ${tasks.length} task(s) due soon!`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fee2e2; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444;">
          <p style="margin: 0; color: #991b1b;">⚠️ Urgent Reminder ${name}!</p>
          <p style="margin: 10px 0 0 0; color: #991b1b;">The following tasks are due soon:</p>
        </div>
        
        <div style="margin: 20px 0;">
          ${tasks.map(task => `
            <div style="background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px;">
              <h4 style="margin: 0; color: #374151;">${task.title}</h4>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 12px;">Due: ${new Date(task.deadline).toLocaleString()}</p>
            </div>
          `).join('')}
        </div>
        
        <a href="${process.env.FRONTEND_URL}/tasks" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Complete Tasks Now →</a>
      </div>
    `
  }),

  // Study streak milestone
  streakMilestone: (name, streak) => ({
    subject: `🔥 Amazing! ${streak} day streak on FocusForge!`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center;">
          <div style="font-size: 64px;">🔥</div>
          <h1 style="color: #6366f1;">${streak} Day Streak!</h1>
          <p style="color: #6b7280;">Congratulations ${name}! You're on fire!</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 20px; border-radius: 15px; text-align: center; color: white; margin: 20px 0;">
          <p style="margin: 0;">You've been consistent for ${streak} days in a row!</p>
          <p style="margin: 10px 0 0; font-size: 14px;">Keep the momentum going! 💪</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Continue Your Streak →</a>
        </div>
      </div>
    `
  })
}

module.exports = { transporter, emailTemplates }
