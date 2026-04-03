import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  focusTask: null,
  isLoading: false,

  fetchTasks: async (status = 'pending') => {
    set({ isLoading: true })
    try {
      const response = await axios.get(`${API_URL}/tasks?status=${status}`)
      set({ tasks: response.data.tasks, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, taskData)
      set((state) => ({ tasks: [response.data.task, ...state.tasks] }))
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  updateTask: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${id}`, updates)
      set((state) => ({
        tasks: state.tasks.map(task => task._id === id ? response.data.task : task)
      }))
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  deleteTask: async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`)
      set((state) => ({ tasks: state.tasks.filter(task => task._id !== id) }))
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  fetchFocusTask: async () => {
    try {
      const response = await axios.get(`${API_URL}/priority/focus`)
      set({ focusTask: response.data })
    } catch (error) {
      console.error(error)
    }
  }
}))
