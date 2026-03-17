/** @type {import('tailwindcss').Config} */
module.exports = {
  // app ve src klasörlerini mutlaka ekle
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        vakit: {
          bg: '#191919',
          card: '#4f39f6',
          accent: '#10B981',
          accent2: '#21CC95',
          text: '#fafafa',
          textAccent: '#10B981',
          muted: '#94A3B8',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
}