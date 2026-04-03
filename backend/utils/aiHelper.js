// Pure JavaScript AI implementation - No external dependencies needed!

class TaskAnalyzer {
  constructor () {
    this.taskVectors = new Map()
  }

  // Analyze task complexity based on title and description
  analyzeComplexity (title, description = '') {
    const text = `${title} ${description}`.toLowerCase()
    
    // Complexity indicators
    const indicators = {
      high: ['complex', 'difficult', 'hard', 'challenging', 'advanced', 'comprehensive', 'research', 'analysis', 'essay', 'project'],
      medium: ['moderate', 'average', 'standard', 'regular', 'review', 'practice', 'summary'],
      low: ['simple', 'easy', 'basic', 'quick', 'short', 'watch', 'read', 'submit']
    }
    
    let score = 1.5 // Base score
    
    indicators.high.forEach(word => {
      if (text.includes(word)) score += 0.5
    })
    indicators.medium.forEach(word => {
      if (text.includes(word)) score += 0.25
    })
    indicators.low.forEach(word => {
      if (text.includes(word)) score -= 0.25
    })
    
    // Length indicators
    if (text.length > 200) score += 0.3
    if ((title.match(/\band\b/g) || []).length > 2) score += 0.2
    if (title.length > 50) score += 0.2
    
    return Math.min(5, Math.max(1, Math.round(score)))
  }

  // Extract keywords from task
  extractKeywords (title, description = '') {
    const text = `${title} ${description}`.toLowerCase()
    const words = text.split(/\W+/)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']
    
    const wordCount = {}
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })
    
    const keywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
    
    return keywords.length > 0 ? keywords : ['general']
  }

  // Suggest task breakdown
  suggestBreakdown (title, complexity) {
    const breakdowns = {
      5: [
        '📚 Research and gather materials (30 min)',
        '📝 Create detailed outline/plan (20 min)',
        '💻 Main work/implementation (1 hour)',
        '🔍 Review and refine (30 min)',
        '✨ Final polish and submit (20 min)'
      ],
      4: [
        '📖 Review requirements and notes (15 min)',
        '✍️ Complete main work (45 min)',
        '✅ Review and submit (15 min)'
      ],
      3: [
        '🎯 Quick preparation (10 min)',
        '⚡ Complete task (30 min)',
        '📋 Review and submit (10 min)'
      ],
      2: [
        '🚀 Start task (5 min)',
        '💪 Complete task (20 min)',
        '✔️ Submit (5 min)'
      ],
      1: [
        '✨ Quick task - do it now! (10-15 min)'
      ]
    }
    
    const level = Math.min(5, Math.max(1, complexity))
    return breakdowns[level]
  }

  // Categorize task by subject
  categorizeTask (title, description = '') {
    const text = `${title} ${description}`.toLowerCase()
    const subjects = {
      Mathematics: ['math', 'calculus', 'algebra', 'geometry', 'statistics', 'numbers', 'equation'],
      Physics: ['physics', 'mechanics', 'thermodynamics', 'quantum', 'motion', 'force', 'energy'],
      'Computer Science': ['programming', 'code', 'algorithm', 'data structure', 'web dev', 'javascript', 'python', 'java'],
      English: ['essay', 'writing', 'literature', 'grammar', 'reading', 'poem', 'vocabulary'],
      Chemistry: ['chemistry', 'chemical', 'reaction', 'molecule', 'periodic', 'lab'],
      Biology: ['biology', 'cell', 'dna', 'evolution', 'ecology', 'organism'],
      History: ['history', 'historical', 'war', 'revolution', 'ancient', 'timeline'],
      Business: ['business', 'marketing', 'finance', 'management', 'economics', 'accounting']
    }
    
    for (const [subject, keywords] of Object.entries(subjects)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return subject
      }
    }
    return 'General Studies'
  }
}

class TimePredictor {
  constructor () {
    this.history = []
  }

  recordCompletion (task, actualMinutes) {
    this.history.push({
      complexity: task.complexity || 3,
      estimatedMinutes: (task.estimatedHours || 2) * 60,
      actualMinutes,
      subject: task.subject || 'general',
      timeOfDay: new Date().getHours()
    })
    
    // Keep only last 100 records
    if (this.history.length > 100) this.history.shift()
  }

  predictTime (task) {
    const similarTasks = this.history.filter(h =>
      Math.abs(h.complexity - (task.complexity || 3)) <= 1 &&
      h.subject === (task.subject || 'general')
    )
    
    if (similarTasks.length === 0) {
      const baseTime = (task.complexity || 3) * 30
      const minTime = Math.max(15, baseTime - 15)
      const maxTime = baseTime + 15
      return `${minTime}-${maxTime} minutes`
    }

    const avgTime = similarTasks.reduce((sum, t) => sum + t.actualMinutes, 0) / similarTasks.length
    const variance = Math.min(30, avgTime * 0.2)
    
    return `${Math.round(avgTime - variance)}-${Math.round(avgTime + variance)} minutes`
  }
}

class FocusAnalyzer {
  constructor () {
    this.sessions = []
  }

  addSession (session) {
    this.sessions.push({
      startTime: session.startTime,
      durationMinutes: session.durationMinutes,
      focusScore: session.focusScore || 7
    })
    if (this.sessions.length > 100) this.sessions.shift()
  }

