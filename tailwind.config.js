/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/frontend/**/*.{js,ts,jsx,tsx}",
    "./app/views/**/*.{erb,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1ff",
          100: "#cce3ff",
          200: "#99c7ff",
          300: "#66abff",
          400: "#338fff",
          500: "#0073ff",
          600: "#005ccc",
          700: "#004599",
          800: "#002e66",
          900: "#001733",
        },
        secondary: {
          50: "#f7f7f7",
          100: "#e3e3e3",
          200: "#c8c8c8",
          300: "#a4a4a4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#272727",
        },
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui", "-apple-system"],
      },
    },
  },
  plugins: [],
};
