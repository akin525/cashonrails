import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // or 'media' or 'class'
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeInScale: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95) translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          },
        },
        fadeOutScale: {
          '0%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.95) translateY(-10px)'
          },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.5s ease-out',
        fadeInScale: 'fadeInScale 0.3s ease-out',
        fadeOutScale: 'fadeOutScale 0.2s ease-in forwards',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bar: 'var(--bar)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
          background: 'var(--secondary-background)'
        },
      },
      screens: {
        xs: "400px", // Custom screen size for better mobile handling
      },
      spacing: {
        'menu-padding': '12px',
      },
    },
  },

  plugins: [],
};

export default config;
