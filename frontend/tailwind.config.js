/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0F1115',          // deep charcoal background
        surface: '#1A1D24',     // card/panel slate
        surface2: '#23272F',    // slightly lighter slate (hover states)
        border: '#2C313A',
        text: '#E8E9EC',        // off-white primary text
        muted: '#8B919C',       // muted gray secondary text
        lime: '#C6FF3A',        // electric lime accent ("sniper" color)
        limeDark: '#9FCC2E',
        success: '#3DDC97',     // success green for deals/discounts
        danger: '#FF5C5C',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(198,255,58,0.4), 0 0 24px rgba(198,255,58,0.15)',
      },
    },
  },
  plugins: [],
};
