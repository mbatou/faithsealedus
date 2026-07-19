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
    <section id="gallery" className="section-pad bg-cream">
      <div className="container-page">
        <SectionHeading
          kicker={t.gallery.kicker}
          title={t.gallery.title}
          intro={t.gallery.intro}
        />

        {images.length === 0 ? (
          <p className="mt-12 text-center text-ink/60">{t.gallery.empty}</p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {images.map((img, i) => (
              <Reveal
                key={img.src}
                delay={(i % 3) * 0.06}
                className={i % 5 === 0 ? 'col-span-2 sm:col-span-1' : ''}
              >
                <button
                  type="button"
                  onClick={() => setActive(img)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-2xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10" />
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4"
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream backdrop-blur transition hover:bg-white/20"
              onClick={() => setActive(null)}
            >
              ✕
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="relative h-[70vh] w-full max-w-3xl overflow-hidden rounded-2xl"
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
