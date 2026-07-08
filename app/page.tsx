"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PortableText } from '@portabletext/react';
import {
  Camera, Map as MapIcon, BookOpen, User, Menu, X,
  ChevronRight, ArrowUp, Search,
  Aperture, Zap, Clock, Info
} from 'lucide-react';
import { client } from '../sanity/lib/client';
import { urlFor } from '../sanity/lib/image';

// --- CUSTOM ICONS ---
const InstagramIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

type SanityPhoto = {
  _id: string;
  title: string;
  category: string;
  location?: string;
  country?: string;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    speed?: string;
    iso?: string;
  };
  image?: unknown;
};

type PortableTextBlock = {
  _type: string;
  children?: Array<{ _type?: string; text?: string }>;
};

type SiteSettings = {
  _id: string;
  title?: string;
  tagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaLabel?: string;
  heroImage?: unknown;
  aboutTitle?: string;
  aboutDescription?: PortableTextBlock[];
  aboutImage?: unknown;
  aboutEquipment?: string;
  aboutSecondaryText?: string;
  footerText?: string;
};

type Story = {
  _id: string;
  title: string;
  slug?: { current?: string };
  excerpt?: string;
  body?: PortableTextBlock[];
  image?: unknown;
  publishedAt?: string;
  category?: string;
};

const NAV_LINKS = [
  { name: 'Galerie', icon: Camera, section: 'gallery' },
  { name: 'Historie', icon: BookOpen, section: 'stories' },
  { name: 'Mapa Podróży', icon: MapIcon, section: 'map' },
  { name: 'O mnie', icon: User, section: 'about' },
];

const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Polska: { lat: 52.2297, lng: 21.0122 },
  Tajlandia: { lat: 15.8700, lng: 100.9925 },
  Kambodża: { lat: 12.5657, lng: 104.9910 },
  Kambodia: { lat: 12.5657, lng: 104.9910 },
  Cambodja: { lat: 12.5657, lng: 104.9910 },
  Niemcy: { lat: 51.1657, lng: 10.4515 },
  Francja: { lat: 46.2276, lng: 2.2137 },
  Włochy: { lat: 41.8719, lng: 12.5674 },
  Hiszpania: { lat: 40.4637, lng: -3.7492 },
  Portugalia: { lat: 39.3999, lng: -8.2245 },
  Grecja: { lat: 39.0742, lng: 21.8243 },
  Norwegia: { lat: 60.4720, lng: 8.4689 },
  Szwecja: { lat: 60.1282, lng: 18.6435 },
  Finlandia: { lat: 61.9241, lng: 25.7482 },
  Dania: { lat: 56.2639, lng: 9.5018 },
  Holandia: { lat: 52.1326, lng: 5.2913 },
  Czechy: { lat: 49.8175, lng: 15.4730 },
  Słowacja: { lat: 48.6690, lng: 19.6990 },
  Austria: { lat: 47.5162, lng: 14.5501 },
  Szwajcaria: { lat: 46.8182, lng: 8.2275 },
  Belgia: { lat: 50.5039, lng: 4.4699 },
  USA: { lat: 37.0902, lng: -95.7129 },
  Kanada: { lat: 56.1304, lng: -106.3468 },
  Japonia: { lat: 36.2048, lng: 138.2529 },
  Korea: { lat: 35.9078, lng: 127.7669 },
  Chiny: { lat: 35.8617, lng: 104.1954 },
  Indie: { lat: 20.5937, lng: 78.9629 },
  Nepal: { lat: 28.3949, lng: 84.1240 },
  Maroko: { lat: 31.7917, lng: -7.0926 },
  Egipt: { lat: 26.8206, lng: 30.8025 },
  Izrael: { lat: 31.0461, lng: 34.8516 },
  ArabiaSaudyjska: { lat: 23.8859, lng: 45.0792 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  NowaZelandia: { lat: -40.9006, lng: 174.8860 },
};

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#374151' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
];

type GoogleWindow = Window & {
  google?: {
    maps: any;
  };
};

const normalizeCountryName = (value?: string) => value?.trim().toLowerCase() ?? '';

