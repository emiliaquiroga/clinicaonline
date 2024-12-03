/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        customDarkBlue: '#0d0f36',
        customBlue: '#294380',
        customLightBlue: '#69d2cd',
        customWaterGreen: '#b9f1d6',
        customYellow: '#f1f6ce'
      }
    },
  },
  plugins: [],
}

