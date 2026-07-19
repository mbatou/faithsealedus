import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Augusta & Georges — Accra & Dakar, December 2026',
  description:
    'Augusta & Georges are getting married — a bilingual celebration across Ghana and Senegal. Two homelands, one union. Accra, 2 December · Dakar, 4 December 2026.',
  openGraph: {
    title: 'Augusta & Georges are getting married',
    description:
      'Two homelands, one union. Accra — 2 December · Dakar — 4 December 2026.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
