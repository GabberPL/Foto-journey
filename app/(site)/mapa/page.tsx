import Link from 'next/link';
import type { Metadata } from 'next';
import TravelMap from '@/components/travel-map';
import { fetchCountryMarkers } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Mapa podróży',
  description: 'Kraje, które ukształtowały moje spojrzenie — kliknij pin, aby zobaczyć kadry.',
};

export default async function MapPage() {
  const markers = await fetchCountryMarkers().catch(() => []);
  const sorted = [...markers].sort((a, b) => b.count - a.count);

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Eksploracja</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Mapa Podróży</h1>
          <p className="text-zinc-400 font-light max-w-2xl">
            Miejsca, które ukształtowały moje spojrzenie. Kliknij pin, aby przejść do kadrów z danego kraju.
          </p>
        </div>

        <TravelMap
          markers={markers}
          className="h-[60vh] md:h-[70vh] rounded-2xl border border-zinc-800"
        />

        {sorted.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {sorted.map(({ country, count }) => (
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
