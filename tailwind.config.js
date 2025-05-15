/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./pages/**/*.{js,jsx,ts,tsx,mdx}",
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./public/**/*.{html,js}"
  ],
  theme: {
    extend: {
      zIndex: {
        '-10': '-10',
        '0': '0',
        '10': '10',
        '50': '50',
      }
    },
  },
  plugins: [],
};
