import React, { useState, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import TaskCard from '../components/TaskCard'
import { Plus, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Tasks() {
  const { tasks, fetchTasks, createTask, isLoading } = useTaskStore()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    difficulty: 3,
    marksWeight: 0.5,
    estimatedHours: 2
  })

  useEffect(() => {
    fetchTasks(filter)
  }, [filter, fetchTasks])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await createTask({
      ...formData,
      deadline: new Date(formData.deadline).toISOString()
    })
    if (success) {
      toast.success('Task created successfully!')
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        deadline: '',
        difficulty: 3,
        marksWeight: 0.5,
        estimatedHours: 2
      })
      fetchTasks(filter)
    } else {
      toast.error('Failed to create task')
    }
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const postponedTasks = tasks.filter(t => t.status === 'postponed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and prioritize your tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:opacity-90"
        >
          <Plus size={20} /> New Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {['pending', 'completed', 'postponed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === tab
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} 
            {tab === 'pending' && ` (${pendingTasks.length})`}
            {tab === 'completed' && ` (${completedTasks.length})`}
            {tab === 'postponed' && ` (${postponedTasks.length})`}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} onUpdate={() => fetchTasks(filter)} />
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Complete Math Assignment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Add details about this task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>Easy</span>
                  <span>Medium</span>
                  <span>Hard</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marks Weight (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.marksWeight * 100}
                  onChange={(e) => setFormData({ ...formData, marksWeight: parseInt(e.target.value) / 100 })}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {(formData.marksWeight * 100).toFixed(0)}% of grade
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}