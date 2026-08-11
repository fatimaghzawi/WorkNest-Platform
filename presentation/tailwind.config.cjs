/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wn: {
          primary: '#49225B',
          hover: '#6E3482',
          active: '#321440',
          accent: '#A56ABD',
          orange: '#F97316',
          teal: '#14B8A6',
          page: '#F3ECF8',
          canvas: '#EDE4F5',
          soft: '#EDE4F5',
          light: '#E7DBEF',
          surface: '#FFFFFF',
          ink: '#1A1224',
          onPage: '#1A1224',
          muted: '#5B5268',
          faint: '#8B8298',
          line: '#E8E0F0',
          success: '#14B8A6',
        },
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(73, 34, 91, 0.10)',
        lift: '0 24px 60px rgba(73, 34, 91, 0.14)',
        card: '0 12px 36px rgba(73, 34, 91, 0.08)',
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
};
