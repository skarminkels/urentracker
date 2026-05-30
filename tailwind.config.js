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
          page:             '#e8e4dd',
          shell:            '#f6f3ee',
          surface:          '#f1ede6',
          'surface-soft':   '#faf8f4',
          'surface-inset':  '#e6e0d7',
          dark:             '#20242c',
          text:             '#2b2a27',
          muted:            '#7c776f',
          inverse:          '#f6f2eb',
          accent:           '#f1c93b',
          secondary:        '#ef8e78',
          neutral:          '#4a4a45',
          success:          '#22C55E',
          danger:           '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 20px 40px rgba(55, 44, 22, 0.07)',
        hover: '0 18px 40px rgba(55, 44, 22, 0.10)',
        modal: '0 32px 64px rgba(55, 44, 22, 0.14)',
      },
    },
  },
  plugins: [],
}
