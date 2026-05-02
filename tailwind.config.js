/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          400: "#F0C040",
          500: "#D4A820",
          600: "#B8900A",
        },
        navy: {
          900: "#0A0F1E",
          800: "#0F1629",
          700: "#151E35",
          600: "#1C2845",
          500: "#243258",
        },
      },
    },
  },
  plugins: [],
};

