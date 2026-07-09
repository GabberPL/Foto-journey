import type { Metadata } from 'next';
import TripCard from '@/components/trip-card';
import { fetchTrips } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Wyprawy',
  description: 'Historie z podróży — wydarzenia, miejsca i chwile, które zostawiły ślad.',
};

export default async function TripsPage() {
  const trips = await fetchTrips().catch(() => []);

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Dziennik</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Wyprawy</h1>
          <p className="text-zinc-400 font-light">Wydarzenia, miejsca i chwile, które zostawiły ślad.</p>
        </div>

        {trips.length === 0 ? (
          <p className="text-zinc-500 text-sm">Brak wypraw — dodaj pierwszą w Sanity Studio.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
