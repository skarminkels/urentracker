/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:        '#6B5CF6',
          'primary-dark': '#5347d4',
          'primary-soft': '#F1EEFF',
          sidebar:        '#151821',
          success:        '#22C55E',
          warning:        '#FACC15',
          danger:         '#EF4444',
          muted:          '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
