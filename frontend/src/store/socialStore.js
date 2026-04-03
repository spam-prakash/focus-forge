import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useSocialStore = create((set, get) => ({
  leaderboard: [],
  weeklyChallenge: null,
  friendActivity: [],
  communityStats: {},
  comparison: null,
  userRank: null,
  totalUsers: null,
  nearbyUsers: [],
  userStats: null,
  isLoading: false,

  fetchLeaderboard: async (period = 'week') => {
    set({ isLoading: true })
    try {
      const response = await axios.get(`${API_URL}/social/leaderboard?period=${period}`)
      set({ leaderboard: response.data.leaderboard, isLoading: false })
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      set({ isLoading: false })
    }
  },

  // Fixed fetchMyRank function
  fetchMyRank: async (period = 'week') => {
    set({ isLoading: true })
    try {
      const response = await axios.get(`${API_URL}/social/my-rank?period=${period}`)
      set({
        userRank: response.data.rank,
        totalUsers: response.data.totalUsers,
        nearbyUsers: response.data.nearbyUsers,
        userStats: response.data.userStats,
        isLoading: false
      })
      return response.data
    } catch (error) {
      console.error('Error fetching rank:', error)
      set({ isLoading: false })
      return null
    }
  },

  fetchWeeklyChallenge: async () => {
    try {
      const response = await axios.get(`${API_URL}/social/weekly-challenge`)
      set({ weeklyChallenge: response.data.challenge })
    } catch (error) {
      console.error('Error fetching weekly challenge:', error)
    }
  },

  fetchFriendActivity: async () => {
    try {
      const response = await axios.get(`${API_URL}/social/friend-activity`)
      set({ friendActivity: response.data.activities })
    } catch (error) {
      console.error('Error fetching friend activity:', error)
    }
  },

  fetchCommunityStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/social/community-stats`)
      set({ communityStats: response.data.stats })
    } catch (error) {
      console.error('Error fetching community stats:', error)
    }
  },

  compareWithFriend: async (friendId) => {
    try {
      const response = await axios.get(`${API_URL}/social/compare/${friendId}`)
      set({ comparison: response.data.comparison })
      return response.data.comparison
    } catch (error) {
      console.error('Error comparing with friend:', error)
      return null
    }
  },

  fetchAllSocialData: async (period = 'week') => {
    set({ isLoading: true })
    try {
      const [leaderboard, challenge, activity, stats, rank] = await Promise.all([
        axios.get(`${API_URL}/social/leaderboard?period=${period}`),
        axios.get(`${API_URL}/social/weekly-challenge`),
        axios.get(`${API_URL}/social/friend-activity`),
        axios.get(`${API_URL}/social/community-stats`),
        axios.get(`${API_URL}/social/my-rank?period=${period}`)
      ])

      set({
        leaderboard: leaderboard.data.leaderboard || [],
        weeklyChallenge: challenge.data.challenge || null,
        friendActivity: activity.data.activities || [],
        communityStats: stats.data.stats || {},
        userRank: rank.data.rank,
        totalUsers: rank.data.totalUsers,
        nearbyUsers: rank.data.nearbyUsers,
        userStats: rank.data.userStats,
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching all social data:', error)
      set({ isLoading: false })
    }
  },

  // Helper function to get current user's position in leaderboard
  getCurrentUserRank: () => {
    const { leaderboard, userRank } = get()
    if (userRank) return userRank
    return null
  },

  // Reset all social data
  resetSocialData: () => {
    set({
      leaderboard: [],
      weeklyChallenge: null,
      friendActivity: [],
      communityStats: {},
      comparison: null,
      userRank: null,
      totalUsers: null,
      nearbyUsers: [],
      userStats: null,
      isLoading: false
    })
  }
}))
