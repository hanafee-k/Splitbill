// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#3b82f6', // blue-500
        background: {
          DEFAULT: '#ffffff',
          dark: '#0a0a0a',
        },
        foreground: {
          DEFAULT: '#171717',
          dark: '#ededed',
        },
      },
    },
  },
  plugins: [],
};
