/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:'#16a34a', dark:'#15803d', light:'#dcfce7' },
        navy: { DEFAULT:'#0f2d40', light:'#1a3d55' },
      },
      fontFamily: { sans:['Inter','system-ui','sans-serif'] },
      boxShadow: { card:'0 1px 4px 0 rgba(0,0,0,0.07)', modal:'0 8px 32px 0 rgba(0,0,0,0.18)' },
    },
  },
  plugins: [],
}
