import type { Config } from 'tailwindcss';

/**
 * Palette drawn from West African textile traditions:
 *  - Ghanaian Kente: gold, warm red, deep green, ink black
 *  - Senegalese indigo & wax prints: indigo, terracotta, ochre, sand
 * The intent is warm, celebratory, and grounded in cloth colour.
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
        sand: {
          50: '#fbf7f0',
          100: '#f5ecdd',
          200: '#ecdcc2',
          300: '#dfc39b',
        },
        terracotta: {
          DEFAULT: '#b5482e',
          light: '#c9694f',
          dark: '#8f3822',
        },
        ochre: {
          DEFAULT: '#d99a2b',
          light: '#e9b657',
          dark: '#b47c17',
        },
        kente: {
          green: '#1f6b46',
          gold: '#e0a516',
          red: '#a51f2c',
        },
        indigo: {
          deep: '#243a6b',
          dusk: '#33477a',
        },
        ink: '#2a211b',
        cream: '#fdfaf4',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      keyframes: {
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'gradient-pan': 'gradient-pan 18s ease infinite',
      },
      backgroundImage: {
        'kente-band':
          'repeating-linear-gradient(90deg, #1f6b46 0 12px, #e0a516 12px 24px, #a51f2c 24px 36px, #243a6b 36px 48px)',
      },
    },
  },
  plugins: [],
};

export default config;