const getCountryCoordinates = (countryName?: string) => {
  const normalized = normalizeCountryName(countryName);
  const exactMatch = Object.keys(COUNTRY_COORDINATES).find((key) => normalizeCountryName(key) === normalized);
  if (exactMatch) {
    return COUNTRY_COORDINATES[exactMatch];
  }

  const aliasMatch = Object.entries(COUNTRY_COORDINATES).find(([key]) => normalizeCountryName(key).includes(normalized) || normalized.includes(normalizeCountryName(key)));
  return aliasMatch?.[1];
};

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [photos, setPhotos] = useState<SanityPhoto[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [lightboxData, setLightboxData] = useState<SanityPhoto | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteData, photoData, storyData] = await Promise.all([
          client.fetch<SiteSettings | null>(`*[_type == "siteSettings"][0] {
            _id,
            title,
            tagline,
            heroTitle,
            heroSubtitle,
            heroCtaLabel,
            heroImage,
            aboutTitle,
            aboutDescription,
            aboutImage,
            aboutEquipment,
            aboutSecondaryText,
            footerText
          }`),
          client.fetch<SanityPhoto[]>(`*[_type == "photo"] | order(_createdAt desc) {
            _id,
            title,
            category,
            location,
            country,
            exif,
            image
          }`),
          client.fetch<Story[]>(`*[_type == "story"] | order(publishedAt desc) [0...4] {
            _id,
            title,
            slug,
            excerpt,
            body,
            image,
            publishedAt,
            category
          }`),
        ]);

        setSiteSettings(siteData);
        setPhotos(photoData);
        setStories(storyData);
      } catch (error) {
        console.error('Nie udało się pobrać treści z Sanity:', error);
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!photos.length || !mapRef.current) return;

    const initializeMap = () => {
      const googleMaps = (window as GoogleWindow).google?.maps;
      if (!googleMaps || !mapRef.current) {
        setMapError('Nie udało się załadować Google Maps.');
        return;
      }

      const map = new googleMaps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        draggable: true,
        scrollwheel: true,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: MAP_STYLES,
      });
      map.setOptions({ draggable: true, scrollwheel: true, disableDoubleClickZoom: true });

      const countries = Array.from(new Set(photos.map((photo) => photo.country?.trim()).filter(Boolean) as string[]));
      const bounds = new googleMaps.LatLngBounds();

      countries.forEach((countryName) => {
        const coordinates = getCountryCoordinates(countryName);
        if (!coordinates) return;

        const marker = new googleMaps.Marker({
          position: coordinates,
          map,
          title: countryName,
          icon: {
            path: googleMaps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#EAB308',
            fillOpacity: 1,
            strokeColor: '#050505',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          setSelectedCountry(countryName);
          document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        bounds.extend(coordinates);
      });

      if (countries.length > 0) {
        map.fitBounds(bounds, 80);
      } else {
        map.setCenter({ lat: 20, lng: 0 });
        map.setZoom(2);
      }
    };

    if ((window as GoogleWindow).google?.maps) {
      initializeMap();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('Brak klucza Google Maps. Uzupełnij NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, aby mapa działała.');
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      const checkGoogleMaps = window.setInterval(() => {
        if ((window as GoogleWindow).google?.maps) {
          window.clearInterval(checkGoogleMaps);
          initializeMap();
        }
      }, 200);
      return () => window.clearInterval(checkGoogleMaps);
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initializeMap();
    script.onerror = () => setMapError('Nie udało się załadować Google Maps.');
    document.head.appendChild(script);
  }, [photos]);

  // Postęp scrollowania i powrót na górę
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Obsługa skrótu Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setLightboxData(null);
        setSelectedStory(null);
        setSelectedCountry(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showAllCountries = () => setSelectedCountry(null);

  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory = activeTab === 'all'
      ? true
      : photo.category.toLowerCase() === activeTab.toLowerCase();
    const matchesCountry = !selectedCountry
      ? true
      : normalizeCountryName(photo.country) === normalizeCountryName(selectedCountry);

    return matchesCategory && matchesCountry;
  });

  const getImageUrl = (image: unknown) => {
    if (!image) return '';
    return urlFor(image as never).width(1600).quality(85).auto('format').url();
  };

  const getPhotoUrl = (photo: SanityPhoto | null) => {
    if (!photo?.image) return '';
    return getImageUrl(photo.image);
  };

  const siteTitle = siteSettings?.title || 'Photo Journal';
  const heroImageUrl = getImageUrl(siteSettings?.heroImage);
  const aboutImageUrl = getImageUrl(siteSettings?.aboutImage);
  const heroBackgroundImage = heroImageUrl || 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2500&auto=format&fit=crop';
  const aboutFallbackImage = aboutImageUrl || 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=1000&auto=format&fit=crop';

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-[#EAB308] selection:text-black">
      
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[#EAB308] z-50 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Nawigacja */}
      <nav className="fixed w-full z-40 bg-[#050505]/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={scrollToTop}>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <Camera size={18} className="text-[#050505]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">{siteTitle}</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map(link => (
              <a key={link.name} href={`#${link.section}`} className="hover:text-white transition-colors flex items-center gap-2">
                {link.name}
              </a>
            ))}
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 text-xs text-zinc-400 hover:text-white"
            >
              <Search size={14} />
              <span>Szukaj</span>
              <kbd className="ml-2 font-mono text-[10px] text-zinc-500">⌘K</kbd>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-zinc-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#050505] pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-2xl font-light">
            {NAV_LINKS.map(link => (
              <a 
                key={link.name} 
                href={`#${link.section}`} 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 text-zinc-400 hover:text-[#EAB308]"
              >
                <link.icon size={24} />
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackgroundImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/80" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mt-12">
          <p className="text-[#EAB308] font-mono text-sm mb-4 tracking-widest uppercase">{siteSettings?.tagline || 'Uchwycić Ulotne'}</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
            {siteSettings?.heroTitle || 'Świat przez obiektyw Nikona.'}
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            {siteSettings?.heroSubtitle || 'Niezawodowe kadry. Osobiste historie. Od ryków motocykli ADV, przez rytm Capoeiry, aż po ciszę makro i chaos ulic Tajlandii.'}
          </p>
          <a href="#gallery" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-[#EAB308] hover:text-black transition-all duration-300">
            {siteSettings?.heroCtaLabel || 'Odkryj Galerię'} <ChevronRight size={18} />
          </a>
        </div>
      </section>

      {/* Sekcja "O mnie" */}
      <section id="about" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">{siteSettings?.aboutTitle || 'O mnie & Pasje'}</h2>
            <div className="space-y-6 text-zinc-400 font-light leading-relaxed">
              {siteSettings?.aboutDescription ? (
                <PortableText
                  value={siteSettings.aboutDescription}
                  components={{
                    block: {
                      normal: ({ children }) => <p className="text-zinc-400 font-light leading-relaxed">{children}</p>,
                    },
                  }}
                />
              ) : (
                <>
                  <p>
                    Fotografuję <strong className="text-white">Nikonem D7100</strong>. Nie zawodowo, lecz z potrzeby serca. Zatrzymuję chwile, które mają znaczenie.
                  </p>
                  <p>
                    Moje życie to ciągły ruch. Kiedy nie przemierzam bezdroży na <strong>motocyklu ADV</strong> lub nie odkrywam egzotycznych zakątków <strong>Tajlandii</strong>, odnajduję spokój w naturze – szczególnie w świecie <strong>makro</strong> i wśród pająków.
                  </p>
                </>
              )}
              {siteSettings?.aboutSecondaryText ? (
                <p className="text-zinc-400 font-light leading-relaxed">{siteSettings.aboutSecondaryText}</p>
              ) : null}
            </div>
            
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-zinc-900 pt-10">
              <div>
                <p className="text-[#EAB308] font-mono text-sm mb-1">Główny sprzęt</p>
                <p className="text-white font-medium">{siteSettings?.aboutEquipment?.split('·')[0]?.trim() || 'Nikon D7100'}</p>
              </div>
              <div>
                <p className="text-[#EAB308] font-mono text-sm mb-1">Ulubiony obiektyw</p>
                <p className="text-white font-medium">{siteSettings?.aboutEquipment?.split('·')[1]?.trim() || 'Nikkor 35mm f/1.8'}</p>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img 
                src={aboutFallbackImage} 
                alt="Autor z aparatem" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#EAB308] rounded-full mix-blend-multiply filter blur-[64px] opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
          </div>
        </div>
      </section>

      {/* Historie */}
      <section id="stories" className="py-24 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Historie</h2>
              <p className="text-zinc-400 font-light">Wydarzenia, miejsca i chwile, które zostawiły ślad.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {stories.length === 0 ? (
              <p className="text-zinc-500 text-sm">Brak historii w Sanity.</p>
            ) : stories.map((story) => (
              <article
                key={story._id}
                onClick={() => setSelectedStory(story)}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 cursor-pointer transition-all duration-300 hover:border-[#EAB308]/40 hover:shadow-lg hover:shadow-[#EAB308]/10"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={story.image ? getImageUrl(story.image) : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'}
                    alt={story.title}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm text-zinc-500">
                    <span className="text-[#EAB308] font-mono uppercase tracking-wider">{story.category || 'Historia'}</span>
                    {story.publishedAt ? <span>{new Date(story.publishedAt).toLocaleDateString('pl-PL')}</span> : null}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{story.title}</h3>
                  <p className="mt-3 text-zinc-400 font-light leading-relaxed">{story.excerpt || 'Dodaj opis historii w Sanity.'}</p>
                  <div className="mt-5 text-sm font-medium text-[#EAB308]">Czytaj całość →</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Galerie (Masonry) */}
      <section id="gallery" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Wybrane Kadry</h2>
              <p className="text-zinc-400 font-light">Eksploruj według kategorii</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {selectedCountry ? (
                <button
                  onClick={showAllCountries}
                  className="rounded-full border border-[#EAB308]/40 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-200 transition hover:border-[#EAB308] hover:text-white"
                >
                  Pokaż wszystkie kraje
                </button>
              ) : null}
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
              {['Wszystkie', 'ADV', 'People', 'Nature', 'Travel'].map((tab) => {
                const value = tab === 'Wszystkie' ? 'all' : tab;
                const isActive = activeTab === value;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(value)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors border ${
                      isActive 
                        ? 'bg-white text-black border-white font-medium' 
                        : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
              </div>
            </div>
          </div>

          {selectedCountry ? (
            <div className="mb-6 rounded-full border border-[#EAB308]/30 bg-[#EAB308]/10 px-4 py-2 text-sm text-[#EAB308]">
              Widok filtrowany po kraju: <span className="ml-1 font-semibold text-white">{selectedCountry}</span>
            </div>
          ) : null}

          {/* Masonry CSS Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {isLoadingPhotos ? (
              <div className="text-zinc-500 text-sm">Ładowanie zdjęć z Sanity...</div>
            ) : filteredPhotos.length === 0 ? (
              <div className="text-zinc-500 text-sm">Brak zdjęć w tej kategorii.</div>
            ) : filteredPhotos.map((photo) => (
              <div
                key={photo._id}
                className="relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-800"
                onClick={() => setLightboxData(photo)}
              >
                <img
                  src={getPhotoUrl(photo)}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 group-hover:rotate-1 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-[#EAB308] text-xs font-mono mb-1">{photo.category}</span>
                  <h3 className="text-white text-lg font-medium">{photo.title}</h3>
                  <p className="text-zinc-300 text-sm flex items-center gap-1 mt-2">
                    <MapIcon size={12} /> {photo.location || 'Brak lokalizacji'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interaktywna Mapa (Wizualizacja) */}
      <section id="map" className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Mapa Podróży</h2>
          <p className="text-zinc-400 font-light max-w-2xl mx-auto mb-16">
            Miejsca, które ukształtowały moje spojrzenie. Od polskich bezdroży po ulice Bangkoku.
          </p>
          
          <div
            className="relative w-full aspect-[4/3] md:aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                showAllCountries();
              }
            }}
          >
            <div ref={mapRef} className="absolute inset-0 w-full h-full" />
            {mapError ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/90 px-6">
                <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900/90 px-6 py-4 text-center text-sm text-zinc-400">
                  {mapError}
                </div>
              </div>
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

            {selectedCountry && (
              <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#EAB308]/40 bg-zinc-950/80 px-4 py-2 text-sm font-medium text-zinc-200 shadow-lg backdrop-blur-sm">
                {selectedCountry}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Instagram Feed (Mock) */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <InstagramIcon size={28} className="text-[#EAB308]" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">@photo.journal</h2>
            </div>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Obserwuj →</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-zinc-900 rounded-lg overflow-hidden group relative border border-zinc-800">
                <img 
                  src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?q=80&w=400&auto=format&fit=crop`} 
                  alt="Instagram post" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <InstagramIcon className="text-white drop-shadow-lg" size={28} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stopka */}
      <footer className="bg-zinc-950 py-12 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-[#EAB308]" />
            <span className="text-xl font-bold text-white">{siteTitle}</span>
          </div>
          <p className="text-zinc-500 text-sm">
            {siteSettings?.footerText || `© ${new Date().getFullYear()} Wszelkie prawa zastrzeżone.`}
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><InstagramIcon size={18} /></a>
            <a href="#" className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><BookOpen size={18} /></a>
          </div>
        </div>
      </footer>

      {/* Przycisk powrotu na górę */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full bg-white text-black shadow-lg shadow-white/5 transition-all duration-300 z-40 ${
          scrollProgress > 0.1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        } hover:bg-[#EAB308] hover:scale-110`}
        aria-label="Wróć na górę"
      >
        <ArrowUp size={20} />
      </button>

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-[55] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-400 hover:text-white z-50 p-2 bg-zinc-900/50 rounded-full transition-colors"
            onClick={() => setSelectedStory(null)}
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
              <img
                src={selectedStory.image ? getImageUrl(selectedStory.image) : 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'}
                alt={selectedStory.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                <span className="text-[#EAB308] font-mono uppercase tracking-wider">{selectedStory.category || 'Historia'}</span>
                {selectedStory.publishedAt ? <span>{new Date(selectedStory.publishedAt).toLocaleDateString('pl-PL')}</span> : null}
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">{selectedStory.title}</h3>
              {selectedStory.body && selectedStory.body.length > 0 ? (
                <div className="space-y-4 text-zinc-300 leading-relaxed">
                  <PortableText
                    value={selectedStory.body}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="text-zinc-300 font-light leading-8">{children}</p>,
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-zinc-400 font-light leading-relaxed">{selectedStory.excerpt || 'Brak treści wpisu.'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal (EXIF) */}
      {lightboxData && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <button 
            className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-400 hover:text-white z-50 p-2 bg-zinc-900/50 rounded-full transition-colors"
            onClick={() => setLightboxData(null)}
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col md:flex-row max-w-7xl w-full h-full max-h-[90vh] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
            {/* Główny obraz */}
            <div className="flex-1 bg-[#050505] flex items-center justify-center p-4 relative group">
              <img
                src={getPhotoUrl(lightboxData)}
                alt={lightboxData.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Sidebar z danymi EXIF */}
            <div className="w-full md:w-80 lg:w-96 bg-zinc-950 p-6 md:p-8 border-l border-zinc-900 flex flex-col justify-between overflow-y-auto">
              <div>
                <span className="inline-block px-2 py-1 bg-zinc-900 text-[#EAB308] text-xs font-mono uppercase tracking-wider rounded mb-4">
                  {lightboxData.category}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">{lightboxData.title}</h3>
                
                <p className="text-zinc-400 text-sm mb-8 flex items-start gap-2">
                  <MapIcon size={16} className="shrink-0 mt-0.5 text-zinc-500" />
                  {lightboxData.country || lightboxData.location || 'Brak lokalizacji'}
                </p>

                <div className="space-y-6">
                  <h4 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">Parametry EXIF</h4>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Camera size={14}/> Aparat</span>
                      <span className="text-zinc-200 text-sm font-medium">{lightboxData.exif?.camera || 'Brak danych'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Aperture size={14}/> Obiektyw</span>
                      <span className="text-zinc-200 text-sm font-medium">{lightboxData.exif?.lens || 'Brak danych'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Zap size={14}/> Przysłona</span>
                      <span className="text-zinc-200 text-sm font-medium">{lightboxData.exif?.aperture || 'Brak danych'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-xs flex items-center gap-1.5 mb-1"><Clock size={14}/> Migawka</span>
                      <span className="text-zinc-200 text-sm font-medium">{lightboxData.exif?.speed || 'Brak danych'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
                 <button className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-sm font-medium text-white transition-colors rounded-lg border border-zinc-800">
                   Zobacz pełną historię tego zdjęcia
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette Modal (Ctrl+K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4">
          <div 
            className="bg-zinc-950 w-full max-w-xl rounded-xl shadow-2xl border border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-4 border-b border-zinc-800">
              <Search size={18} className="text-zinc-500 mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Szukaj zdjęć, tagów, lokalizacji..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-600 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setIsCommandPaletteOpen(false)}
                className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:text-white"
              >
                ESC
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {searchQuery ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Szukam wyników dla <strong className="text-zinc-300">"{searchQuery}"</strong>... <br/><br/>
                  <span className="text-xs">(Demo - to miejsce zostanie podłączone do bazy Sanity CMS)</span>
                </div>
              ) : (
                <div className="px-2 py-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">Szybkie linki</p>
                  <div className="space-y-1">
                    <a href="#gallery" onClick={() => setIsCommandPaletteOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors">
                      <Camera size={16} className="text-zinc-500" /> Zobacz wszystkie galerie
                    </a>
                    <a href="#map" onClick={() => setIsCommandPaletteOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors">
                      <MapIcon size={16} className="text-zinc-500" /> Otwórz mapę podróży
                    </a>
                    <a href="#" onClick={() => setIsCommandPaletteOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors">
                      <Zap size={16} className="text-[#EAB308]" /> Wyprawy Motocyklowe (ADV)
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Niewidzialne tło zamykające okno po kliknięciu poza nim */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsCommandPaletteOpen(false)} />
        </div>
      )}

    </main>
  );
}