import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { OurStory } from '@/components/OurStory';
import { TheWeek } from '@/components/TheWeek';
import { Gallery } from '@/components/Gallery';
import { TravelStay } from '@/components/TravelStay';
import { Rsvp } from '@/components/Rsvp';
import { Countdown } from '@/components/Countdown';
import { Footer } from '@/components/Footer';
import { getGalleryImages } from '@/lib/gallery';

// Gallery images are fetched from Supabase Storage at request time.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const images = await getGalleryImages();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <OurStory />
        <TheWeek />
        <Gallery images={images} />
        <TravelStay />
        <Countdown />
        <Rsvp />
      </main>
      <Footer />
    </>
  );
}
