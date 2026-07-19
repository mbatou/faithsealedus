'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import type { GalleryImage } from '@/lib/gallery';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export function Gallery({ images }: { images: GalleryImage[] }) {
  const { t } = useLanguage();
  const [active, setActive] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="section-pad bg-noir">
      <div className="container-page">
        <SectionHeading
          kicker={t.gallery.kicker}
          title={t.gallery.title}
          intro={t.gallery.intro}
        />

        {images.length === 0 ? (
          <p className="mt-14 text-center text-ivory-dim">{t.gallery.empty}</p>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {images.map((img, i) => (
              <Reveal
                key={img.src}
                delay={(i % 3) * 0.08}
                className={i % 5 === 0 ? 'col-span-2 sm:col-span-1' : ''}
              >
                <button
                  type="button"
                  onClick={() => setActive(img)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-sm ring-1 ring-gold/25 transition duration-500 hover:ring-gold/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-noir/30 transition duration-500 group-hover:bg-noir/0" />
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-noir/92 p-4 backdrop-blur-sm"
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold backdrop-blur transition hover:bg-gold/10"
              onClick={() => setActive(null)}
            >
              ✕
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="relative h-[70vh] w-full max-w-3xl overflow-hidden rounded-sm ring-1 ring-gold/40"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
