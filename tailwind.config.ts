import type { Config } from 'tailwindcss';

/**
 * Dark editorial luxury.
 *  - Base near-black with charcoal section cards
 *  - Champagne-gold accent used sparingly (dividers, buttons, names)
 *  - Ivory text, candlelit low-light mood
 */
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          DEFAULT: '#0B0B0B',
          soft: '#0F0E0D',
        },
        charcoal: {
          DEFAULT: '#161514',
          light: '#1E1B18',
          dark: '#100F0E',
        },
        gold: {
          DEFAULT: '#C6A15B',
          light: '#D9BC86',
          dark: '#A8823F',
        },
        ivory: {
          DEFAULT: '#F4EFE6',
          dim: '#CDC7BB',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.32em',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '0.55' },
          '45%': { opacity: '0.7' },
          '55%': { opacity: '0.5' },
          '70%': { opacity: '0.68' },
        },
      },
      animation: {
        flicker: 'flicker 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
