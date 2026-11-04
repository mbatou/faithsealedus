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
import { RegionProvider } from '@/context/RegionContext';
import { getGalleryImages } from '@/lib/gallery';
import type { Region } from '@/lib/region';

const MARQUEE: Record<Region, string[]> = {
  all: ['Augusta & Georges', 'Accra · 2 XII', 'Dakar · 5 XII', 'MMXXVI', 'Two homelands, one union'],
  gh: ['Augusta & Georges', 'Accra · 2 XII', 'MMXXVI', 'Two homelands, one union'],
};

export function HomePage({ region }: { region: Region }) {
  const images = getGalleryImages();

  return (
    <RegionProvider region={region}>
      <ScrollProgress />
      <MusicToggle />
      <Header />
      <main>
        <Hero />
        <Marquee items={MARQUEE[region]} />
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
    </RegionProvider>
  );
}
