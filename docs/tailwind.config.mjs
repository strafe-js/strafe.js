/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './content/**/*.mdx',
    './node_modules/fumadocs-ui/dist/**/*.js',
    '../node_modules/fumadocs-ui/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        strafe: {
          bg: '#101114',
          card: '#17191c',
          border: '#2f3237',
          green: {
            DEFAULT: '#509b6b',
            hover: '#45875d',
            light: '#6db888',
          },
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#509b6b',
          600: '#45875d',
          700: '#386f4c',
        },
      },
    },
  },
  plugins: [],
};
