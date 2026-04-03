import React, { useState } from 'react'
import { Calendar, Clock, TrendingUp, Check, X, RotateCcw } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'

export default function TaskCard ({ task, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false)
  const { updateTask, deleteTask } = useTaskStore()

  const getPriorityColor = (score) => {
    if (score >= 0.7) return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    if (score >= 0.5) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    if (score >= 0.3) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-green-600 bg-green-50 dark:bg-green-900/20'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <h3 className='font-semibold text-gray-900 dark:text-white'>{task.title}</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{task.description}</p>

          <div className='flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400'>
            <div className='flex items-center gap-1'>
              <Calendar size={14} />
              <span>Due: {formatDate(task.deadline)}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock size={14} />
              <span>{task.estimatedHours}h est.</span>
            </div>
            <div className='flex items-center gap-1'>
              <TrendingUp size={14} />
              <span>{task.marksWeight * 100}% weight</span>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priorityScore)}`}>
            Score: {(task.priorityScore * 100).toFixed(0)}%
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          >
            <TrendingUp size={16} />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-800'>
          <div className='grid grid-cols-2 gap-2 text-sm'>
            <div>
              <p className='text-gray-500 dark:text-gray-400'>Difficulty: {'⭐'.repeat(task.difficulty)}</p>
              <p className='text-gray-500 dark:text-gray-400'>Backlog: {task.backlogCount} times</p>
            </div>
            <div className='flex gap-2 justify-end'>
              {task.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateTask(task._id, { status: 'completed' })}
                    className='px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700'
                  >
                    <Check size={14} className='inline mr-1' /> Complete
                  </button>
                  <button
                    onClick={() => updateTask(task._id, { status: 'postponed' })}
                    className='px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700'
                  >
                    <RotateCcw size={14} className='inline mr-1' /> Postpone
                  </button>
                </>
              )}
              <button
                onClick={() => deleteTask(task._id)}
                className='px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700'
              >
                <X size={14} className='inline mr-1' /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
