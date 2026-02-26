/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './layouts/**/*.{js,jsx,ts,tsx}',
    './data/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        base: '#060816',
        panel: '#0d1328',
        accent: '#22d3ee',
        accent2: '#3b82f6'
      },
      boxShadow: {
        glass: '0 16px 40px rgba(0,0,0,0.35)'
      }
    }
  },
  plugins: []
}
