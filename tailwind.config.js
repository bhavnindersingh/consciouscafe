/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6B8E4E',
          DEFAULT: '#4A6F2A',
          dark: '#3A5B1E',
        },
        secondary: {
          light: '#E9BE7E',
          DEFAULT: '#D6A75B',
          dark: '#B58A43',
        },
        terracotta: {
          light: '#E07A5F',
          DEFAULT: '#CD5D41',
          dark: '#B34A2F',
        },
        neutral: {
          cream: '#F7F4ED',
          sand: '#E6DFD3',
          stone: '#AEA69C',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/images/hero-bg.jpg')",
      }
    },
  },
  plugins: [],
}
