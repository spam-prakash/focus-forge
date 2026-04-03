import React, { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSocialStore } from '../store/socialStore'
import { Users, Trophy, Share2, TrendingUp, Award, Copy, CheckCircle, Zap, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import AchievementCard from '../components/AchievementCard'
import { generateAchievementImage, generateShareText, blobToDataUrl } from '../utils/shareUtils'

export default function Social () {
  const { user } = useAuthStore()
  const {
    leaderboard,
    weeklyChallenge,
    friendActivity,
    communityStats,
    isLoading,
    fetchAllSocialData,
    fetchLeaderboard,
    fetchWeeklyChallenge,
    fetchFriendActivity,
    fetchCommunityStats,
    userRank
  } = useSocialStore()

  const achievementCardRef = React.useRef(null)
  const [copied, setCopied] = React.useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false)

  useEffect(() => {
    fetchAllSocialData('week')
  }, [])

  const copyShareText = async () => {
    try {
      setIsGeneratingImage(true)
      const shareText = generateShareText(
        weeklyChallenge?.current.tasks || 0,
        weeklyChallenge?.current.sessions || 0
      )

      // Generate image
      const imageBlob = await generateAchievementImage(achievementCardRef)

      // Create a combined share object for clipboard
      // Note: Native clipboard API has limitations with blobs, so we'll copy the text
      // and show the image in a preview toast
      await navigator.clipboard.writeText(shareText)

      setCopied(true)
      toast.success('Achievement copied! 🎉')

      // Show image preview in a toast (visual feedback)
      const imageUrl = URL.createObjectURL(imageBlob)
      toast((t) => (
        <div className='flex flex-col gap-2'>
          <p className='font-semibold'>Image generated successfully!</p>
          <img src={imageUrl} alt='Achievement' className='w-full h-32 rounded object-cover' />
        </div>
      ), { duration: 4000 })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying achievement:', error)
      toast.error('Failed to generate achievement card')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const shareOnTwitter = async () => {
    try {
      setIsGeneratingImage(true)
      const shareText = generateShareText(
        weeklyChallenge?.current.tasks || 0,
        weeklyChallenge?.current.sessions || 0
      )

      // Generate image
      const imageBlob = await generateAchievementImage(achievementCardRef)
      const imageUrl = URL.createObjectURL(imageBlob)

      // Open Twitter with the text
      // Note: Twitter Web Intent has limitations with images, so we'll open Twitter
      // and display the image URL in a separate notification
      const text = encodeURIComponent(shareText)
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')

      // Show image download option
      toast((t) => (
        <div className='flex flex-col gap-2'>
          <p className='font-semibold'>Achievement card ready!</p>
          <img src={imageUrl} alt='Achievement' className='w-full h-32 rounded object-cover mb-2' />
          <div className='flex gap-2'>
            <a
              href={imageUrl}
              download='focusforge-achievement.png'
              className='flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600 transition'
            >
              Download
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(imageUrl)
                toast.success('Image URL copied!')
              }}
              className='flex-1 px-3 py-1 bg-gray-600 text-white rounded text-sm font-semibold hover:bg-gray-700 transition'
            >
              Copy URL
            </button>
          </div>
        </div>
      ), { duration: 6000 })

      toast.success('Opening Twitter!')
    } catch (error) {
      console.error('Error sharing on Twitter:', error)
      toast.error('Failed to generate achievement card')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Find user's rank in leaderboard
  const userLeaderboardEntry = leaderboard.find(entry => entry.userId === user?._id)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Social Circle</h1>
        <p className='text-gray-600 dark:text-gray-400'>Compare, compete, and grow together</p>
      </div>

      {/* Rank Card */}
      <div className='bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-yellow-100 text-sm mb-1'>Your Rank This Week</p>
            <h2 className='text-3xl font-bold mb-2'>#{userRank || 'N/A'}</h2>
            <p className='text-yellow-100'>
              {userLeaderboardEntry?.tasksCompleted || 0} tasks completed
              {leaderboard.length > 0 && ` • ${Math.round((userLeaderboardEntry?.completionRate || 0))}% completion rate`}
            </p>
          </div>
          <Trophy size={48} className='text-yellow-300' />
        </div>
      </div>

      {/* Community Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center'>
          <Users className='mx-auto text-blue-500 mb-2' size={32} />
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{communityStats.totalStudents || 0}</p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Active Students</p>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center'>
          <TrendingUp className='mx-auto text-green-500 mb-2' size={32} />
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>Top {communityStats.yourPercentile || 0}%</p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Your percentile</p>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center'>
          <Award className='mx-auto text-purple-500 mb-2' size={32} />
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{Math.round(communityStats.avgCompletionRate || 0)}%</p>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Avg Completion Rate</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>🏆 Top Performers This Week</h3>
        </div>
        <div className='divide-y divide-gray-200 dark:divide-gray-800'>
          {leaderboard.slice(0, 5).map((entry, i) => (
            <div
              key={entry.userId}
              className={`p-4 flex items-center justify-between ${
                entry.userId === user?._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className='flex items-center gap-3'>
                <span className={`font-bold w-8 text-center ${i < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>#{i + 1}</span>
                <div>
                  <p className='font-medium text-gray-900 dark:text-white'>{entry.name}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Level {entry.level} • 🔥 {entry.streak} day streak
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-gray-900 dark:text-white'>{entry.tasksCompleted} tasks</p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>{entry.focusHours}h focus time</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <div className='bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800'>
          <h3 className='text-lg font-semibold text-green-900 dark:text-green-300 mb-2'>🎯 {weeklyChallenge.title}</h3>
          <p className='text-green-800 dark:text-green-400 mb-3'>{weeklyChallenge.description}</p>

          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div>
              <p className='text-sm text-green-700 dark:text-green-400 mb-1'>
                Tasks: {weeklyChallenge.current.tasks}/{weeklyChallenge.goals.tasks}
              </p>
              <div className='bg-white dark:bg-gray-800 rounded-lg h-2 overflow-hidden'>
                <div
                  className='bg-green-500 h-full rounded-lg transition-all duration-500'
                  style={{
                    width: `${Math.min(100, (weeklyChallenge.current.tasks / weeklyChallenge.goals.tasks) * 100)}%`
                  }}
                />
              </div>
            </div>
            <div>
              <p className='text-sm text-green-700 dark:text-green-400 mb-1'>
                Sessions: {weeklyChallenge.current.sessions}/{weeklyChallenge.goals.sessions}
              </p>
              <div className='bg-white dark:bg-gray-800 rounded-lg h-2 overflow-hidden'>
                <div
                  className='bg-green-500 h-full rounded-lg transition-all duration-500'
                  style={{
                    width: `${Math.min(100, (weeklyChallenge.current.sessions / weeklyChallenge.goals.sessions) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg'>
            <Zap className='text-yellow-500' size={20} />
            <p className='text-sm text-gray-700 dark:text-gray-300'>Reward: {weeklyChallenge.reward}</p>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      {friendActivity.length > 0 && (
        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-800'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Recent Activity</h3>
          </div>
          <div className='divide-y divide-gray-200 dark:divide-gray-800'>
            {friendActivity.slice(0, 8).map((activity, i) => (
              <div key={i} className='p-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === 'completion' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      <span className='font-semibold'>{activity.userName}</span> {activity.action}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Section */}
      <div className='bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>Share Your Progress</h3>
        <p className='text-gray-600 dark:text-gray-400 mb-4'>Inspire others and celebrate your wins with a beautiful achievement card! 🎉</p>

        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            onClick={copyShareText}
            disabled={isGeneratingImage}
            className='flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isGeneratingImage
              ? (
                <Loader size={18} className='animate-spin' />
                )
              : copied
                ? (
                  <CheckCircle size={18} />
                  )
                : (
                  <Copy size={18} />
                  )}
            {isGeneratingImage ? 'Generating...' : copied ? 'Copied!' : 'Copy with Image'}
          </button>
          <button
            onClick={shareOnTwitter}
            disabled={isGeneratingImage}
            className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isGeneratingImage
              ? (
                <Loader size={18} className='animate-spin' />
                )
              : (
                <Share2 size={18} />
                )}
            {isGeneratingImage ? 'Generating...' : 'Twitter + Image'}
          </button>
        </div>
      </div>

      {/* Achievement card for image generation - positioned off-screen */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: '-1' }}>
        <AchievementCard
          ref={achievementCardRef}
          user={user}
          weeklyStats={{
            tasks: weeklyChallenge?.current.tasks || 0,
            sessions: weeklyChallenge?.current.sessions || 0,
            focusHours: Math.round((weeklyChallenge?.current.focusMinutes || 0) / 60),
            completionRate: userLeaderboardEntry?.completionRate || 0
          }}
          rank={userRank}
        />
      </div>
    </div>
  )
}
