/** @type {import('tailwindcss').Config} */ // type
module.exports = {
  content: [
    "./index.html", // html
    "./src/**/*.{ts,tsx}" // ts/tsx
  ],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {} // no custom theme
  },
  plugins: [] // no plugins
};