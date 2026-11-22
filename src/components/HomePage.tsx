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
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import { OurWeekRecap } from '@/components/OurWeekRecap';
import { RegionProvider } from '@/context/RegionContext';
import { photoNow } from '@/lib/photos';
import { phaseFor } from '@/lib/photo-rules';
import { getGalleryImages } from '@/lib/gallery';
import type { Region } from '@/lib/region';

const MARQUEE: Record<Region, string[]> = {
  all: ['Augusta & Georges', 'Accra · 2 XII', 'Dakar · 5 XII', 'MMXXVI', 'Two homelands, one union'],
  gh: ['Augusta & Georges', 'Accra · 2 XII', 'MMXXVI', 'Two homelands, one union'],
};

const NAV: Record<ReturnType<typeof phaseFor>, string[] | undefined> = {
  before: undefined, // everything
  live: ['photos', 'week', 'travel', 'story', 'gallery', 'witnesses', 'prayers'],
  after: ['photos', 'week', 'gallery', 'prayers'],
};

/**
 * The home page follows the calendar (date check at render; the page
 * revalidates every 10 minutes, so no deploy is needed):
 *  - before 1 Dec: the invitation, as it has always been;
 *  - 1–6 Dec: the guest photo album leads, the practical week follows;
 *  - from 7 Dec: the album leads, the week shrinks to a short recap.
 */
export function HomePage({ region }: { region: Region }) {
  const images = getGalleryImages();
  const phase = phaseFor(photoNow());

  return (
    <RegionProvider region={region}>
      <ScrollProgress />
      <MusicToggle />
      <Header sections={NAV[phase]} />
      <main>
        {phase === 'before' && (
          <>
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
          </>
        )}
        {phase === 'live' && (
          <>
            <PhotoGallery region={region} variant="home" />
            <Marquee items={MARQUEE[region]} />
            <TheWeek />
            <TravelStay />
            <OurStory />
            <Gallery images={images} />
            <Witnesses />
            <Prayers />
          </>
        )}
        {phase === 'after' && (
          <>
            <PhotoGallery region={region} variant="home" />
            <Marquee items={MARQUEE[region]} />
            <OurWeekRecap />
            <Gallery images={images} />
            <Prayers />
          </>
        )}
      </main>
      <Footer />
    </RegionProvider>
  );
}
