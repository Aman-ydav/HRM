/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HRM Brand Colors - No Blues
        orange: {
          50: '#fff8f0',
          100: '#ffe4cc',
          200: '#ffc999',
          300: '#ffaf66',
          400: '#ff9433',
          500: '#FF5E00',  // Primary
          600: '#cc4a00',
          700: '#993600',
          800: '#662400',
          900: '#331200',
        },
        // Grayscale - Replace blue with teal/emerald
        teal: {
          50: '#f0fdfa',
          400: '#2dd4c0',
          500: '#14b8a6',  // Alternative accent
          600: '#0d9488',
        },
        emerald: {
          50: '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',  // Green for success
          600: '#16a34a',
        },
        // Neutrals (black, grays, whites)
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
        },
      },
      backgroundColor: {
        'primary': '#0A0A0A',      // Dark black
        'secondary': '#111111',     // Slightly lighter black
        'tertiary': '#1A1A1A',      // Gray-dark
      },
      textColor: {
        'primary': '#FFFFFF',       // White
        'secondary': '#B8B8B8',     // Silver
      },
      borderColor: {
        'primary': '#FF5E00',       // Orange
        'secondary': '#B8B8B8',     // Silver
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Oswald', 'sans-serif'],
      },
      spacing: {
        'gutter': '2rem',
      },
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      const colors = theme('colors')
      addComponents({
        '.btn-primary': {
          '@apply px-4 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 transition': {},
        },
        '.btn-secondary': {
          '@apply px-4 py-2 rounded-lg font-medium bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 transition': {},
        },
        '.card': {
          '@apply bg-gray-900 border border-gray-800 rounded-lg p-6': {},
        },
        '.badge': {
          '@apply inline-block px-3 py-1 rounded-full text-xs font-medium': {},
        },
      })
    },
  ],
}
