module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        zinc: {
          50: '#fafafa',
          900: '#18181b',
          950: '#09090b',
        }
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '6px',
      }
    },
  },
  plugins: [],
}
