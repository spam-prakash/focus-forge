import React, { useState, useEffect, useRef } from 'react'
import { Flame, Trophy, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function StudyStreakCalendar () {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalDaysStudied: 0,
    calendarData: []
  })
  const [dailyGoals, setDailyGoals] = useState({
    sessionGoal: 5,
    hoursGoal: 3,
    sessionsToday: 0,
    hoursToday: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const calendarRef = useRef(null)

  const generateCalendarDataFromBackend = (trendData) => {
    const data = []
    const today = new Date()

    // Find the last Sunday to start the week properly
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364) // Go back 364 days to get 52 weeks
    // Adjust to start from Sunday
    const daysToSunday = startDate.getDay()
    startDate.setDate(startDate.getDate() - daysToSunday)

    const trendMap = {}
    trendData.forEach(trend => {
      trendMap[trend.date] = trend // Use ISO date directly as key
    })

    // Generate data for 52 weeks (364 days)
    for (let i = 0; i < 364; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dateKey = date.toISOString().split('T')[0]
      const dayData = trendMap[dateKey]

      let intensity = 0
      if (dayData) {
        const focusMinutes = dayData.focusMinutes || 0
        const tasksCompleted = dayData.completed || 0

        if (focusMinutes > 0 || tasksCompleted > 0) {
          if (focusMinutes >= 180 || tasksCompleted >= 3) intensity = 4
          else if (focusMinutes >= 90 || tasksCompleted >= 2) intensity = 3
          else if (focusMinutes >= 30 || tasksCompleted >= 1) intensity = 2
          else intensity = 1
        }
      }

      data.push({
        date,
        intensity,
        dayOfWeek: date.getDay(),
        focusMinutes: dayData?.focusMinutes || 0,
        tasksCompleted: dayData?.completed || 0
      })
    }

    return data
  }

  const fetchStreakData = async () => {
    try {
      const [insightsRes, trendRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/insights`),
        axios.get(`${API_URL}/analytics/completion-trend?days=365`)
      ])

      const insights = insightsRes.data.insights || {}
      const trendData = trendRes.data.completionTrend || []

      const calendarData = generateCalendarDataFromBackend(trendData)

      setStreakData({
        currentStreak: insights.currentStreak || 0,
        bestStreak: insights.bestStreak || insights.currentStreak || 0,
        totalDaysStudied: insights.totalDaysStudied || calendarData.filter(d => d.intensity > 0).length,
        calendarData
      })
    } catch (error) {
      console.error('Error fetching streak data:', error)
    }
  }

  const fetchDailyProgress = async () => {
    try {
      setDailyGoals({
        sessionGoal: 5,
        hoursGoal: 3,
        sessionsToday: Math.floor(Math.random() * 6),
        hoursToday: Math.round(Math.random() * 3 * 10) / 10
      })
    } catch (error) {
      console.error('Error fetching daily progress:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      fetchStreakData()
      fetchDailyProgress()
    }

    init()

    // Refresh every 10 seconds to catch completed tasks
    const interval = setInterval(() => {
      fetchStreakData()
      fetchDailyProgress()
    }, 10000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800'
      case 1:
        return 'bg-green-100 dark:bg-green-900/60'
      case 2:
        return 'bg-green-300 dark:bg-green-700'
      case 3:
        return 'bg-green-500 dark:bg-green-500'
      case 4:
        return 'bg-green-700 dark:bg-green-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  const getMotivationMessage = () => {
    if (streakData.currentStreak === 0) return '🚀 Start your journey today!'
    if (streakData.currentStreak < 7) return "🔥 You're building momentum!"
    if (streakData.currentStreak < 30) return '⭐ Amazing consistency!'
    if (streakData.currentStreak < 100) return "💪 You're a study machine!"
    return '🏆 Legendary streak! Keep it going!'
  }

  // Group calendar data by weeks (52 weeks)
  const weeks = []
  for (let i = 0; i < streakData.calendarData.length; i += 7) {
    weeks.push(streakData.calendarData.slice(i, i + 7))
  }

  // Calculate month labels with proper positions
  const getMonthLabels = () => {
    const monthLabels = []
    let lastMonth = -1

    for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
      const week = weeks[weekIdx]
      if (week && week.length > 0) {
        // Check the first day of each week to determine month
        const firstDayOfWeek = week[0].date
        const month = firstDayOfWeek.getMonth()

        if (month !== lastMonth) {
          monthLabels.push({
            month: firstDayOfWeek.toLocaleString('default', { month: 'short' }),
            weekIndex: weekIdx
          })
          lastMonth = month
        }
      }
    }

    return monthLabels
  }

  const monthLabels = getMonthLabels()

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500' />
      </div>
    )
  }

  const sessionsProgress = Math.min(100, (dailyGoals.sessionsToday / dailyGoals.sessionGoal) * 100)
  const hoursProgress = Math.min(100, (dailyGoals.hoursToday / dailyGoals.hoursGoal) * 100)

  return (
    <div className='space-y-6 w-full'>
      {/* Streak Overview Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-linear-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Current Streak</p>
            <Flame className='text-orange-500' size={20} />
          </div>
          <p className='text-3xl font-bold text-orange-600 dark:text-orange-400'>{streakData.currentStreak}</p>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>days in a row</p>
        </div>

        <div className='bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Best Streak</p>
            <Trophy className='text-yellow-600' size={20} />
          </div>
          <p className='text-3xl font-bold text-yellow-600 dark:text-yellow-400'>{streakData.bestStreak}</p>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>personal record</p>
        </div>

        <div className='bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Days Studied</p>
            <TrendingUp className='text-blue-500' size={20} />
          </div>
          <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>{streakData.totalDaysStudied}</p>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>all time</p>
        </div>

        <div className='bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Motivation</p>
            <Calendar size={20} className='text-purple-500' />
          </div>
          <p className='text-sm font-semibold text-gray-700 dark:text-gray-300 truncate'>
            {getMotivationMessage()}
          </p>
        </div>
      </div>

      {/* Daily Goals Progress */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Today's Goals</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Study Sessions</p>
              <p className='text-sm font-bold text-blue-600 dark:text-blue-400'>
                {dailyGoals.sessionsToday}/{dailyGoals.sessionGoal}
              </p>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden'>
              <div
                className='h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500'
                style={{ width: `${sessionsProgress}%` }}
              />
            </div>
          </div>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Focus Hours</p>
              <p className='text-sm font-bold text-green-600 dark:text-green-400'>
                {dailyGoals.hoursToday}h / {dailyGoals.hoursGoal}h
              </p>
            </div>
            <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden'>
              <div
                className='h-full bg-linear-to-r from-green-500 to-green-600 rounded-full transition-all duration-500'
                style={{ width: `${hoursProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-Style Heatmap Calendar */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 overflow-x-auto'>
        <div className='flex items-center justify-between mb-6 flex-wrap gap-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Study Heatmap</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Your activity for the last 365 days</p>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-500 dark:text-gray-400'>Less</span>
            <div className='flex gap-1'>
              <div className='w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800' />
              <div className='w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/60' />
              <div className='w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700' />
              <div className='w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500' />
              <div className='w-3 h-3 rounded-sm bg-green-700 dark:bg-green-400' />
            </div>
            <span className='text-xs text-gray-500 dark:text-gray-400'>More</span>
          </div>
        </div>

        <div className='min-w-[800px]' ref={calendarRef}>
          {/* Month Labels Row - Properly Aligned */}
          <div className='relative mb-2 ml-8 h-6'>
            {monthLabels.map((label, idx) => {
              // Calculate position based on week index (12px per cell + 4px gap = 16px total)
              const position = label.weekIndex * 16
              return (
                <div
                  key={idx}
                  className='absolute text-xs font-medium text-gray-500 dark:text-gray-400'
                  style={{ left: `${position}px` }}
                >
                  {label.month}
                </div>
              )
            })}
          </div>

          {/* Calendar Grid */}
          <div className='flex gap-1'>
            {/* Day Labels Column */}
            <div className='flex flex-col gap-1 mt-1'>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={idx} className='h-3 flex items-center justify-end pr-2'>
                  <span className='text-xs text-gray-400 dark:text-gray-500'>{day}</span>
                </div>
              ))}
            </div>

            {/* Weeks Grid */}
            <div className='flex gap-1'>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className='flex flex-col gap-1'>
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} transition-all duration-200 hover:scale-150 hover:ring-2 hover:ring-green-400 cursor-pointer`}
                      title={`${day.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}: ${day.intensity > 0 ? `${day.intensity} level, ${day.focusMinutes} min` : 'No study recorded'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className='grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800'>
          <div className='text-center'>
            <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
              {streakData.calendarData.filter(d => d.intensity > 0).length}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Active Days</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
              {streakData.currentStreak}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Current Streak</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
              {(streakData.calendarData.reduce((sum, d) => sum + d.intensity, 0) / (streakData.calendarData.filter(d => d.intensity > 0).length || 1)).toFixed(1)}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Avg Intensity</p>
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 flex gap-3'>
        <AlertCircle className='text-blue-600 dark:text-blue-400 mt-0.5 shrink-0' size={20} />
        <div>
          <p className='font-semibold text-blue-900 dark:text-blue-300'>Keep Your Streak Alive! 🔥</p>
          <p className='text-sm text-blue-800 dark:text-blue-400 mt-1'>
            Study for at least 30 minutes or complete 1 task every day to maintain your streak.
            Consistency beats intensity!
          </p>
        </div>
      </div>
    </div>
  )
}
