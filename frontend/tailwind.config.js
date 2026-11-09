/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Design System Palette
        brand: {
          bg: '#06080D',
          surface: '#111722',
          'surface-elevated': '#161F2E',
          'surface-border': '#1E283A',
          'surface-card': '#0D131F',
          primary: '#00F59B',
          secondary: '#00F0FF',
          warning: '#FFD600',
          'text-primary': '#F5F7FA',
          'text-secondary': '#929BAA',
          'text-muted': '#5F697A',
        },
        // Backward-compatible dark & neon keys
        dark: {
          950: '#06080D',
          900: '#111722',
          850: '#161F2E',
          800: '#1E283A',
          750: '#253248',
          700: '#2E3D56',
          600: '#425373',
        },
        neon: {
          green: '#00F59B',
          'green-glow': 'rgba(0, 245, 155, 0.25)',
          cyan: '#00F0FF',
          'cyan-glow': 'rgba(0, 240, 255, 0.25)',
          yellow: '#FFD600',
          'yellow-glow': 'rgba(255, 214, 0, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'neon-green': '0 0 20px -3px rgba(0, 245, 155, 0.35)',
        'neon-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.35)',
        'neon-yellow': '0 0 20px -3px rgba(255, 214, 0, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'card-glow': '0 0 0 1px rgba(0, 245, 155, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        'card-glow-cyan': '0 0 0 1px rgba(0, 240, 255, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.5)',
        'elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 245, 155, 0.2), 0 0 15px rgba(0, 245, 155, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(0, 245, 155, 0.4), 0 0 25px rgba(0, 245, 155, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
