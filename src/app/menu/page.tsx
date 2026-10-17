import type { Metadata } from 'next';
import { MenuPage } from './MenuPage';

export const metadata: Metadata = {
  title: 'The Dinner · Augusta & Georges',
  description: 'Choose your meal for the dinner — Maison Madera, 5 December 2026.',
  // Unlisted page, shared by link with dinner guests only.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MenuPage />;
}
