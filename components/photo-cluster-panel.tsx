"use client";

import { useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import type { SanityPhoto } from '@/lib/types';

type PhotoClusterPanelProps = {
  photos: SanityPhoto[];
  onSelect: (photo: SanityPhoto) => void;
  onClose: () => void;
};

export default function PhotoClusterPanel({ photos, onSelect, onClose }: PhotoClusterPanelProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-zinc-400 flex items-center gap-2">
            <MapPin size={15} className="text-[#EAB308]" />
            {photos.length} {photos.length === 1 ? 'zdjęcie' : 'zdjęć'} w tym miejscu
          </p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
            aria-label="Zamknij"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <button
              key={photo._id}
              onClick={() => onSelect(photo)}
              className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 text-left"
            >
              <img
                src={getImageUrl(photo.image, 400)}
                alt={photo.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-xs font-medium">{photo.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
