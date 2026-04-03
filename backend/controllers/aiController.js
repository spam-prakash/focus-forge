const {
  TaskAnalyzer,
  TimePredictor,
  FocusAnalyzer,
  PriorityNeuralNet,
  MotivationPredictor
} = require('../utils/aiHelper')
const Task = require('../models/Task')
const StudySession = require('../models/StudySession')
const User = require('../models/User')

// Initialize AI services
const taskAnalyzer = new TaskAnalyzer()
const timePredictor = new TimePredictor()
const focusAnalyzer = new FocusAnalyzer()
const priorityNet = new PriorityNeuralNet()
const motivationPredictor = new MotivationPredictor()

// 1. SMART TASK PRIORITIZATION
exports.getSmartPrioritization = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId, status: 'pending' })
    
    if (tasks.length === 0) {
      return res.json({
        prioritizedTasks: [],
        aiInsight: '🎉 No pending tasks! Great job!',
        weights: priorityNet.getWeights()
      })
    }

    // Get personalized weights from neural network
    const weights = priorityNet.getWeights()
    const currentHour = new Date().getHours()
    
    // Get user's optimal study times
    const sessions = await StudySession.find({
      userId: req.userId,
      startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    sessions.forEach(session => focusAnalyzer.addSession(session))
    const optimalTimes = focusAnalyzer.getOptimalStudyTimes()
    const isOptimalTime = optimalTimes.some(t => Math.abs(t.hour - currentHour) <= 2)
    
    const prioritizedTasks = tasks.map(task => {
      // Calculate deadline score
      const hoursLeft = Math.max(0, (new Date(task.deadline) - new Date()) / (1000 * 60 * 60))
      let deadlineScore = 0.3
      if (hoursLeft <= 0) deadlineScore = 1.0
      else if (hoursLeft <= 24) deadlineScore = 0.9
      else if (hoursLeft <= 72) deadlineScore = 0.7
      else if (hoursLeft <= 168) deadlineScore = 0.5
      else deadlineScore = 0.3
      
      // Calculate personalized score
      let score = (
        deadlineScore * weights.deadline +
        (task.difficulty / 5) * weights.difficulty +
        task.marksWeight * weights.marksWeight +
        Math.min(task.backlogCount / 10, 1) * weights.backlog
      )
      
      // Adjust based on user's focus patterns
      if (isOptimalTime) score *= 1.2
      
      // Get AI recommendation
      let recommendation = '';
      let urgency = '';

      if (score >= 0.7) {
        recommendation = '🔥 CRITICAL - Do this NOW';
        urgency = 'This task is extremely urgent based on deadline and importance!';
      } else if (score >= 0.5) {
        recommendation = '🎯 HIGH Priority - Focus today';
        urgency = 'Complete this today to stay on track!';
      } else if (score >= 0.3) {
        recommendation = '📌 MEDIUM - Schedule this week';
        urgency = 'Plan this for later this week.';
      } else {
        recommendation = '⏰ LOW priority - Can wait';
        urgency = 'This can be done when you have free time.';
      }

      // Analyze complexity
      const complexity = taskAnalyzer.analyzeComplexity(task.title, task.description || '')
      const keywords = taskAnalyzer.extractKeywords(task.title, task.description || '')
      
      return {
        ...task.toObject(),
        aiScore: Math.round(score * 100),
        aiRecommendation: recommendation,
        aiUrgency: urgency,
        complexity,
        keywords: keywords.slice(0, 3),
        predictedTime: complexity <= 2 ? '15-30 minutes' : complexity <= 4 ? '45-90 minutes' : '2+ hours'
      }
    })
    
    prioritizedTasks.sort((a, b) => b.aiScore - a.aiScore)
    
    // Generate AI insight
    let aiInsight = '';
    const topTask = prioritizedTasks[0]
    
    if (topTask && isOptimalTime) {
      aiInsight = `🎯 You're in your peak focus time (${optimalTimes[0]?.timeLabel || 'now'}). Start with "${topTask.title}" - it's your highest priority!`
    } else if (topTask) {
      aiInsight = `📊 Based on your patterns, focus on "${topTask.title}" first. It has the highest priority score.`
    } else {
      aiInsight = '✨ All caught up! Add some tasks to get AI recommendations.';
    }

    res.json({
      prioritizedTasks,
      aiInsight,
      weights,
      optimalTime: isOptimalTime,
      peakHour: optimalTimes[0]?.timeLabel
    })
  } catch (error) {
    console.error('Smart prioritization error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 2. PREDICTIVE DEADLINES - Estimate completion time
exports.predictCompletionTime = async (req, res) => {
  try {
    const { taskId } = req.params
    const task = await Task.findById(taskId)
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Analyze task complexity
    const complexity = taskAnalyzer.analyzeComplexity(task.title, task.description || '')
    const keywords = taskAnalyzer.extractKeywords(task.title, task.description || '')
    const subject = taskAnalyzer.categorizeTask(task.title, task.description || '')
    
    // Get similar completed tasks for reference
    const similarTasks = await Task.find({
      userId: req.userId,
      status: 'completed',
      title: { $regex: keywords.slice(0, 2).join('|'), $options: 'i' }
    }).limit(5)
    
    // Calculate average time from similar tasks
    let averageTime = null
    if (similarTasks.length > 0) {
      const totalTime = similarTasks.reduce((sum, t) => sum + (t.actualHours || t.estimatedHours || 1), 0)
      averageTime = totalTime / similarTasks.length
    }

    // Predict time based on complexity
    let predictedMinutes
    let difficultyLabel
    
    if (complexity >= 4) {
      predictedMinutes = 120 + (complexity - 4) * 30
      difficultyLabel = 'Complex task';
    } else if (complexity >= 3) {
      predictedMinutes = 60 + (complexity - 3) * 30
      difficultyLabel = 'Moderate task';
    } else {
      predictedMinutes = 30 + (complexity - 1) * 15
      difficultyLabel = 'Simple task';
    }

    // Adjust with similar tasks data
    if (averageTime) {
      predictedMinutes = (predictedMinutes + averageTime * 60) / 2
    }

    const predictedHours = Math.round(predictedMinutes / 15) * 15 // Round to nearest 15 min
    const predictedHoursDisplay = predictedHours >= 60 
      ? `${Math.floor(predictedHours / 60)}h ${predictedHours % 60}m` 
      : `${predictedHours}m`
    
    let aiTip = '';
    if (complexity >= 4) {
      aiTip = '💡 This task is complex! Consider breaking it down into smaller subtasks for better focus.';
    } else if (complexity <= 2) {
      aiTip = '⚡ Quick task! You could knock this out in a focused short session.';
    } else {
      aiTip = '🎯 This task requires moderate effort. Schedule it during your peak focus hours.';
    }

    res.json({
      taskId: task._id,
      title: task.title,
      complexity,
      difficultyLabel,
      predictedTime: predictedHoursDisplay,
      predictedMinutes: Math.round(predictedMinutes),
      estimatedTime: `${task.estimatedHours} hours (your estimate)`,
      subject,
      keywords,
      similarTasksCount: similarTasks.length,
      aiTip,
      recommendation: averageTime 
        ? `Based on ${similarTasks.length} similar tasks, this should take about ${predictedHoursDisplay}.`
        : `Based on complexity analysis, this should take about ${predictedHoursDisplay}.`
    })
  } catch (error) {
    console.error('Time prediction error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 3. FOCUS TIME PREDICTION - Find optimal study times
exports.getOptimalStudyTimes = async (req, res) => {
  try {
    // Load user's study sessions from last 30 days
    const sessions = await StudySession.find({
      userId: req.userId,
      startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    
    sessions.forEach(session => focusAnalyzer.addSession(session))
    
    const optimalTimes = focusAnalyzer.getOptimalStudyTimes()
    const burnoutRisk = focusAnalyzer.detectBurnoutRisk(sessions.slice(-14))
    
    // Get task recommendations for optimal times
    const tasks = await Task.find({ userId: req.userId, status: 'pending' })
      .sort({ priorityScore: -1 })
      .limit(3)
    
    let recommendation = '';
    if (optimalTimes.length > 0) {
      recommendation = `🎯 Your most productive time is ${optimalTimes[0].timeLabel}. Schedule your most important tasks then!`
    } else {
      recommendation = '📊 Complete more study sessions so I can learn your optimal times!';
    }

    res.json({
      optimalStudyTimes: optimalTimes,
      burnoutRisk,
      recommendation,
      suggestedTasksForPeakTime: tasks,
      aiTip: burnoutRisk.risk === 'HIGH' 
        ? "⚠️ You're at risk of burnout! Take a break and rest today."
        : '✨ Try studying during your predicted peak hours for better focus!'
    })
  } catch (error) {
    console.error('Optimal times error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 4. TASK BREAKDOWN AI - Split complex tasks
exports.suggestTaskBreakdown = async (req, res) => {
  try {
    const { taskId } = req.params
    const task = await Task.findById(taskId)
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const complexity = taskAnalyzer.analyzeComplexity(task.title, task.description || '')
    const subtasks = taskAnalyzer.suggestBreakdown(task.title, complexity)
    const subject = taskAnalyzer.categorizeTask(task.title, task.description || '')
    
    let aiMessage = '';
    let estimatedTotal = 0
    
    if (complexity >= 4) {
      aiMessage = '🧩 This task is complex! Breaking it down will make it much more manageable. Complete one subtask at a time.';
      estimatedTotal = subtasks.length * 45
    } else if (complexity >= 3) {
      aiMessage = '📋 This task has moderate complexity. These subtasks will help you stay organized.';
      estimatedTotal = subtasks.length * 30
    } else {
      aiMessage = "⚡ This task is straightforward. You can probably do it in one sitting, but here's a simple breakdown."
      estimatedTotal = subtasks.length * 20
    }

    res.json({
      originalTask: task.title,
      originalDescription: task.description,
      complexity,
      complexityLabel: complexity >= 4 ? 'High' : complexity >= 3 ? 'Medium' : 'Low',
      subject,
      suggestedSubtasks: subtasks,
      subtasksCount: subtasks.length,
      estimatedTotalMinutes: estimatedTotal,
      estimatedTotalDisplay: estimatedTotal >= 60 
        ? `${Math.floor(estimatedTotal / 60)}h ${estimatedTotal % 60}m` 
        : `${estimatedTotal}m`,
      aiMessage,
      tip: 'Start with the first subtask - completing small wins builds momentum! 🚀'
    })
  } catch (error) {
    console.error('Task breakdown error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 5. MOTIVATION PREDICTION
exports.getMotivationPrediction = async (req, res) => {
  try {
    const sessions = await StudySession.find({
      userId: req.userId,
      startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    
    const prediction = motivationPredictor.analyzeMotivationPattern(sessions)
    
    // Get tasks that match motivation level
    const tasks = await Task.find({ userId: req.userId, status: 'pending' })
      .sort({ priorityScore: -1 })
    
    let recommendedTasks = []
    let encouragement = '';

    if (prediction.averageMotivation > 7) {
      recommendedTasks = tasks.slice(0, 3)
      encouragement = "🚀 You're in peak form! Tackle your most challenging tasks right now!"
    } else if (prediction.averageMotivation > 5) {
      recommendedTasks = tasks.slice(0, 2)
      encouragement = '📈 Good energy level! Start with medium-difficulty tasks to build momentum.';
    } else if (prediction.averageMotivation > 3) {
      recommendedTasks = tasks.slice(0, 1)
      encouragement = '💪 Start with one small task. Completing it will boost your motivation!';
    } else {
      recommendedTasks = []
      encouragement = "🌟 It's okay to have low energy days. Take a break, then try a 5-minute task to restart."
    }

    // Get motivational quote
    const quotes = [
      'The secret of getting ahead is getting started. - Mark Twain',
      "You don't have to be great to start, but you have to start to be great. - Zig Ziglar",
      'Small daily improvements are the key to staggering long-term results. - Robin Sharma',
      'The future depends on what you do today. - Mahatma Gandhi',
      "Don't watch the clock; do what it does. Keep going. - Sam Levenson"
    ]
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    
    res.json({
      motivationPrediction: prediction,
      recommendedTasks,
      encouragement,
      motivationalQuote: randomQuote,
      actionSuggestion: prediction.averageMotivation > 6 
        ? '🎯 Schedule your hardest task now!'
        : '📝 Try the Pomodoro technique: 25 min work, 5 min break'
    })
  } catch (error) {
    console.error('Motivation prediction error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 6. PERSONALIZED STUDY PLAN
exports.generateStudyPlan = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId, status: 'pending' })
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ startTime: -1 })
      .limit(50)
    
    const optimalTimes = focusAnalyzer.getOptimalStudyTimes()
    const motivation = motivationPredictor.analyzeMotivationPattern(sessions)
    
    // Group tasks by subject
    const tasksBySubject = {}
    tasks.forEach(task => {
      const subject = taskAnalyzer.categorizeTask(task.title, task.description || '')
      if (!tasksBySubject[subject]) tasksBySubject[subject] = []
      tasksBySubject[subject].push(task)
    })
    
    // Generate daily plan for the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const dailyPlan = []
    
    days.forEach((day, index) => {
      const optimalHour = optimalTimes[index % optimalTimes.length] || { timeLabel: '9 AM', hour: 9 }
      const tasksForDay = tasks.slice(0, Math.min(2, tasks.length))
      
      dailyPlan.push({
        day,
        bestTime: optimalHour.timeLabel,
        recommendedTasks: tasksForDay.map(t => ({
          id: t._id,
          title: t.title,
          estimatedHours: t.estimatedHours
        })),
        estimatedHours: tasksForDay.reduce((sum, t) => sum + t.estimatedHours, 0),
        focusLevel: day === motivation.bestDay ? 'High 🔥' : index < 5 ? 'Medium 📈' : 'Low 🌟',
        tip: day === motivation.bestDay 
          ? '⭐ Your best day! Schedule important tasks here.' 
          : index < 5 ? 'Regular day - maintain consistency.' : 'Light day - rest and review.'
      })
    })
    
    // Calculate weekly goal
    const weeklyGoal = Math.min(tasks.length, 10)
    const estimatedWeeklyHours = tasks.slice(0, weeklyGoal).reduce((sum, t) => sum + t.estimatedHours, 0)
    
    res.json({
      studyPlan: dailyPlan,
      weeklyGoal: `Complete ${weeklyGoal} tasks this week`,
      estimatedWeeklyHours: Math.round(estimatedWeeklyHours),
      aiInsights: {
        bestDay: motivation.bestDay,
        bestHour: motivation.bestHour,
        recommendedDailyDuration: estimatedWeeklyHours > 15 ? '3-4 hours' : '2-3 hours',
        subjectsToPrioritize: Object.keys(tasksBySubject).slice(0, 3),
        productivityPrediction: tasks.length > 5 
          ? 'You have several tasks. Break them into smaller chunks!'
          : 'Great! Your workload looks manageable this week.'
      },
      encouragement: `You've got this! Focus on ${dailyPlan[0].recommendedTasks[0]?.title || 'your top priority'} tomorrow morning. 💪`
    })
  } catch (error) {
    console.error('Study plan error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 7. AI ASSISTANT CHAT
exports.aiAssistant = async (req, res) => {
  try {
    const { question } = req.body
    const user = await User.findById(req.userId)
    const tasks = await Task.find({ userId: req.userId, status: 'pending' })
    const completedTasks = await Task.find({ userId: req.userId, status: 'completed' })
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ startTime: -1 })
      .limit(30)
    
    const questionLower = question.toLowerCase()
    let response = '';
    let context = '';

    // Smart response based on question type
    if (questionLower.includes('priority') || questionLower.includes('important') || questionLower.includes('focus')) {
      const highPriority = tasks.filter(t => t.priorityScore >= 0.7)
      if (highPriority.length > 0) {
        response = `🎯 You have ${highPriority.length} high priority tasks. Your top priority is "${highPriority[0].title}" due ${new Date(highPriority[0].deadline).toLocaleDateString()}.`
        context = 'Focus on this task first thing tomorrow morning!';
      } else if (tasks.length > 0) {
        response = `📋 You have ${tasks.length} pending tasks. None are critically urgent, so you can plan them strategically.`
        context = 'Try the Pomodoro technique: 25 min work, 5 min break.';
      } else {
        response = '🎉 No pending tasks! Great job staying on top of your work!';
        context = 'Use this free time to review notes or prepare for upcoming assignments.';
      }
    } else if (questionLower.includes('productivity') || questionLower.includes('performance')) {
      const totalTasks = tasks.length + completedTasks.length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0
      const totalFocusHours = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60
      
      response = `📊 Your completion rate is ${completionRate}%. You've studied ${Math.round(totalFocusHours)} hours in the last 30 days.`
      if (completionRate > 70) {
        context = '🔥 Excellent productivity! Keep up the great momentum!';
      } else if (completionRate > 40) {
        context = '📈 Good progress! Try breaking large tasks into smaller pieces.';
      } else {
        context = '💪 Start with one small task today. Small wins build momentum!';
      }
    } else if (questionLower.includes('break') || questionLower.includes('rest')) {
      const avgSessionLength = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / (sessions.length || 1)
      if (avgSessionLength > 90) {
        response = "🧘 You've been studying in long sessions. Taking a 15-minute break every 90 minutes can improve focus by 30%!"
      } else {
        response = '☕ Taking regular 5-minute breaks every 25-30 minutes (Pomodoro) is scientifically proven to boost productivity!';
      }
      context = 'Why not take a short break right now? Stretch, hydrate, or take a quick walk!';
    } else if (questionLower.includes('motivation') || questionLower.includes('procrastinate')) {
      const recentCompletions = completedTasks.filter(t =>
        t.completedAt && new Date(t.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
      
      if (recentCompletions === 0) {
        response = "🌟 Everyone has off days! Start with a 5-minute task to build momentum. You've got this!"
      } else {
        response = `🔥 You completed ${recentCompletions} tasks last week! That's awesome progress. Keep the streak going!`
      }
      context = 'Remember: Consistency > Intensity. Small daily actions lead to big results!';
    } else if (questionLower.includes('schedule') || questionLower.includes('plan') || questionLower.includes('when')) {
      const optimalTimes = focusAnalyzer.getOptimalStudyTimes()
      if (optimalTimes.length > 0) {
        response = `⏰ Based on your history, your most productive time is ${optimalTimes[0].timeLabel}.`
        context = `Try scheduling your hardest tasks around ${optimalTimes[0].timeLabel} for best results!`
      } else {
        response = "📅 Track a few more study sessions, and I'll identify your peak productivity hours!"
        context = 'For now, morning hours (9-11 AM) are generally great for focused work.';
      }
    } else if (questionLower.includes('task breakdown') || questionLower.includes('subtask')) {
      const complexTask = tasks.find(t => t.priorityScore >= 0.6)
      if (complexTask) {
        const subtasks = taskAnalyzer.suggestBreakdown(complexTask.title, 4)
        response = `🧩 For "${complexTask.title}", try breaking it into: ${subtasks.slice(0, 3).join(', ')}`
        context = 'Completing small subtasks feels rewarding and builds momentum!';
      } else {
        response = '💡 Most tasks can be broken down! Try splitting your current task into 2-3 smaller steps.';
        context = "Example: 'Write essay' → Research → Outline → Write → Edit"
      }
    } else {
      response = "🤖 I'm your AI study assistant! Ask me about:\n\n• Priorities ('What should I focus on?')\n• Productivity ('How am I doing?')\n• Breaks ('When should I take a break?')\n• Motivation ('Help me stay motivated')\n• Schedule ('When should I study?')\n• Task breakdown ('Help me break down tasks')"
      context = "Just type your question naturally, and I'll help you out!"
    }

    res.json({
      question,
      answer: response,
      context,
      timestamp: new Date().toISOString(),
      followUp: 'Need more help? Just ask! 😊'
    })
  } catch (error) {
    console.error('AI Assistant error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 8. UPDATE AI WEIGHTS - Learn from user behavior
exports.updateAiWeights = async (req, res) => {
  try {
    const { taskId, action } = req.body
    const task = await Task.findById(taskId)
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Update neural network weights based on user action
    if (action === 'completed_early') {
      priorityNet.updateWeights(task, { completedEarly: true })
    } else if (action === 'postponed') {
      priorityNet.updateWeights(task, { postponed: true })
    } else if (action === 'completed') {
      // Record completion time for future predictions
      const duration = task.actualHours ? task.actualHours * 60 : task.estimatedHours * 60
      const complexity = taskAnalyzer.analyzeComplexity(task.title, task.description || '')
      const subject = taskAnalyzer.categorizeTask(task.title, task.description || '')
      
      timePredictor.recordCompletion({
        complexity,
        estimatedHours: task.estimatedHours,
        subject
      }, duration)
    }

    const newWeights = priorityNet.getWeights()
    
    let feedbackMessage = '';
    if (action === 'completed_early') {
      feedbackMessage = "✨ Thanks! I've learned that deadlines are important to you. I'll adjust future recommendations."
    } else if (action === 'postponed') {
      feedbackMessage = "📝 Noted! I'll consider task difficulty more in future prioritizations."
    } else {
      feedbackMessage = '🧠 AI model updated with your feedback! My recommendations will keep improving.';
    }

    res.json({
      message: feedbackMessage,
      newWeights,
      action,
      taskTitle: task.title
    })
  } catch (error) {
    console.error('Update weights error:', error)
    res.status(500).json({ message: error.message })
  }
}

// 9. GET AI INSIGHTS DASHBOARD
exports.getAiDashboard = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
    const completedTasks = tasks.filter(t => t.status === 'completed')
    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const sessions = await StudySession.find({ userId: req.userId })
      .sort({ startTime: -1 })
      .limit(50)
    
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
    const optimalTimes = focusAnalyzer.getOptimalStudyTimes()
    const motivation = motivationPredictor.analyzeMotivationPattern(sessions)
    const burnoutRisk = focusAnalyzer.detectBurnoutRisk(sessions.slice(-14))
    
    // Generate smart insights
    const insights = []
    
    if (pendingTasks.length > 5) {
      insights.push('📚 You have several pending tasks. Consider breaking them down into smaller pieces.')
    }

    if (completionRate < 50 && tasks.length > 0) {
      insights.push('🎯 Your completion rate is below 50%. Try focusing on one task at a time.')
    }

    if (optimalTimes.length > 0) {
      insights.push(`⏰ Your peak productivity time is ${optimalTimes[0].timeLabel}. Schedule important tasks then!`)
    }

    if (burnoutRisk.risk === 'HIGH') {
      insights.push("⚠️ You're showing signs of burnout. Take a break and rest today!")
    } else if (burnoutRisk.risk === 'MEDIUM') {
      insights.push('📉 Your study patterns show strain. Try taking regular breaks.')
    }

    if (motivation.averageMotivation > 7) {
      insights.push("🔥 You're highly motivated! Tackle your most challenging tasks now.")
    } else if (motivation.averageMotivation < 4) {
      insights.push('🌟 Low energy day. Start with one small task to build momentum.')
    }

    if (insights.length === 0) {
      insights.push("✨ You're doing great! Keep maintaining your current study habits.")
    }

    res.json({
      summary: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        completionRate: Math.round(completionRate),
        studySessions: sessions.length,
        totalFocusHours: Math.round(sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60)
      },
      optimalTimes,
      motivationLevel: motivation.averageMotivation,
      burnoutRisk: burnoutRisk.risk,
      insights,
      tip: 'Ask me anything about your studies using the AI Assistant! 💬'
    })
  } catch (error) {
    console.error('AI Dashboard error:', error)
    res.status(500).json({ message: error.message })
  }
}
