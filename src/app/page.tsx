import { Header } from '@/components/Header';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MusicToggle } from '@/components/MusicToggle';
import { Hero } from '@/components/Hero';
import { OurStory } from '@/components/OurStory';
import { TheWeek } from '@/components/TheWeek';
import { Gallery } from '@/components/Gallery';
import { Witnesses } from '@/components/Witnesses';
import { Prayers } from '@/components/Prayers';
import { TravelStay } from '@/components/TravelStay';
import { Rsvp } from '@/components/Rsvp';
import { Countdown } from '@/components/Countdown';
import { Footer } from '@/components/Footer';
import { Marquee } from '@/components/Marquee';
import { getGalleryImages } from '@/lib/gallery';

const marqueeItems = [
  'Augusta & Georges',
  'Accra · 2 XII',
  'Dakar · 5 XII',
  'MMXXVI',
  'Two homelands, one union',
];

// Statically generated with hourly ISR: the page is served straight from the
// CDN (no serverless cold-start or missing env can 404 it). Dynamic bits
// (prayers, RSVP) are handled by client fetches to route handlers.
export const revalidate = 3600;

export default function Home() {
  const images = getGalleryImages();

  return (
    <>
      <ScrollProgress />
      <MusicToggle />
      <Header />
      <main>
        <Hero />
        <Marquee items={marqueeItems} />
        <OurStory />
        <TheWeek />
        <Gallery images={images} />
        <Witnesses />
        <Prayers />
        <TravelStay />
        <Rsvp />
        <Countdown />
      </main>
      <Footer />
    </>
  );
}
