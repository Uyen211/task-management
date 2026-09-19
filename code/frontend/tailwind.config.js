/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FFF4E6",
        melon: "#FF8F7E",
        cupid: "#FF5CA8",
        veranda: "#30D5C8",
        seafoam: "#7FE7E2",
        charcoal: "#2D2424",
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        script: ['"Playpen Sans"', 'cursive'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'chunky': '24px',
        'super': '32px',
      },
      boxShadow: {
        'pop': '4px 4px 0px #2D2424',
        'pop-lg': '6px 6px 0px #2D2424',
        'soft-pop': '0 10px 30px -5px rgba(255, 143, 126, 0.25)',
      }
    },
  },
  plugins: [],
}
