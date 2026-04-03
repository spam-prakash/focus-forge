import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { Sun, Moon, Bell, Shield, User, Key, Save, Edit2, Mail, Award, Flame, Target, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Settings () {
  const { user, updateUser } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { insights, fetchInsights } = useAnalyticsStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalFocusHours: 0,
    totalSessions: 0,
    avgFocusScore: 0
  })
  console.log(user)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
    weeklyReport: true,
    painReminders: true
  })

  // Fetch real user stats from backend
  useEffect(() => {
    fetchUserStats()
    fetchInsights()
  }, [])

  const fetchUserStats = async () => {
    try {
      const [tasksRes, sessionsRes] = await Promise.all([
        axios.get(`${API_URL}/tasks?status=all`),
        axios.get(`${API_URL}/analytics/insights`)
      ])

      const allTasks = tasksRes.data.tasks || []
      const completed = allTasks.filter(t => t.status === 'completed').length

      setUserStats({
        totalTasks: allTasks.length,
        completedTasks: completed,
        totalFocusHours: sessionsRes.data.insights?.totalFocusHours || 0,
        totalSessions: sessionsRes.data.insights?.totalSessions || 0,
        avgFocusScore: sessionsRes.data.insights?.avgFocusScore || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Update user profile via API
      const response = await axios.put(`${API_URL}/auth/update-profile`, {
        name: profileData.name,
        email: profileData.email
      })

      if (response.data.user) {
        updateUser(response.data.user)
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: user?.email })
      toast.success('Password reset link sent to your email!')
    } catch (error) {
      toast.error('Failed to send reset link')
    }
  }

  const handleNotificationToggle = async (setting, value) => {
    try {
      await axios.put(`${API_URL}/auth/update-settings`, {
        [setting]: value
      })
      setProfileData({ ...profileData, [setting]: value })
      toast.success(`${setting} updated!`)
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Settings</h1>
        <p className='text-gray-600 dark:text-gray-400'>Manage your FocusForge account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <User className='text-blue-500' size={24} />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Profile Information</h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className='px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
            >
              {isEditing ? 'Cancel' : <Edit2 size={18} />}
            </button>
          </div>
        </div>

        <div className='p-6 space-y-4'>
          {isEditing
            ? (
              <>
    <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Full Name</label>
                <input
                  type='text'
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                />
              </div>
    <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Email</label>
                <input
                  type='email'
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                />
              </div>
    <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className='px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50'
              >
                <Save size={18} /> {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
  </>
              )
            : (
              <>
    <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400'>Name</span>
                <span className='font-medium text-gray-900 dark:text-white'>{user?.name}</span>
              </div>
    <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400'>Email</span>
                <span className='font-medium text-gray-900 dark:text-white'>{user?.email}</span>
              </div>
    <div className='flex justify-between py-2'>
                <span className='text-gray-600 dark:text-gray-400'>Member Since</span>
                <span className='font-medium text-gray-900 dark:text-white'>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
  </>
              )}
        </div>
      </div>

      {/* Real Stats Section - No Dummy Data */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-center gap-3'>
            <Target className='text-green-500' size={24} />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Your Statistics</h2>
          </div>
        </div>

        <div className='p-6'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>{userStats.totalTasks}</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Total Tasks</p>
            </div>
            <div className='text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{userStats.completedTasks}</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Completed</p>
            </div>
            <div className='text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{userStats.totalFocusHours}h</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Focus Hours</p>
            </div>
            <div className='text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>{userStats.totalSessions}</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Study Sessions</p>
            </div>
            <div className='text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{userStats.avgFocusScore}/10</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Avg Focus Score</p>
            </div>
            <div className='text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>{user?.level || 1}</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-center gap-3'>
            {isDark ? <Moon className='text-purple-500' size={24} /> : <Sun className='text-yellow-500' size={24} />}
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Appearance</h2>
          </div>
        </div>

        <div className='p-6'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium text-gray-900 dark:text-white'>Dark Mode</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Toggle between light and dark theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className='relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
              style={{ backgroundColor: isDark ? '#3b82f6' : '#d1d5db' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-center gap-3'>
            <Bell className='text-green-500' size={24} />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Notifications</h2>
          </div>
        </div>

        <div className='p-6 space-y-4'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium text-gray-900 dark:text-white'>Email Notifications</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Receive daily reminders and updates</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('notifications', !profileData.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                profileData.notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profileData.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
              />
            </button>
          </div>

          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium text-gray-900 dark:text-white'>Weekly Report</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Get your productivity summary every Monday</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('weeklyReport', !profileData.weeklyReport)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                profileData.weeklyReport ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profileData.weeklyReport ? 'translate-x-6' : 'translate-x-1'
              }`}
              />
            </button>
          </div>

          <div className='flex justify-between items-center'>
            <div>
              <p className='font-medium text-gray-900 dark:text-white'>Pain Reminders</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Show motivational reminders</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('painReminders', !profileData.painReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                profileData.painReminders ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profileData.painReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-center gap-3'>
            <Shield className='text-red-500' size={24} />
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Security</h2>
          </div>
        </div>

        <div className='p-6'>
          <button
            onClick={handleResetPassword}
            className='px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800'
          >
            <Key size={18} /> Change Password
          </button>
        </div>
      </div>

      {/* Account Stats Card */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white'>
        <h3 className='text-lg font-semibold mb-2'>Account Summary</h3>
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <p className='text-blue-100 text-sm'>Member Since</p>
            <p className='text-lg font-bold'>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className='text-blue-100 text-sm'>Account Status</p>
            <p className='text-lg font-bold text-green-300'>Active ✓</p>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      {Object.keys(insights).length > 0 && (
        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
            <div className='flex items-center gap-3'>
              <TrendingUp className='text-purple-500' size={24} />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Productivity Insights</h2>
            </div>
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>Productivity Score</p>
                <div className='flex items-end gap-3'>
                  <div className='text-4xl font-bold text-purple-600 dark:text-purple-400'>
                    {insights.productivityScore || 0}
                  </div>
                  <div className='text-sm text-gray-500 dark:text-gray-400 mb-2'>/100</div>
                </div>
              </div>

              <div>
                <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>Peak Productivity Hour</p>
                <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {insights.peakProductivityHour || 'N/A'}
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>You're most productive at this time</p>
              </div>

              <div>
                <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>Last 30 Days - Completion Rate</p>
                <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {insights.completionRate || 0}%
                </div>
              </div>

              <div>
                <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>Average Focus Score</p>
                <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                  {(insights.avgFocusScore || 0).toFixed(1)}/10
                </div>
              </div>
            </div>

            <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <p className='text-sm text-blue-900 dark:text-blue-300'>
                <span className='font-semibold'>💡 Tip:</span> You're most productive around {insights.peakProductivityHour}. Try scheduling your hardest tasks at this time!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
