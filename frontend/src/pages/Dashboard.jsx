import React, { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useAuthStore } from '../store/authStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { Target, Flame, Award, Clock, TrendingUp, AlertCircle, BarChart3, PieChart } from 'lucide-react'

export default function Dashboard () {
  const { focusTask, fetchFocusTask } = useTaskStore()
  const { user } = useAuthStore()
  const { insights, weeklyPattern, subjectDistribution, fetchInsights, fetchWeeklyPattern, fetchSubjectDistribution } = useAnalyticsStore()

  useEffect(() => {
    fetchFocusTask()
    fetchInsights()
    fetchWeeklyPattern()
    fetchSubjectDistribution()
  }, [])

  // Get today's date for calculating data
  const today = new Date()
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]

  // Find today's data from weekly pattern
  const todayData = weeklyPattern.find((d) => d.day === dayOfWeek) || {}

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Dashboard</h1>
        <p className='text-gray-600 dark:text-gray-400'>Welcome back, {user?.name}! Let's forge some focus 🔥</p>
      </div>

      {/* Focus Task - Main Feature */}
      {focusTask?.hasTask && (
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-blue-100 text-sm mb-2'>🎯 YOUR FOCUS FOR TODAY</p>
              <h2 className='text-2xl font-bold mb-2'>{focusTask.task.title}</h2>
              <p className='text-blue-100 mb-4'>{focusTask.recommendation}</p>
              <div className='flex flex-wrap gap-4 text-sm'>
                <span>Priority Score: {(focusTask.priorityScore * 100).toFixed(0)}%</span>
                <span>Due: {new Date(focusTask.task.deadline).toLocaleDateString()}</span>
                <span>Est. {focusTask.task.estimatedHours} hours</span>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-4xl font-bold'>🔥</div>
              <p className='text-sm mt-2'>Focus on THIS</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Streak</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{user?.streak || 0} days</p>
            </div>
            <Flame className='text-orange-500' size={32} />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Level</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{user?.level || 1}</p>
            </div>
            <Award className='text-yellow-500' size={32} />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Total XP</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{user?.totalXp || 0}</p>
            </div>
            <TrendingUp className='text-green-500' size={32} />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Today's Hours</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{todayData.hours?.toFixed(1) || 0}h</p>
            </div>
            <Clock className='text-blue-500' size={32} />
          </div>
        </div>
      </div>

      {/* Productivity Score & Insights */}
      {Object.keys(insights).length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Productivity Score</h3>
              <TrendingUp className='text-purple-500' size={24} />
            </div>
            <div className='flex items-end gap-3'>
              <div className='text-5xl font-bold text-purple-600 dark:text-purple-400'>{insights.productivityScore || 0}</div>
              <div className='text-xl text-gray-600 dark:text-gray-400 mb-2'>/100</div>
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>Based on tasks completed, focus quality, and streak</p>
          </div>

          <div className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Last 30 Days</h3>
              <BarChart3 className='text-blue-500' size={24} />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Tasks Completed</p>
                <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{insights.totalTasksCompleted || 0}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>Focus Hours</p>
                <p className='text-2xl font-bold text-cyan-600 dark:text-cyan-400'>{insights.totalFocusHours || 0}h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Pattern */}
      {weeklyPattern && weeklyPattern.length > 0 && (
        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>This Week's Focus Pattern</h3>
          </div>
          <div className='p-6'>
            <div className='flex items-end justify-between gap-2' style={{ height: '180px' }}>
              {weeklyPattern.map((day, index) => (
                <div key={index} className='flex-1 flex flex-col items-center gap-2'>
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative group' style={{ height: `${(day.hours / Math.max(...weeklyPattern.map((d) => d.hours), 1)) * 100}%` }}>
                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                      {day.hours.toFixed(1)}h
                    </div>
                    <div className='w-full h-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg' />
                  </div>
                  <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>{day.day.slice(0, 3)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subject / Topic Distribution */}
      {subjectDistribution && subjectDistribution.length > 0 && (
        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
            <div className='flex items-center gap-3'>
              <PieChart className='text-indigo-500' size={24} />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Study Focus by Subject</h3>
            </div>
          </div>
          <div className='p-6'>
            <div className='space-y-3'>
              {subjectDistribution.slice(0, 5).map((subject, index) => (
                <div key={index}>
                  <div className='flex items-center justify-between mb-1'>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>{subject.subject || 'Uncategorized'}</p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{subject.hours}h</p>
                  </div>
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300'
                      style={{
                        width: `${Math.min(
                          100,
                          (subject.hours / Math.max(...subjectDistribution.map((s) => s.hours), 1)) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pain Reminder / Motivation */}
      <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='text-yellow-600 dark:text-yellow-500 mt-0.5' />
          <div>
            <p className='font-semibold text-yellow-800 dark:text-yellow-300'>Keep it Going!</p>
            <p className='text-sm text-yellow-700 dark:text-yellow-400'>
              You've completed {insights.totalTasksCompleted || 0} tasks in the last 30 days with a {Math.round((insights.avgFocusScore || 0))} focus score. Keep up the great work! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
