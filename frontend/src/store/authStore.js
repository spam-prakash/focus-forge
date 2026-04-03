import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

axios.defaults.withCredentials = true

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  checkAuth: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`)
      set({ user: response.data.user, isAuthenticated: true })
    } catch (error) {
      set({ user: null, isAuthenticated: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
      toast.success('Welcome back! 🔥')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      set({ isLoading: false })
      return false
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password })
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
      toast.success('Account created! 🎉')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed')
      set({ isLoading: false })
      return false
    }
  },

  logout: async () => {
    await axios.post(`${API_URL}/auth/logout`)
    set({ user: null, isAuthenticated: false })
    toast.success('Logged out')
  }
}))
