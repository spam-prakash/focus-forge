import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LayoutDashboard, CheckSquare, BarChart3, Users, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

export default function Layout () {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/social', icon: Users, label: 'Social' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950'>
      {/* Sidebar */}
      <aside className='fixed left-0 top-0 h-full w-64 glass border-r border-gray-200 dark:border-gray-800'>
        <div className='p-6'>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            FocusForge
          </h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Forge Your Focus</p>
        </div>

        <nav className='mt-8'>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className='flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className='absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={toggleTheme}
              className='p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className='p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            >
              <LogOut size={20} />
            </button>
          </div>
          <div className='text-sm'>
            <p className='font-medium text-gray-900 dark:text-white'>{user?.name}</p>
            <p className='text-gray-500 dark:text-gray-400 text-xs'>Level {user?.level} • 🔥 {user?.streak} day streak</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className='ml-64 p-8'>
        <Outlet />
      </main>
    </div>
  )
}
