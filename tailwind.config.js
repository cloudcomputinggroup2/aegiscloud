/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cf: {
          orange: '#f38020',
          'orange-hover': '#e56f10',
          'orange-light': 'rgba(243, 128, 32, 0.12)',
          bg: '#0d1017',
          surface: '#151924',
          card: '#1b202e',
          border: '#272f45',
          hover: '#22293b',
          muted: '#64748b',
          secondary: '#94a3b8',
        }
      },
    },
  },
  plugins: [],
}
