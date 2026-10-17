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
          dark: '#080b11',
          card: '#121724',
          surface: '#182032',
          border: '#202a42',
          hover: '#242e48',
          blue: '#007aff',
          'blue-hover': '#1a88ff',
          accent: '#007aff',
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
