import { Suspense } from 'react';
import type { Metadata } from 'next';
import GalleryExplorer from '@/components/gallery-explorer';
import { fetchAllPhotos } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Galeria',
  description: 'Pełne archiwum kadrów — filtruj według kategorii i kraju.',
};

export default async function GalleryPage() {
  const photos = await fetchAllPhotos().catch(() => []);

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Archiwum</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Galeria</h1>
          <p className="text-zinc-400 font-light">Eksploruj według kategorii i kraju — filtr zapisuje się w adresie, więc każdy widok można podlinkować.</p>
        </div>

        <Suspense fallback={<div className="text-zinc-500 text-sm">Ładowanie galerii...</div>}>
          <GalleryExplorer photos={photos} />
        </Suspense>
      </div>
    </main>
  );
}
