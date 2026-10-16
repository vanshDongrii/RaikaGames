/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        raika: {
          dark: '#0a0d14',
          card: '#121622',
          surface: '#181e2e',
          border: '#242d45',
          hover: '#2a3450',
          accent: '#10b981',
          gold: '#fbbf24',
          ruby: '#f43f5e',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          muted: '#8e9aaf'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'glow-gold': '0 0 20px -3px rgba(251, 191, 36, 0.4)',
        'glow-ruby': '0 0 20px -3px rgba(244, 63, 94, 0.4)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
