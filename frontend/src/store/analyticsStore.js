import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAnalyticsStore = create((set) => ({
  weeklyPattern: [],
  subjectDistribution: [],
  completionTrend: [],
  insights: {},
  isLoading: false,

  fetchWeeklyPattern: async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/weekly-pattern`)
      set({ weeklyPattern: response.data.weeklyPattern })
    } catch (error) {
      console.error('Error fetching weekly pattern:', error)
    }
  },

  fetchSubjectDistribution: async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/subject-distribution`)
      set({ subjectDistribution: response.data.subjectDistribution })
    } catch (error) {
      console.error('Error fetching subject distribution:', error)
    }
  },

  fetchCompletionTrend: async (days = 30) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/completion-trend?days=${days}`)
      set({ completionTrend: response.data.completionTrend })
    } catch (error) {
      console.error('Error fetching completion trend:', error)
    }
  },

  fetchInsights: async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/insights`)
      set({ insights: response.data.insights })
    } catch (error) {
      console.error('Error fetching insights:', error)
    }
  },

  fetchAllAnalytics: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get(`${API_URL}/analytics/all`)
      set({
        weeklyPattern: response.data.weeklyPattern || [],
        subjectDistribution: response.data.subjectDistribution || [],
        completionTrend: response.data.completionTrend || [],
        insights: response.data.insights || {},
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching all analytics:', error)
      set({ isLoading: false })
    }
  },

  trackStudySession: async (sessionData) => {
    try {
      const response = await axios.post(`${API_URL}/analytics/track-session`, sessionData)
      return response.data
    } catch (error) {
      console.error('Error tracking session:', error)
      return null
    }
  }
}))
