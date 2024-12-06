/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors:{
        primary: ['#181818'],
        secondary: ['#2e2e2e'],
        ramsayBlue: ['#0b47d2']
      },
      fontFamily: {
        title: ['Oswald'],
        body: ['Raleway'],
      },
      height: {
        'l': '500px',
        'xl': '600px'

      }
    },
  },
  plugins: [],
}