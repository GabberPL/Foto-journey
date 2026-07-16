"use client";

import { useEffect, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import PhotoLightbox from './photo-lightbox';
import { getCategoryTitle, getImageUrl, getPhotoCategories } from '@/lib/utils';
import type { SanityPhoto } from '@/lib/types';

const PICK_COUNT = 4;

/**
 * Losuje 4 kadry z puli wyróżnionych — dopiero po zamontowaniu w przeglądarce,
 * żeby wynik SSR i klienta się nie rozjechał. Do tego czasu pokazuje szkielet.
 */
export default function FeaturedPhotos({ pool }: { pool: SanityPhoto[] }) {
  const [picked, setPicked] = useState<SanityPhoto[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPicked(shuffled.slice(0, PICK_COUNT));
  }, [pool]);

  if (pool.length === 0) {
    return <div className="text-zinc-500 text-sm">Brak zdjęć w Sanity.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {picked === null
          ? Array.from({ length: Math.min(PICK_COUNT, pool.length) }).map((_, index) => (
              <div key={index} className="aspect-[3/4] rounded-xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
            ))
          : picked.map((photo, index) => (
              <div
                key={photo._id}
                className="fade-in-soft relative group aspect-[3/4] rounded-xl overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-800"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={getImageUrl(photo.image, 900)}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <span className="text-[#EAB308] text-xs font-mono mb-1">
                    {getPhotoCategories(photo.category).map(getCategoryTitle).join(', ')}
                  </span>
                  <h3 className="text-white text-base font-medium">{photo.title}</h3>
                  <p className="text-zinc-300 text-xs flex items-center gap-1 mt-1.5">
                    <MapIcon size={11} /> {photo.location || photo.country || 'Brak lokalizacji'}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {lightboxIndex !== null && picked && (
        <PhotoLightbox
          photos={picked}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
