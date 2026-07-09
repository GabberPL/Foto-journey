"use client";

import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import PhotoLightbox from './photo-lightbox';
import { getCategoryTitle, getImageUrl, getPhotoCategories } from '@/lib/utils';
import type { SanityPhoto } from '@/lib/types';

const LOAD_STEP = 24;

type PhotoGridProps = {
  photos: SanityPhoto[];
  /** Ile zdjęć pokazać na start; kolejne doładowują się przyciskiem. 0 = wszystkie. */
  initialCount?: number;
  emptyMessage?: string;
};

export default function PhotoGrid({ photos, initialCount = 0, emptyMessage = 'Brak zdjęć.' }: PhotoGridProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<SanityPhoto | null>(null);
  const [visibleCount, setVisibleCount] = useState(initialCount > 0 ? initialCount : Infinity);

  if (photos.length === 0) {
    return <div className="text-zinc-500 text-sm">{emptyMessage}</div>;
  }

  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMore = photos.length > visiblePhotos.length;

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {visiblePhotos.map((photo) => (
          <div
            key={photo._id}
            className="scroll-reveal relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-800"
            onClick={() => setLightboxPhoto(photo)}
          >
            <img
              src={getImageUrl(photo.image, 1200)}
              alt={photo.title}
              loading="lazy"
              className="w-full h-auto object-cover group-hover:scale-105 group-hover:rotate-1 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-[#EAB308] text-xs font-mono mb-1">
                {getPhotoCategories(photo.category).map(getCategoryTitle).join(', ')}
              </span>
              <h3 className="text-white text-lg font-medium">{photo.title}</h3>
              <p className="text-zinc-300 text-sm flex items-center gap-1 mt-2">
                <MapIcon size={12} /> {photo.location || photo.country || 'Brak lokalizacji'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={() => setVisibleCount((count) => count + LOAD_STEP)}
            className="px-8 py-3 rounded-full border border-zinc-700 bg-zinc-900/60 text-sm text-zinc-300 transition hover:border-[#EAB308] hover:text-white"
          >
            Pokaż więcej ({photos.length - visiblePhotos.length})
          </button>
        </div>
      )}

      {lightboxPhoto && <PhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />}
    </>
  );
}
