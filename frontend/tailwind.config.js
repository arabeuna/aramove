/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          DEFAULT: '#9d62e1', // Cor roxa principal
          light: '#b288e8',   // Versão mais clara (15% mais clara)
          dark: '#8445c7'     // Versão mais escura (15% mais escura)
        }
      }
    },
  },
  plugins: [],
} 