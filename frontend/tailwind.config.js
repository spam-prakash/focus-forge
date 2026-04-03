/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px rgba(59,130,246,0.5)' },
          '100%': { textShadow: '0 0 20px rgba(59,130,246,0.8)' }
        }
      }
    }
  },
  plugins: []
}
