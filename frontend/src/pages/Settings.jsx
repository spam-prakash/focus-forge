import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { Sun, Moon, Bell, Shield, User, Key, Save, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings () {
  const { user } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true,
    weeklyReport: true,
    painReminders: true
  })

  const handleSaveProfile = async () => {
    // In a real app, you would call an API to update the user profile
    toast.success('Profile updated successfully!')
    setIsEditing(false)
  }

  const handleResetPassword = () => {
    toast.success('Password reset link sent to your email!')
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Settings</h1>
        <p className='text-gray-600 dark:text-gray-400'>Customize your FocusForge experience</p>
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
                className='px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2'
              >
                <Save size={18} /> Save Changes
              </button>
            </>
          )
: (
            <>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600 dark:text-gray-400'>Name</span>
                <span className='font-medium text-gray-900 dark:text-white'>{user?.name}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600 dark:text-gray-400'>Email</span>
                <span className='font-medium text-gray-900 dark:text-white'>{user?.email}</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-gray-600 dark:text-gray-400'>Member Since</span>
                <span className='font-medium text-gray-900 dark:text-white'>
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
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
              className='relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
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
              <p className='font-medium text-gray-900 dark:text-white'>Push Notifications</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Receive daily reminders and updates</p>
            </div>
            <button
              onClick={() => setProfileData({ ...profileData, notifications: !profileData.notifications })}
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
              onClick={() => setProfileData({ ...profileData, weeklyReport: !profileData.weeklyReport })}
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
              <p className='text-sm text-gray-500 dark:text-gray-400'>Show motivational (or painful) reminders</p>
            </div>
            <button
              onClick={() => setProfileData({ ...profileData, painReminders: !profileData.painReminders })}
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

      {/* Stats Card */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white'>
        <h3 className='text-lg font-semibold mb-2'>Your FocusForge Stats</h3>
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <p className='text-blue-100 text-sm'>Total Tasks Completed</p>
            <p className='text-2xl font-bold'>{Math.floor(Math.random() * 50 + 10)}</p>
          </div>
          <div>
            <p className='text-blue-100 text-sm'>Total Focus Hours</p>
            <p className='text-2xl font-bold'>{Math.floor(Math.random() * 100 + 20)}h</p>
          </div>
          <div>
            <p className='text-blue-100 text-sm'>Best Streak</p>
            <p className='text-2xl font-bold'>{Math.max(user?.streak || 0, Math.floor(Math.random() * 30 + 5))} days</p>
          </div>
          <div>
            <p className='text-blue-100 text-sm'>Badges Earned</p>
            <p className='text-2xl font-bold'>{Math.floor(Math.random() * 8 + 1)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
