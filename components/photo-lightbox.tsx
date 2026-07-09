"use client";

import { useEffect } from 'react';
import { Aperture, Camera, Clock, Gauge, Map as MapIcon, X, Zap } from 'lucide-react';
import { getCategoryTitle, getImageUrl, getPhotoCategories } from '@/lib/utils';
import type { SanityPhoto } from '@/lib/types';

export default function PhotoLightbox({ photo, onClose }: { photo: SanityPhoto; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-400 hover:text-white z-50 p-2 bg-zinc-900/50 rounded-full transition-colors"
        onClick={onClose}
        aria-label="Zamknij podgląd"
      >
        <X size={24} />
      </button>

      <div
        className="flex flex-col md:flex-row max-w-7xl w-full h-full max-h-[90vh] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 bg-[#050505] flex items-center justify-center p-4 relative">
          <img
            src={getImageUrl(photo.image)}
            alt={photo.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div className="w-full md:w-80 lg:w-96 bg-zinc-950 p-6 md:p-8 border-l border-zinc-900 flex flex-col overflow-y-auto">
          <span className="inline-block self-start px-2 py-1 bg-zinc-900 text-[#EAB308] text-xs font-mono uppercase tracking-wider rounded mb-4">
            {getPhotoCategories(photo.category).map(getCategoryTitle).join(', ')}
          </span>
          <h3 className="text-2xl font-bold text-white mb-4">{photo.title}</h3>

          <p className="text-zinc-400 text-sm mb-8 flex items-start gap-2">
            <MapIcon size={16} className="shrink-0 mt-0.5 text-zinc-500" />
            {[photo.location, photo.country].filter(Boolean).join(', ') || 'Brak lokalizacji'}
          </p>

          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Parametry EXIF</h4>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Camera size={14} /> Aparat</span>
                <span className="text-zinc-200 text-sm font-medium">{photo.exif?.camera || 'Brak danych'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Aperture size={14} /> Obiektyw</span>
                <span className="text-zinc-200 text-sm font-medium">{photo.exif?.lens || 'Brak danych'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Zap size={14} /> Przysłona</span>
                <span className="text-zinc-200 text-sm font-medium">{photo.exif?.aperture || 'Brak danych'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Clock size={14} /> Migawka</span>
                <span className="text-zinc-200 text-sm font-medium">{photo.exif?.speed || 'Brak danych'}</span>
              </div>
              {photo.exif?.iso ? (
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Gauge size={14} /> ISO</span>
                  <span className="text-zinc-200 text-sm font-medium">{photo.exif.iso}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
