import type { Metadata } from 'next';
import { MenuPage } from './MenuPage';

const description =
  'Saturday, 5 December 2026 · Dinner begins at 8:00 pm · Maison Madera, Dakar. Samedi 5 décembre · 20h00.';

export const metadata: Metadata = {
  metadataBase: new URL('https://faithsealedus.vercel.app'),
  title: 'The Dinner · Augusta & Georges',
  description,
  openGraph: {
    title: 'Welcome to our table · Augusta & Georges',
    description,
    type: 'website',
    url: '/menu',
    images: [{ url: '/dinner-share.jpg', width: 1200, height: 630, alt: 'Augusta & Georges' }],
  },
  // Unlisted page, shared by link with dinner guests only.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MenuPage />;
}
