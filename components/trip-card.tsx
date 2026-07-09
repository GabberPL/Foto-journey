import Link from 'next/link';
import { Camera, MapPin } from 'lucide-react';
import { formatTripDates, getImageUrl } from '@/lib/utils';
import type { Trip } from '@/lib/types';

export default function TripCard({ trip }: { trip: Trip }) {
  const slug = trip.slug?.current;
  const dates = formatTripDates(trip.startDate, trip.endDate);
  const cover = trip.coverImage
    ? getImageUrl(trip.coverImage, 1200)
    : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

  const card = (
    <article className="scroll-reveal overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 transition-all duration-300 hover:border-[#EAB308]/40 hover:shadow-lg hover:shadow-[#EAB308]/10 h-full">
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={cover}
          alt={trip.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
          <span className="text-[#EAB308] font-mono uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={13} />
            {trip.countries?.length ? trip.countries.join(' · ') : 'Wyprawa'}
          </span>
          {dates ? <span>{dates}</span> : null}
        </div>
        <h3 className="text-xl font-semibold text-white">{trip.title}</h3>
        <p className="mt-3 text-zinc-400 font-light leading-relaxed">{trip.excerpt || 'Dodaj opis wyprawy w Sanity.'}</p>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="font-medium text-[#EAB308]">Czytaj całość →</span>
          {trip.photoCount ? (
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Camera size={14} /> {trip.photoCount} zdjęć
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );

  return slug ? <Link href={`/wyprawy/${slug}`} className="block h-full">{card}</Link> : card;
}