  getOptimalStudyTimes () {
    const hourScores = new Array(24).fill(0)
    const hourCounts = new Array(24).fill(0)
    
    this.sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours()
      hourScores[hour] += session.focusScore
      hourCounts[hour]++
    })
    
    const optimalTimes = []
    for (let i = 0; i < 24; i++) {
      if (hourCounts[i] > 0) {
        const avgScore = hourScores[i] / hourCounts[i]
        optimalTimes.push({
          hour: i,
          score: Math.round(avgScore * 10) / 10,
          timeLabel: this.formatHour(i)
        })
      }
    }

    // If no data, provide default recommendations
    if (optimalTimes.length === 0) {
      return [
        { hour: 9, score: 8, timeLabel: '9 AM' },
        { hour: 14, score: 7, timeLabel: '2 PM' },
        { hour: 19, score: 6, timeLabel: '7 PM' }
      ]
    }

    return optimalTimes.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  detectBurnoutRisk (recentSessions) {
    if (!recentSessions || recentSessions.length === 0) {
      return {
        risk: 'LOW',
        factors: ['Not enough data to analyze'],
        recommendation: 'Keep tracking your study sessions to get personalized insights!'
      }
    }

    let totalWorkMinutes = 0
    let totalFocusScore = 0
    
    recentSessions.forEach(session => {
      totalWorkMinutes += session.durationMinutes || 0
      totalFocusScore += session.focusScore || 7
    })
    
    const avgFocusScore = totalFocusScore / recentSessions.length
    const dailyAverage = totalWorkMinutes / 7
    const riskFactors = []
    
    if (dailyAverage > 240) riskFactors.push('⚠️ High daily workload (>4 hours)')
    if (avgFocusScore < 5) riskFactors.push('📉 Decreasing focus scores')
    if (recentSessions.length < 3) riskFactors.push('📊 Inconsistent study pattern')
    
    return {
      risk: riskFactors.length >= 2 ? 'HIGH' : riskFactors.length === 1 ? 'MEDIUM' : 'LOW',
      factors: riskFactors.length > 0 ? riskFactors : ["✅ You're maintaining healthy study habits!"],
      recommendation: this.getRecommendation(riskFactors.length)
    }
  }

  formatHour (hour) {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`
  }

  getRecommendation (riskCount) {
    if (riskCount >= 2) {
      return "Take a break! You're showing signs of burnout. Consider reducing workload for 2-3 days. 🧘"
    }
    if (riskCount === 1) {
      return 'Your study patterns show some strain. Try taking regular 5-min breaks every 30 minutes. 🎯';
    }
    return 'Great work-life balance! Keep maintaining your current schedule. 🌟';
  }
}

class PriorityNeuralNet {
  constructor () {
    this.weights = {
      deadline: 0.4,
      difficulty: 0.3,
      marksWeight: 0.2,
      backlog: 0.1
    }
  }

  updateWeights (task, userAction) {
    if (userAction.completedEarly) {
      this.weights.deadline = Math.min(0.6, this.weights.deadline + 0.05)
      this.weights.difficulty = Math.max(0.2, this.weights.difficulty - 0.02)
    }
    if (userAction.postponed) {
      this.weights.difficulty = Math.min(0.5, this.weights.difficulty + 0.05)
      this.weights.deadline = Math.max(0.3, this.weights.deadline - 0.02)
    }

    // Normalize weights
    const total = Object.values(this.weights).reduce((a, b) => a + b, 0)
    Object.keys(this.weights).forEach(key => {
      this.weights[key] = parseFloat((this.weights[key] / total).toFixed(2))
    })
  }

  getWeights () {
    return this.weights
  }
}

class MotivationPredictor {
  constructor () {
    this.patterns = []
  }

  analyzeMotivationPattern (sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        bestDay: 'Monday',
        bestHour: 9,
        averageMotivation: 6,
        prediction: 'Start with small tasks to build momentum! 🚀'
      }
    }

    const motivationByDay = [0, 0, 0, 0, 0, 0, 0]
    const motivationByHour = new Array(24).fill(0)
    let sessionCount = 0
    
    sessions.forEach(session => {
      const day = new Date(session.startTime).getDay()
      const hour = new Date(session.startTime).getHours()
      const focusScore = session.focusScore || 7
      motivationByDay[day] += focusScore
      motivationByHour[hour] += focusScore
      sessionCount++
    })
    
    const avgMotivation = (motivationByDay.reduce((a, b) => a + b, 0) +
                          motivationByHour.reduce((a, b) => a + b, 0)) / (24 + 7) / (sessionCount || 1)
    
    let prediction = '';
    if (avgMotivation > 7) {
      prediction = '🔥 High motivation today! Tackle your hardest tasks first!';
    } else if (avgMotivation > 5) {
      prediction = '📈 Good energy level. Start with medium-difficulty tasks.';
    } else if (avgMotivation > 3) {
      prediction = '💪 Moderate motivation. Break tasks into smaller pieces.';
    } else {
      prediction = '🌟 Low energy day. Complete one small task to build momentum!';
    }

    return {
      bestDay: this.getBestDay(motivationByDay),
      bestHour: this.getBestHour(motivationByHour),
      averageMotivation: Math.round(avgMotivation * 10) / 10,
      prediction
    }
  }

  getBestDay (scores) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const maxIndex = scores.indexOf(Math.max(...scores))
    return maxIndex >= 0 ? days[maxIndex] : 'Monday';
  }

  getBestHour (scores) {
    const maxIndex = scores.indexOf(Math.max(...scores))
    return maxIndex >= 0 ? maxIndex : 9
  }
}

module.exports = {
  TaskAnalyzer,
  TimePredictor,
  FocusAnalyzer,
  PriorityNeuralNet,
  MotivationPredictor
}
