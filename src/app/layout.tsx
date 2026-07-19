import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Mulish } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Mulish({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Faith & Georges — Accra & Dakar, December 2026',
  description:
    'Join us for a bilingual celebration of love across Ghana and Senegal — one joyful week, two cultures, a lifetime together.',
  openGraph: {
    title: 'Faith & Georges are getting married',
    description:
      'Two countries, one week, a lifetime of celebration. Accra & Dakar · December 2026.',
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
