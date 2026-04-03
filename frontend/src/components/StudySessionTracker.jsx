import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTaskStore } from '../store/taskStore'
import FocusTimer from './FocusTimer'
import { History, Flame, BookOpen, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function StudySessionTracker ({ onSessionSaved }) {
  const { tasks, fetchTasks } = useTaskStore()
  const [currentSubject, setCurrentSubject] = useState('')
  const [currentTaskId, setCurrentTaskId] = useState('')
  const [recentSessions, setRecentSessions] = useState([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const loadRecentSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/analytics/recent-sessions?limit=5`)
      setRecentSessions(res.data.sessions || [])
    } catch (error) {
      console.error('Error loading recent sessions:', error)
    }
  }

  useEffect(() => {
    const initData = async () => {
      await fetchTasks('pending')
      await loadRecentSessions()
    }
    initData()
  }, [fetchTasks])

  const handleSessionEnd = async (sessionData) => {
    try {
      await axios.post(`${API_URL}/analytics/track-session`, {
        taskId: currentTaskId || null,
        subject: currentSubject || 'General Study',
        startTime: new Date(Date.now() - sessionData.duration * 1000),
        endTime: new Date(),
        durationMinutes: Math.round(sessionData.duration / 60),
        focusScore: sessionData.focusScore,
        distractions: sessionData.distractions,
        completedTask: false
      })

      toast.success(
        `🎉 Great session! ${Math.round(sessionData.duration / 60)} minutes studied with focus score ${sessionData.focusScore}/10`
      )

      // Reset form
      setCurrentSubject('')
      setCurrentTaskId('')

      // Reload recent sessions and notify parent
      await loadRecentSessions()
      if (onSessionSaved) {
        onSessionSaved()
      }
    } catch (error) {
      console.error('Error saving session:', error)
      toast.error('Failed to save session')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Main Study Session Container - Premium Design */}
      <div className='relative overflow-hidden rounded-2xl'>
        {/* Gradient Background */}
        <div className='absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-blue-800 opacity-95' />
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full opacity-10 blur-3xl' />

        <div className='relative p-8 md:p-10'>
          {/* Header with Badge */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-2'>
              <Sparkles className='text-yellow-300' size={24} />
              <h2 className='text-3xl font-bold text-white'>
                Focus Lab 🚀
              </h2>
            </div>
            <p className='text-blue-100'>Start a study session and track your progress in real-time</p>
          </div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
            {/* Configuration Panel */}
            <div className='lg:col-span-1 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300'>
              <div className='flex items-center gap-2 mb-4'>
                <BookOpen className='text-yellow-300' size={20} />
                <h3 className='text-lg font-semibold text-white'>Session Config</h3>
                {isTimerRunning && (
                  <span className='ml-auto text-xs px-2 py-1 bg-red-500/50 text-white rounded-full font-semibold'>🔒 Locked</span>
                )}
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-blue-100 mb-2'>
                    📚 Subject (Optional)
                  </label>
                  <input
                    type='text'
                    placeholder='e.g., Mathematics, Physics'
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    disabled={isTimerRunning}
                    className={`w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all backdrop-blur-sm ${
                      isTimerRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/25'
                    }`}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-blue-100 mb-2'>
                    🎯 Linked Task (Optional)
                  </label>
                  <select
                    value={currentTaskId}
                    onChange={(e) => setCurrentTaskId(e.target.value)}
                    disabled={isTimerRunning}
                    className={`w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all backdrop-blur-sm ${
                      isTimerRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/25'
                    }`}
                  >
                    <option value='' className='bg-gray-900'>No task selected</option>
                    {tasks.filter(t => t.status === 'pending').map(task => (
                      <option key={task._id} value={task._id} className='bg-gray-900'>{task.title}</option>
                    ))}
                  </select>
                </div>

                <div className={`bg-white/10 backdrop-blur-sm p-3 rounded-lg border ${isTimerRunning ? 'border-red-300/50' : 'border-yellow-300/30'}`}>
                  <p className='text-sm text-yellow-100 flex items-start gap-2'>
                    <span className='shrink-0'>{isTimerRunning ? '⏱️' : '💡'}</span>
                    <span>
                      <strong>{isTimerRunning ? 'Session Active' : 'Pro Tip'}:</strong> {isTimerRunning ? 'Settings are locked while session is running.' : 'Set your subject and click start. Your focus level updates automatically!'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Timer Component */}
            <div className='lg:col-span-2'>
              <FocusTimer
                onSessionEnd={handleSessionEnd}
                onTimerStateChange={setIsTimerRunning}
                taskName={currentSubject || 'Study Session'}
              />
            </div>
          </div>

          {/* Recent Sessions - Inline */}
          {recentSessions.length > 0 && (
            <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
              <h4 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
                <History size={16} className='text-green-300' /> Session History
              </h4>
              <div className='space-y-2 max-h-40 overflow-y-auto scrollbar-hide'>
                {recentSessions.map((session, idx) => (
                  <div key={idx} className='flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors'>
                    <div className='flex items-center gap-2'>
                      <Flame size={14} className='text-orange-300' />
                      <div>
                        <p className='text-sm font-medium text-white'>{session.subject}</p>
                        <p className='text-xs text-blue-100'>
                          {session.durationMinutes}m • Focus: {session.focusScore}/10
                        </p>
                      </div>
                    </div>
                    <p className='text-xs text-blue-200'>
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
