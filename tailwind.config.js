/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          forest: '#1A3B2F',
          forestDark: '#132C23',
          forestLight: '#2A5745',
          paper: '#F7F5F0',
          ink: '#1A1D20',
          charcoal: '#2D3238',
          border: '#E2DFD6',
          burgundy: '#8C1D24',
          navy: '#183654',
          sage: '#4A6B5D',
          gold: '#B89758'
        },
        economist: {
          red: '#8C1D24', // softened from #E3120B to refined classic burgundy
          darkRed: '#6B141A',
          sand: '#F7F5F0',
          ink: '#1A1D20',
          charcoal: '#2D3238',
          border: '#E2DFD6',
          accent: '#183654'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
