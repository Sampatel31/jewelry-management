import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FAF5DC',
          100: '#F5EBB9',
          200: '#ECD773',
          300: '#E2C32D',
          400: '#D4AF37',
          500: '#B8960C',
          600: '#8B7209',
          700: '#5F4E06',
          800: '#332A03',
          900: '#080701',
        },
        dark: {
          DEFAULT: '#1a1a2e',
          50: '#f0f0f8',
          100: '#e0e0f0',
          200: '#c0c0e0',
          300: '#9090c8',
          400: '#6060a8',
          500: '#404088',
          600: '#303068',
          700: '#202050',
          800: '#1a1a2e',
          900: '#0d0d1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
