import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { MiniHeader } from '@/components/photos/MiniHeader';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import { Footer } from '@/components/Footer';
import { regionFromCountryHeader } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'The album — Augusta & Georges',
  description: 'Our week, through your eyes.',
  robots: { index: false, follow: false },
};

// Rendered per request only to read the visitor's country: visitors in Ghana
// get the Accra-only album, like the rest of the site.
export const dynamic = 'force-dynamic';

export default function GalleryPage() {
  const region = regionFromCountryHeader(headers().get('x-vercel-ip-country'));
  return (
    <>
      <MiniHeader />
      <PhotoGallery region={region} variant="page" />
      <Footer />
    </>
  );
}
