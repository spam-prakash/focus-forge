import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import Social from './pages/Social'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App () {
  const { checkAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <>
      <Toaster position='top-right' />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path='/' element={<Navigate to='/dashboard' />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/tasks' element={<Tasks />} />
            <Route path='/analytics' element={<Analytics />} />
            <Route path='/social' element={<Social />} />
            <Route path='/settings' element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
