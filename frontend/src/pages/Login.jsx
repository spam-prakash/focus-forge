import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Flame } from 'lucide-react'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) navigate('/dashboard')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center p-4'>
      <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20'>
        <div className='text-center mb-8'>
          <div className='inline-flex p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4'>
            <Flame className='text-white' size={32} />
          </div>
          <h1 className='text-3xl font-bold text-white'>FocusForge</h1>
          <p className='text-gray-300 mt-2'>Forge your focus, master your time</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
              required
            />
          </div>
          <div>
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
              required
            />
          </div>
          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50'
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='text-center text-gray-300 mt-4'>
          Don't have an account?{' '}
          <Link to='/signup' className='text-blue-400 hover:text-blue-300'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
