/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#f0f4fc',
          100: '#d9e3f2',
          200: '#b3c8e6',
          300: '#8dadd9',
          400: '#6691cc',
          500: '#1a3a6b',
          600: '#0f2a52',
          700: '#0a1f3d',
          800: '#061530',
          900: '#030a1a',
        },
        secondary: {
          50: '#fffdf0',
          100: '#fff9d6',
          200: '#fff0a3',
          300: '#ffe570',
          400: '#ffd83d',
          500: '#d4a017',
          600: '#b8860b',
          700: '#8b6508',
          800: '#5c4205',
          900: '#2e2103',
        },
        accent: {
          50: '#fdf8f0',
          100: '#f9edd6',
          200: '#f2d8a3',
          300: '#ebc270',
          400: '#e3ac3d',
          500: '#c8960a',
          600: '#a67a08',
          700: '#7d5c06',
          800: '#533d04',
          900: '#2a1f02',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(212, 160, 23, 0.1)' },
          '100%': { boxShadow: '0 0 24px rgba(212, 160, 23, 0.25)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-subtle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

