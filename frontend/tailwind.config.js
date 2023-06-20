/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors:{
        primary: ['#181818'],
        secondary: ['#2e2e2e']
      },
      fontFamily: {
        title: ['Oswald'],
        body: ['Raleway']
      }
    },
  },
  plugins: [],
}