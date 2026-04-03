import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useTaskStore } from '../store/taskStore'
import StudySessionTracker from '../components/StudySessionTracker'
import StudyStreakCalendar from '../components/StudyStreakCalendar'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts'
import {
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  Download,
  Target,
  Zap,
  Brain
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Analytics () {
  const { user } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()

  // State for real data from backend
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyPattern, setWeeklyPattern] = useState([])
  const [priorityDistribution, setPriorityDistribution] = useState([])
  const [completionTrend, setCompletionTrend] = useState([])
  const [subjectDistribution, setSubjectDistribution] = useState([])
  const [insights, setInsights] = useState({
    productivityScore: 0,
    completionRate: 0,
    totalFocusHours: 0,
    totalTasksCompleted: 0,
    avgFocusScore: 0,
    peakProductivityHour: '9:00',
    currentStreak: 0,
    level: 1,
    totalDistractions: 0
  })

  useEffect(() => {
    fetchAllAnalytics()
    fetchTasks('all')
  }, [])

  const fetchAllAnalytics = async () => {
    setIsLoading(true)
    try {
      // Fetch all analytics data from backend
      const [weeklyRes, subjectRes, trendRes, insightsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/weekly-pattern`),
        axios.get(`${API_URL}/analytics/subject-distribution`),
        axios.get(`${API_URL}/analytics/completion-trend?days=30`),
        axios.get(`${API_URL}/analytics/insights`)
      ])

      setWeeklyPattern(weeklyRes.data.weeklyPattern || [])
      setSubjectDistribution(subjectRes.data.subjectDistribution || [])
      setCompletionTrend(trendRes.data.completionTrend || [])
      setInsights(insightsRes.data.insights || insights)

      // Calculate priority distribution from real tasks
      if (tasks.length > 0) {
        const high = tasks.filter(t => t.priorityScore >= 0.7 && t.status === 'pending').length
        const medium = tasks.filter(t => t.priorityScore >= 0.3 && t.priorityScore < 0.7 && t.status === 'pending').length
        const low = tasks.filter(t => t.priorityScore < 0.3 && t.status === 'pending').length

        setPriorityDistribution([
          { name: 'High Priority', value: high, color: '#ef4444' },
          { name: 'Medium Priority', value: medium, color: '#f59e0b' },
          { name: 'Low Priority', value: low, color: '#10b981' }
        ])
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = () => {
    const reportText = `
╔══════════════════════════════════════════════════════════╗
║              FOCUSFORGE ANALYTICS REPORT                 ║
║                    ${new Date().toLocaleDateString()}                    ║
╚══════════════════════════════════════════════════════════╝

📊 COMPLETION RATE: ${insights.completionRate}%

🎯 PRODUCTIVITY SCORE: ${insights.productivityScore}/100

⏰ TOTAL FOCUS HOURS: ${insights.totalFocusHours}h

✅ TASKS COMPLETED: ${insights.totalTasksCompleted}

⭐ AVG FOCUS SCORE: ${insights.avgFocusScore}/10

🔥 CURRENT STREAK: ${insights.currentStreak} days

📈 LEVEL: ${insights.level}

⚡ PEAK HOUR: ${insights.peakProductivityHour}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 SUBJECT BREAKDOWN
${subjectDistribution.map(subj =>
  `• ${subj.subject.padEnd(16)}: ${subj.hours}h • ${subj.tasksCompleted || 0} tasks`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 WEEKLY PATTERN
${weeklyPattern.map(day =>
  `${day.day.padEnd(12)}: ${day.hours}h • ${day.sessions} sessions`
).join('\n')}

Keep forging your focus! 🔥
    `
    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focusforge-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded!')
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
      </div>
    )
  }

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4']

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center flex-wrap gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Analytics Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400'>Real-time insights from your study data</p>
        </div>
        <button
          onClick={downloadReport}
          className='px-4 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition'
        >
          <Download size={20} /> Export Report
        </button>
      </div>

      {/* Unified Study Session Tracker - Premium Section */}
      <StudySessionTracker onSessionSaved={fetchAllAnalytics} />

      {/* Study Streak Calendar & Daily Goals */}
      <StudyStreakCalendar />

      {/* Key Metrics Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Productivity Score</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{insights.productivityScore}</p>
            </div>
            <Zap className='text-yellow-500' size={28} />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Focus Hours</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{insights.totalFocusHours}h</p>
            </div>
            <Clock className='text-blue-500' size={28} />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Completion Rate</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{insights.completionRate}%</p>
            </div>
            <Target className='text-green-500' size={28} />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Current Streak</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{insights.currentStreak} days</p>
            </div>
            <Award className='text-purple-500' size={28} />
          </div>
        </div>
      </div>

      {/* Weekly Study Pattern */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Weekly Study Pattern</h3>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={weeklyPattern}>
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis dataKey='day' stroke='#6b7280' />
              <YAxis yAxisId='left' stroke='#6b7280' />
              <YAxis yAxisId='right' orientation='right' stroke='#6b7280' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar yAxisId='left' dataKey='hours' name='Study Hours' fill='#3b82f6' radius={[8, 8, 0, 0]} />
              <Line yAxisId='right' type='monotone' dataKey='sessions' name='Sessions' stroke='#10b981' strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Distribution & Subject Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Priority Distribution */}
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Priority Distribution</h3>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey='value'
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Subject Distribution</h3>
          {subjectDistribution.length > 0
            ? (
              <div className='space-y-3'>
                {subjectDistribution.map((subject, index) => (
                  <div key={index} className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                    <div className='flex items-center gap-3'>
          <div className='w-3 h-3 rounded-full' style={{ backgroundColor: COLORS[index % COLORS.length] }} />
          <span className='font-medium text-gray-900 dark:text-white'>{subject.subject}</span>
        </div>
                    <div className='text-right'>
          <p className='font-semibold text-gray-900 dark:text-white'>{subject.hours} hours</p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>{subject.sessions || 0} sessions</p>
        </div>
                  </div>
                ))}
              </div>
              )
            : (
              <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
                <Brain size={48} className='mx-auto mb-2 opacity-50' />
                <p>No study data yet</p>
                <p className='text-sm'>Start tracking your sessions above!</p>
              </div>
              )}
        </div>
      </div>

      {/* Completion Trend */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Completion Trend (Last 30 Days)</h3>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={completionTrend}>
              <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
              <XAxis dataKey='date' stroke='#6b7280' />
              <YAxis stroke='#6b7280' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area type='monotone' dataKey='completed' name='Tasks Completed' stroke='#10b981' fill='#10b981' fillOpacity={0.6} />
              <Area type='monotone' dataKey='focusMinutes' name='Focus Minutes' stroke='#3b82f6' fill='#3b82f6' fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800'>
          <div className='flex items-center gap-2 mb-3'>
            <TrendingUp className='text-blue-600 dark:text-blue-400' size={20} />
            <h3 className='font-semibold text-blue-900 dark:text-blue-300'>Peak Performance Time</h3>
          </div>
          <p className='text-2xl font-bold text-blue-900 dark:text-blue-200'>{insights.peakProductivityHour}</p>
          <p className='text-sm text-blue-700 dark:text-blue-400 mt-2'>Your most productive hours</p>
        </div>

        <div className='bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800'>
          <div className='flex items-center gap-2 mb-3'>
            <Brain className='text-purple-600 dark:text-purple-400' size={20} />
            <h3 className='font-semibold text-purple-900 dark:text-purple-300'>Average Focus Score</h3>
          </div>
          <p className='text-2xl font-bold text-purple-900 dark:text-purple-200'>{insights.avgFocusScore}/10</p>
          <p className='text-sm text-purple-700 dark:text-purple-400 mt-2'>Based on your self-assessment</p>
        </div>
      </div>

      {/* Pain Reminder */}
      {insights.totalDistractions > 0 && (
        <div className='bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='text-red-600 dark:text-red-500 mt-0.5' size={24} />
            <div>
              <p className='font-semibold text-red-800 dark:text-red-300'>⚠️ Pain Reminder</p>
              <p className='text-red-700 dark:text-red-400'>
                You've recorded {insights.totalDistractions} distractions across your study sessions.
                Each distraction costs ~15 minutes of focus. That's {insights.totalDistractions * 15} minutes lost!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      <div className='bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800'>
        <h3 className='font-semibold text-green-900 dark:text-green-300 mb-2'>Level Progress</h3>
        <div className='flex justify-between text-sm mb-2'>
          <span>Level {insights.level}</span>
          <span>→ Level {insights.level + 1}</span>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-full h-3 overflow-hidden'>
          <div
            className='bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full transition-all duration-500'
            style={{ width: `${(user?.totalXp % 100)}%` }}
          />
        </div>
        <p className='text-sm text-green-700 dark:text-green-400 mt-2'>
          {100 - (user?.totalXp % 100)} XP to next level!
        </p>
      </div>
    </div>
  )
}
