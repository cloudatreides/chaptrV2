/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0a12',
        surface: '#13101c',
        surfaceAlt: '#1a1525',
        border: '#2a2040',
        accent: '#c84b9e',
        accentLight: '#e060b8',
        gem: '#a78bfa',
        textPrimary: '#f0ecf8',
        textSecondary: '#9b8db8',
        textMuted: '#6b5f8a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
