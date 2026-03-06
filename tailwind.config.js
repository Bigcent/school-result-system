/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#F0FFF4",
          100: "#D8F3DC",
          200: "#B7E4C7",
          300: "#95D5B2",
          400: "#74C69D",
          500: "#52B788",
          600: "#40916C",
          700: "#2D6A4F",
          800: "#1B4332",
          900: "#081C15",
        },
        sand: {
          50: "#FAFAF7",
          100: "#F7F5F0",
          200: "#F0EDE6",
          300: "#E8E4DD",
          400: "#D4CFC5",
        },
      },
    },
  },
  plugins: [],
};
