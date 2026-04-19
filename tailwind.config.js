/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        muted: '#888888',
        surface: '#F4F4F4',
        border: '#E0E0E0',
      },
      fontSize: {
        label: ['11px', '16px'],
        caption: ['12px', '18px'],
      },
    },
  },
  plugins: [],
}
