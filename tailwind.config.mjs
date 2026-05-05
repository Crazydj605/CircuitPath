/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        circuit: {
          dark: '#0d0d10',
          panel: '#16161a',
          accent: '#5c7cfa',
          secondary: '#868e96',
          success: '#40c057',
          warning: '#fab005',
          danger: '#fa5252',
          muted: '#343a40',
        }
      },
      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
