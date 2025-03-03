/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2A9D8F',
          dark: '#227c71',
        },
        secondary: '#264653',
        accent: {
          DEFAULT: '#E76F51',
          light: '#e05a39',
        },
        highlight: '#F4A261',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
    },
    fontFamily: {
      'sans': ['Inter', 'sans-serif'],
      'display': ['Poppins', 'sans-serif'],
    },
  },
  plugins: [],
};
