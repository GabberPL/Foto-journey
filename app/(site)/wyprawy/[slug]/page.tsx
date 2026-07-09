import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import PhotoGrid from '@/components/photo-grid';
import PhotoMap from '@/components/photo-map';
import { fetchTripBySlug } from '@/lib/queries';
import { formatTripDates, getImageUrl } from '@/lib/utils';

export const revalidate = 60;

type TripPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = await fetchTripBySlug(slug).catch(() => null);
  if (!trip) return { title: 'Wyprawa' };
  return {
    title: trip.title,
    description: trip.excerpt,
  };
}

export default async function TripPage({ params }: TripPageProps) {
  const { slug } = await params;
  const trip = await fetchTripBySlug(slug).catch(() => null);
  if (!trip) notFound();

  const dates = formatTripDates(trip.startDate, trip.endDate);
  const cover = trip.coverImage
    ? getImageUrl(trip.coverImage)
    : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop';
  const tripMarkers = (trip.countries ?? []).map((country) => ({ country, count: 0 }));
  const photos = trip.photos ?? [];
  const pinnedPhotos = photos.filter((photo) => photo.coords);

  return (
    <main className="min-h-screen">
      {/* Okładka */}
      <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
        <img src={cover} alt={trip.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/60" />
        <div className="relative z-10 max-w-5xl mx-auto w-full px-6 pb-12">
          <Link
            href="/wyprawy"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Wszystkie wyprawy
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">{trip.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            {trip.countries?.length ? (
              <span className="flex items-center gap-2 text-[#EAB308] font-mono uppercase tracking-wider">
                <MapPin size={14} /> {trip.countries.join(' · ')}
              </span>
            ) : null}
            {dates ? (
              <span className="flex items-center gap-2">
                <Calendar size={14} /> {dates}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {/* Treść */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {trip.excerpt ? (
            <p className="text-xl text-zinc-300 font-light leading-relaxed mb-10">{trip.excerpt}</p>
          ) : null}
          {trip.body && trip.body.length > 0 ? (
            <div className="space-y-4">
              <PortableText
                value={trip.body}
                components={{
                  block: {
                    normal: ({ children }) => <p className="text-zinc-300 font-light leading-8">{children}</p>,
                  },
                }}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Trasa */}
      {tripMarkers.length > 0 || pinnedPhotos.length > 0 ? (
        <section className="py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-6">Trasa wyprawy</h2>
            <PhotoMap
              photos={pinnedPhotos}
              countryMarkers={tripMarkers}
              showZoomControl={false}
              className="h-64 md:h-80 rounded-2xl border border-zinc-800"
            />
          </div>
        </section>
      ) : null}

      {/* Kadry z wyprawy */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">Kadry z tej wyprawy</h2>
          <PhotoGrid
            photos={photos}
            emptyMessage="Brak podpiętych zdjęć — dodaj je do wyprawy w Sanity Studio."
          />
        </div>
      </section>
    </main>
  );
}
