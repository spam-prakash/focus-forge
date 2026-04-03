import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggleTheme: () => {
    const newIsDark = !localStorage.getItem('theme') === 'dark'
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    set({ isDark: newIsDark })
  }
}))
