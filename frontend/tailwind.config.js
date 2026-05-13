/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HRM Brand Colors - Light theme
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
        // Grayscale - light theme with soft grays
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Soft blue for secondary accent
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        emerald: {
          50: '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',  // Green for success
          600: '#16a34a',
        },
      },
      backgroundColor: {
        'primary': '#FFFFFF',       // White
        'secondary': '#f8fafc',     // Very light gray
        'tertiary': '#f1f5f9',      // Light gray
      },
      textColor: {
        'primary': '#0f172a',       // Dark charcoal
        'secondary': '#475569',     // Medium gray
      },
      borderColor: {
        'primary': '#FF5E00',       // Orange
        'secondary': '#e2e8f0',     // Light gray
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
          '@apply px-4 py-2 rounded-lg font-medium bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300 transition': {},
        },
        '.card': {
          '@apply bg-white border border-slate-200 rounded-lg p-6 shadow-sm': {},
        },
        '.badge': {
          '@apply inline-block px-3 py-1 rounded-full text-xs font-medium': {},
        },
      })
    },
  ],
}
