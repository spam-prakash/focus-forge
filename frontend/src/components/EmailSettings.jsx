import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Bell, Mail, Calendar, AlertTriangle, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function EmailSettings () {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReport: true,
    deadlineReminders: true
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/preferences`)
      setPreferences(response.data.preferences)
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const savePreferences = async () => {
    setIsLoading(true)
    try {
      await axios.put(`${API_URL}/email/preferences`, preferences)
      toast.success('Email preferences updated!')
    } catch (error) {
      toast.error('Failed to update preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const testEmail = async () => {
    try {
      await axios.post(`${API_URL}/email/test`)
      toast.success('Test email sent! Check your inbox.')
    } catch (error) {
      toast.error('Failed to send test email')
    }
  }

  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
        <Mail size={20} className='text-blue-500' />
        Email Notifications
      </h3>

      <div className='space-y-4'>
        <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
          <div className='flex items-center gap-3'>
            <Bell className='text-purple-500' size={20} />
            <div>
              <p className='font-medium text-gray-900 dark:text-white'>Daily Reminders</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Get daily task reminders at 9 AM</p>
            </div>
          </div>
          <button
            onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
            }`}
            />
          </button>
        </div>

        <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
          <div className='flex items-center gap-3'>
            <Calendar className='text-green-500' size={20} />
            <div>
              <p className='font-medium text-gray-900 dark:text-white'>Weekly Reports</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Get your productivity summary every Monday</p>
            </div>
          </div>
          <button
            onClick={() => setPreferences({ ...preferences, weeklyReport: !preferences.weeklyReport })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.weeklyReport ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences.weeklyReport ? 'translate-x-6' : 'translate-x-1'
            }`}
            />
          </button>
        </div>

        <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='text-red-500' size={20} />
            <div>
              <p className='font-medium text-gray-900 dark:text-white'>Deadline Reminders</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Get alerts for upcoming deadlines</p>
            </div>
          </div>
          <button
            onClick={() => setPreferences({ ...preferences, deadlineReminders: !preferences.deadlineReminders })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.deadlineReminders ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences.deadlineReminders ? 'translate-x-6' : 'translate-x-1'
            }`}
            />
          </button>
        </div>

        <div className='flex gap-3 pt-4'>
          <button
            onClick={savePreferences}
            disabled={isLoading}
            className='flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50'
          >
            <Save size={18} />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
          <button
            onClick={testEmail}
            className='px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700'
          >
            Test Email
          </button>
        </div>
      </div>
    </div>
  )
}
