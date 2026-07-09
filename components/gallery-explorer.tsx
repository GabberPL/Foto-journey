"use client";

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import PhotoGrid from './photo-grid';
import { PHOTO_CATEGORIES } from '@/sanity/categories';
import { normalizeCountryName } from '@/lib/map-data';
import { getPhotoCategories } from '@/lib/utils';
import type { SanityPhoto } from '@/lib/types';

const FILTER_TABS = [{ title: 'Wszystkie', value: 'all' }, ...PHOTO_CATEGORIES];

export default function GalleryExplorer({ photos }: { photos: SanityPhoto[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('kategoria') ?? 'all';
  const activeCountry = searchParams.get('kraj');

  const setFilters = (category: string, country: string | null) => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('kategoria', category);
    if (country) params.set('kraj', country);
    const query = params.toString();
    router.replace(query ? `/galeria?${query}` : '/galeria', { scroll: false });
  };

  const countries = useMemo(() => {
    const unique = new Set(photos.map((photo) => photo.country?.trim()).filter(Boolean) as string[]);
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [photos]);

  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory = activeCategory === 'all'
      ? true
      : getPhotoCategories(photo.category).some((category) => category.toLowerCase() === activeCategory.toLowerCase());
    const matchesCountry = !activeCountry
      ? true
      : normalizeCountryName(photo.country) === normalizeCountryName(activeCountry);
    return matchesCategory && matchesCountry;
  });

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        {/* Kategorie */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map(({ title, value }) => {
            const isActive = activeCategory === value;
            return (
              <button
                key={value}
                onClick={() => setFilters(value, activeCountry)}
                className={`px-4 py-2 rounded-full text-sm transition-colors border ${
                  isActive
                    ? 'bg-white text-black border-white font-medium'
                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {/* Kraj */}
        <div className="flex items-center gap-2">
          <select
            value={activeCountry ?? ''}
            onChange={(e) => setFilters(activeCategory, e.target.value || null)}
            className="rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-300 outline-none transition hover:border-zinc-600 focus:border-[#EAB308]"
            aria-label="Filtruj po kraju"
          >
            <option value="">Wszystkie kraje</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {activeCountry ? (
            <button
              onClick={() => setFilters(activeCategory, null)}
              className="flex items-center gap-1.5 rounded-full border border-[#EAB308]/40 bg-[#EAB308]/10 px-3 py-2 text-sm text-[#EAB308] transition hover:border-[#EAB308]"
            >
              {activeCountry} <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      <p className="mb-8 text-sm text-zinc-500">
        {filteredPhotos.length === photos.length
          ? `${photos.length} kadrów w archiwum`
          : `${filteredPhotos.length} z ${photos.length} kadrów`}
      </p>

      <PhotoGrid
        photos={filteredPhotos}
        initialCount={24}
        emptyMessage="Brak zdjęć dla wybranych filtrów."
      />
    </div>
  );
}
