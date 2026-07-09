import Link from 'next/link';
import { ArrowRight, Camera, ChevronRight, MapPin } from 'lucide-react';
import FeaturedPhotos from '@/components/featured-photos';
import TravelMap from '@/components/travel-map';
import TripCard from '@/components/trip-card';
import {
  fetchCategorySummaries,
  fetchCountryMarkers,
  fetchFeaturedPool,
  fetchLatestTrip,
  fetchSiteSettings,
} from '@/lib/queries';
import { getImageUrl } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, featuredPool, categories, countryMarkers, latestTrip] = await Promise.all([
    fetchSiteSettings().catch(() => null),
    fetchFeaturedPool().catch(() => []),
    fetchCategorySummaries().catch(() => []),
    fetchCountryMarkers().catch(() => []),
    fetchLatestTrip().catch(() => null),
  ]);

  const heroBackgroundImage = getImageUrl(settings?.heroImage)
    || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2500&auto=format&fit=crop';
  const aboutImage = getImageUrl(settings?.aboutImage, 1000)
    || 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=1000&auto=format&fit=crop';
  const visitedCount = countryMarkers.length;

  return (
    <main>
      {/* Hero — przyklejony; kolejna sekcja nasuwa się na niego jak karta */}
      <section className="sticky top-0 h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0 hero-parallax">
          <img
            src={heroBackgroundImage}
            alt=""
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/80" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-24">
          <p className="text-[#EAB308] font-mono text-sm mb-4 tracking-widest uppercase">
            {settings?.tagline || 'Uchwycić Ulotne'}
          </p>
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter max-w-4xl">
            {settings?.heroTitle || 'Świat przez obiektyw Nikona.'}
          </h1>
          <p className="text-base md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            {settings?.heroSubtitle || 'Niezawodowe kadry. Osobiste historie. Od ryków motocykli ADV, przez rytm Capoeiry, aż po ciszę makro i chaos ulic Tajlandii.'}
          </p>
          <Link
            href="/galeria"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-[#EAB308] hover:text-black transition-all duration-300"
          >
            {settings?.heroCtaLabel || 'Odkryj Galerię'} <ChevronRight size={18} />
          </Link>
        </div>

        {/* Pas mapy — tożsamość dziennika podróży od pierwszego ekranu */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              <MapPin size={12} className="inline -mt-0.5 mr-1.5 text-[#EAB308]" />
              Gdzie mnie poniosło{visitedCount > 0 ? ` · ${visitedCount} ${visitedCount === 1 ? 'kraj' : 'krajów'}` : ''} — kliknij pin
            </p>
            <Link href="/mapa" className="text-xs text-zinc-500 hover:text-white transition-colors">
              Pełna mapa →
            </Link>
          </div>
          <TravelMap
            markers={countryMarkers}
            showZoomControl={false}
            className="h-36 md:h-48 rounded-2xl border border-zinc-800"
          />
        </div>
      </section>

      {/* Treść nasuwająca się na hero */}
      <div className="relative z-10 bg-[#050505] rounded-t-[2.5rem] border-t border-zinc-900 shadow-[0_-24px_64px_rgba(0,0,0,0.65)]">

        {/* Wybrane kadry */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12 gap-6">
              <div>
                <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Kuratorowany wybór</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">Wybrane Kadry</h2>
                <p className="text-zinc-400 font-light mt-3">Cztery kadry losowane z wyróżnionej puli — przy każdej wizycie inne.</p>
              </div>
              <Link href="/galeria" className="hidden md:inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors shrink-0">
                Cała galeria <ArrowRight size={16} />
              </Link>
            </div>
            <FeaturedPhotos pool={featuredPool} />
            <div className="mt-10 text-center md:hidden">
              <Link href="/galeria" className="inline-flex items-center gap-2 text-sm text-[#EAB308]">
                Zobacz całą galerię <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Kategorie */}
        <section className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Archiwum</p>
              <h2 className="text-3xl md:text-5xl font-bold text-white">Eksploruj według tematu</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {categories.map(({ title, value, count, cover }) => (
                <Link
                  key={value}
                  href={`/galeria?kategoria=${encodeURIComponent(value)}`}
                  className="scroll-reveal relative group aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900"
                >
                  {cover ? (
                    <img
                      src={getImageUrl(cover, 900)}
                      alt={title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[40%] group-hover:opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                      <Camera size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-2">
                    <h3 className="text-white text-lg md:text-xl font-semibold">{title}</h3>
                    <span className="text-xs font-mono text-[#EAB308] bg-black/50 border border-zinc-800 rounded-full px-2.5 py-1">
                      {count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Ostatnia wyprawa */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12 gap-6">
              <div>
                <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Dziennik</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">Ostatnia wyprawa</h2>
              </div>
              <Link href="/wyprawy" className="hidden md:inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors shrink-0">
                Wszystkie wyprawy <ArrowRight size={16} />
              </Link>
            </div>
            {latestTrip ? (
              <div className="max-w-3xl">
                <TripCard trip={latestTrip} />
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Brak wypraw — dodaj pierwszą w Sanity Studio.</p>
            )}
            <div className="mt-10 md:hidden">
              <Link href="/wyprawy" className="inline-flex items-center gap-2 text-sm text-[#EAB308]">
                Wszystkie wyprawy <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* O mnie — zwiastun */}
        <section className="py-24 px-6 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="w-40 h-40 md:w-48 md:h-48 shrink-0 rounded-full overflow-hidden border border-zinc-800">
              <img src={aboutImage} alt="Autor z aparatem" className="w-full h-full object-cover grayscale" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {settings?.aboutTitle || 'O mnie & Pasje'}
              </h2>
              <p className="text-zinc-400 font-light leading-relaxed mb-6 max-w-xl">
                {settings?.aboutSecondaryText || 'Fotografuję Nikonem D7100. Nie zawodowo, lecz z potrzeby serca. Zatrzymuję chwile, które mają znaczenie.'}
              </p>
              <Link
                href="/o-mnie"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#EAB308] hover:text-white transition-colors"
              >
                Poznaj mnie bliżej <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
