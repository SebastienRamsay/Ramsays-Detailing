/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        social: "1360px",
        nav: "900px",
        lg: "1333px",
        md: "1080px",
      },
      colors: {
        primary: ["#181818"],
        secondary: ["#2e2e2e"],
        ramsayBlue: ["#0b47d2"],
        ramsayBlueHover: ["#0b4dd2"],
        ramsayGray: ["#bbbbbb"],
      },
      fontFamily: {
        title: ["Oswald"],
        body: ["Raleway"],
      },
      height: {
        l: "500px",
        xl: "600px",
      },
      keyframes: {
        "open-menu": {
          "0%": { transform: "scaleX(0)" },
          "80%": { transform: "scaleX(1.1)" },
          "100%": { transform: "scaleX(1)" },
        },
        "open-menu-down": {
          "0%": { transform: "scaleY(0)" },
          "80%": { transform: "scaleY(1.1)" },
          "100%": { transform: "scaleY(1)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "open-menu-spin": {
          "0%": { transform: "rotate(0deg) scale(0)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        "open-menu-spin-reverse": {
          "0%": { transform: "rotate(0deg) scale(0)" },
          "60%": { transform: "rotate(-360deg)" },
          "80%": { transform: "scale(1) scaleX(1.1)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "spin-once": "spin 0.5s linear",
        "open-menu": "open-menu 0.4s ease-in-out",
        "fade-in": "fade-in 0.3s ease-in-out",
        "open-menu-down": "open-menu-down 0.5s ease-in-out",
        "open-menu-spin": "open-menu-spin 0.5s ease-in-out",
        "open-menu-spin-reverse": "open-menu-spin-reverse 1s ease-in-out",
      },
    },
  },
  plugins: [],
};
