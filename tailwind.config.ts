import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: 'class',
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
        xs: "400px",
      },
      spacing: {
        'menu-padding': '12px',
      },
    },
  },

  plugins: [
    plugin(function({ addComponents }) {
      addComponents({
        '.form-input, .form-select': {
          '@apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors': {},
        },
        '.table-header': {
          '@apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider': {},
        },
        '.table-cell': {
          '@apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100': {},
        },
      });
    }),
  ],
};

export default config;
