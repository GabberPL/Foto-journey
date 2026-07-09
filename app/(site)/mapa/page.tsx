import Link from 'next/link';
import type { Metadata } from 'next';
import PhotoMap from '@/components/photo-map';
import { fetchAllPhotos } from '@/lib/queries';
import type { CountryMarker } from '@/lib/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Mapa podróży',
  description: 'Miejsca, w których powstały kadry — przybliżaj, aby rozdzielić piny.',
};

const countCountries = (rows: Array<{ country?: string }>): CountryMarker[] => {
  const counts = new Map<string, number>();
  rows.forEach(({ country }) => {
    const name = country?.trim();
    if (!name) return;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return Array.from(counts, ([country, count]) => ({ country, count }));
};

export default async function MapPage() {
  const photos = await fetchAllPhotos().catch(() => []);

  const preciselyPinned = photos.filter((photo) => photo.coords);
  // Kraje pokazujemy zbiorczo tylko dla zdjęć bez dokładnego pinu — bez podwójnego liczenia
  const countryMarkers = countCountries(photos.filter((photo) => !photo.coords));
  const chips = countCountries(photos).sort((a, b) => b.count - a.count);

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Eksploracja</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Mapa Podróży</h1>
          <p className="text-zinc-400 font-light max-w-2xl">
            Miejsca, które ukształtowały moje spojrzenie. Przybliżaj mapę, aby rozdzielić skupiska —
            klik w pojedynczy pin otwiera zdjęcie.
          </p>
        </div>

        <PhotoMap
          photos={preciselyPinned}
          countryMarkers={countryMarkers}
          className="h-[60vh] md:h-[70vh] rounded-2xl border border-zinc-800"
        />

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-zinc-500">
          <span className="flex items-center gap-2">
            <i className="inline-block w-3 h-3 rounded-full bg-[#EAB308] border border-black" />
            dokładne miejsce zdjęcia (klik = podgląd)
          </span>
          <span className="flex items-center gap-2">
            <i className="inline-block w-3 h-3 rounded-full border-2 border-[#EAB308] bg-transparent" />
            zdjęcia oznaczone tylko krajem (klik = galeria)
          </span>
        </div>

        {chips.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {chips.map(({ country, count }) => (
              <Link
                key={country}
                href={`/galeria?kraj=${encodeURIComponent(country)}`}
                className="scroll-reveal flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-300 transition hover:border-[#EAB308]/60 hover:text-white"
              >
                {country}
                <span className="text-xs font-mono text-[#EAB308]">{count}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-zinc-500 text-sm">Brak zdjęć z przypisanym krajem — uzupełnij pole „Kraj” w Sanity.</p>
        )}
      </div>
    </main>
  );
}
