import React, { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useAuthStore } from '../store/authStore'
import { Target, Flame, Award, Clock, TrendingUp, AlertCircle } from 'lucide-react'

export default function Dashboard () {
  const { focusTask, fetchFocusTask } = useTaskStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchFocusTask()
  }, [])

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
              <div className='flex gap-4 text-sm'>
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
              <p className='text-gray-500 dark:text-gray-400 text-sm'>XP</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{user?.totalXp || 0}</p>
            </div>
            <TrendingUp className='text-green-500' size={32} />
          </div>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Focus Hours</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{user?.focusHoursThisWeek || 0}h</p>
            </div>
            <Clock className='text-blue-500' size={32} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='text-yellow-600 dark:text-yellow-500 mt-0.5' />
          <div>
            <p className='font-semibold text-yellow-800 dark:text-yellow-300'>Pain Reminder</p>
            <p className='text-sm text-yellow-700 dark:text-yellow-400'>
              You've lost {user?.distractionHoursThisWeek || 0} hours this week to distractions.
              That's {Math.floor((user?.distractionHoursThisWeek || 0) / 3)} assignments worth of time!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
