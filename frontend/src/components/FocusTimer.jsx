import React, { useState, useEffect } from 'react'
import { Play, Pause, StopCircle, RotateCcw, Volume2, VolumeX } from 'lucide-react'

export default function FocusTimer ({ onSessionEnd, onTimerStateChange, taskName = 'Study Session' }) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0) // in seconds
  const [focusScore, setFocusScore] = useState(7)
  const [distractions, setDistractions] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // Notify parent when timer state changes
  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange(isRunning)
    }
  }, [isRunning, onTimerStateChange])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const playNotification = () => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    playNotification()
    if (onSessionEnd) {
      onSessionEnd({
        duration: time,
        focusScore,
        distractions
      })
    }
    resetTimer()
  }

  const resetTimer = () => {
    setTime(0)
    setFocusScore(7)
    setDistractions(0)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Calculate productivity percentage
  const productivityPercent = Math.max(0, Math.min(100, (focusScore * 10) - (distractions * 5)))

  return (
    <div className='bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg'>
      <h3 className='text-lg font-bold mb-2 text-center'>{taskName}</h3>

      {/* Compact Timer Display */}
      <div className='text-center mb-4'>
        <div className='text-5xl font-mono font-bold mb-1 tracking-wider tabular-nums'>
          {formatTime(time)}
        </div>
        <p className='text-indigo-100 text-sm'>
          {isRunning ? '🔴 Recording...' : '⏸️ Paused'}
        </p>
      </div>

      {/* Stats Grid - Compact */}
      <div className='grid grid-cols-3 gap-2 mb-4'>
        <div className='bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center'>
          <p className='text-indigo-100 text-xs mb-1'>Focus Score</p>
          <input
            type='range'
            min='1'
            max='10'
            value={focusScore}
            onChange={(e) => setFocusScore(parseInt(e.target.value))}
            className='w-full h-1.5 rounded-lg'
            disabled={isRunning}
          />
          <p className='text-xl font-bold mt-1'>{focusScore}/10</p>
        </div>

        <div className='bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center'>
          <p className='text-indigo-100 text-xs mb-1'>Distractions</p>
          <p className='text-2xl font-bold my-1'>{distractions}</p>
          <div className='flex gap-1 justify-center'>
            <button
              onClick={() => setDistractions(Math.max(0, distractions - 1))}
              className='flex-1 px-1 py-0.5 text-xs bg-red-500/50 hover:bg-red-600/50 rounded transition'
              disabled={isRunning}
            >
              −
            </button>
            <button
              onClick={() => setDistractions(distractions + 1)}
              className='flex-1 px-1 py-0.5 text-xs bg-red-500/50 hover:bg-red-600/50 rounded transition'
            >
              +
            </button>
          </div>
        </div>

        <div className='bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center'>
          <p className='text-indigo-100 text-xs mb-1'>Productivity</p>
          <div className='relative h-14 flex items-center justify-center'>
            <svg className='w-12 h-12 transform -rotate-90'>
              <circle
                cx='24'
                cy='24'
                r='20'
                stroke='rgba(255,255,255,0.2)'
                strokeWidth='3'
                fill='none'
              />
              <circle
                cx='24'
                cy='24'
                r='20'
                stroke='#fbbf24'
                strokeWidth='3'
                fill='none'
                strokeDasharray={`${(productivityPercent / 100) * 125.6} 125.6`}
                strokeLinecap='round'
              />
            </svg>
            <div className='absolute text-sm font-bold'>{Math.round(productivityPercent)}%</div>
          </div>
        </div>
      </div>

      {/* Control Buttons - Compact */}
      <div className='flex gap-2 justify-center mb-3'>
        <button
          onClick={toggleTimer}
          className='flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500/80 hover:bg-green-600 rounded-lg font-semibold transition backdrop-blur-sm'
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : time === 0 ? 'Start' : 'Resume'}
        </button>

        {isRunning && (
          <button
            onClick={handleStop}
            className='flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500/80 hover:bg-red-600 rounded-lg font-semibold transition'
          >
            <StopCircle size={16} /> Stop
          </button>
        )}

        {!isRunning && time > 0 && (
          <button
            onClick={handleStop}
            className='flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500/80 hover:bg-orange-600 rounded-lg font-semibold transition'
          >
            <StopCircle size={16} /> Save & End
          </button>
        )}

        <button
          onClick={resetTimer}
          className='flex items-center gap-1 px-3 py-1.5 text-sm bg-white/30 hover:bg-white/40 rounded-lg font-semibold transition backdrop-blur-sm'
          disabled={isRunning}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* Sound Toggle - Compact */}
      <div className='flex justify-center mb-2'>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className='flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition'
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundEnabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Session Info - Compact */}
      <div className='p-2 bg-white/10 backdrop-blur-sm rounded border border-white/20'>
        <p className='text-xs text-indigo-100 text-center'>
          💡 Keep focus high, distractions low
        </p>
      </div>
    </div>
  )
}
