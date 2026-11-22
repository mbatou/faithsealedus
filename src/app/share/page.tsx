import type { Metadata } from 'next';
import { MiniHeader } from '@/components/photos/MiniHeader';
import { ShareClient } from '@/components/photos/ShareClient';

export const metadata: Metadata = {
  title: 'Share your photos — Augusta & Georges',
  description: 'Add your photos to Augusta & Georges’s wedding album.',
  robots: { index: false, follow: false },
};

// The QR code on the table cards points here.
export default function SharePage() {
  return (
    <>
      <MiniHeader />
      <ShareClient />
    </>
  );
}
