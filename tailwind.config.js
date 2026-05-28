/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Sidebar — aubergine / deep purple
        sidebar:           '#1E1033',
        'sidebar-hover':   '#2A1B4E',
        'sidebar-active':  '#7B3FE4',
        'sidebar-text':    '#A89BC4',
        'sidebar-section': '#6B5A8A',
        'sidebar-border':  '#2D1F50',

        // Main canvas
        canvas:            '#FAF8F7',

        // Brand / accent
        brand:             '#7B3FE4',
        'brand-hover':     '#6B2FD4',
        'brand-light':     '#EDE5FF',
        'brand-pink':      '#E54B8C',

        // Content text
        'ink-primary':     '#1A1A1A',
        'ink-secondary':   '#6B6B6B',
        'ink-muted':       '#9E9E9E',

        // Borders / surfaces
        bdr:               '#EAE6E1',
        surface:           '#FFFFFF',
        'surface-hover':   '#F5F1EE',

        // Category / chart palette
        'cat-pink':         '#F48FB1',
        'cat-coral':        '#FF8A65',
        'cat-yellow':       '#FFD54F',
        'cat-blue':         '#81D4FA',
        'cat-mint':         '#80CBC4',
        'cat-lavender':     '#CE93D8',
        'cat-purple':       '#7B3FE4',
        'cat-purple-light': '#AB7BF0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card:         '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,.08)',
      },
    },
  },
}
