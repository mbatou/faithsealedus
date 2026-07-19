import type { Config } from 'tailwindcss';

/**
 * "Editorial Atelier" — an original, magazine-catalogue take on a wedding site.
 *  - Pure black canvas (#000), delineated by champagne-gold hairlines, not fills
 *  - Section index numerals + vertical labels for a print-editorial rhythm
 *  - A signature "union" mark (two interlocked rings) as the recurring motif
 *  - High-contrast Playfair display + a clean sans, ivory text
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
        // Pure black base — no charcoal fills.
        noir: {
          DEFAULT: '#000000',
          soft: '#000000',
        },
        // Barely-there lifts, used only where a hairline can't do the job.
        panel: {
          DEFAULT: '#070707',
          light: '#0D0C0B',
        },
        gold: {
          DEFAULT: '#C6A15B',
          light: '#E4CB93',
          dark: '#8C6D34',
        },
        ivory: {
          DEFAULT: '#F4EFE6',
          dim: '#B9B2A6',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.34em',
        widest2: '0.5em',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '0.5' },
          '45%': { opacity: '0.62' },
          '55%': { opacity: '0.44' },
          '70%': { opacity: '0.6' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        flicker: 'flicker 7s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
