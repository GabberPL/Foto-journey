"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUp, BookOpen, Camera, Map as MapIcon, Menu, Search, User, X,
} from 'lucide-react';
import { PHOTO_CATEGORIES } from '@/sanity/categories';

const NAV_LINKS = [
  { name: 'Galeria', icon: Camera, href: '/galeria' },
  { name: 'Wyprawy', icon: BookOpen, href: '/wyprawy' },
  { name: 'Mapa', icon: MapIcon, href: '/mapa' },
  { name: 'O mnie', icon: User, href: '/o-mnie' },
];

type PaletteEntry = {
  label: string;
  hint: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const PALETTE_ENTRIES: PaletteEntry[] = [
  { label: 'Galeria — wszystkie kadry', hint: 'Strona', href: '/galeria', icon: Camera },
  { label: 'Wyprawy', hint: 'Strona', href: '/wyprawy', icon: BookOpen },
  { label: 'Mapa podróży', hint: 'Strona', href: '/mapa', icon: MapIcon },
  { label: 'O mnie', hint: 'Strona', href: '/o-mnie', icon: User },
  ...PHOTO_CATEGORIES.map((category) => ({
    label: category.title,
    hint: 'Kategoria',
    href: `/galeria?kategoria=${encodeURIComponent(category.value)}`,
    icon: Camera,
  })),
];

export default function SiteNav({ siteTitle }: { siteTitle: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(windowHeight > 0 ? totalScroll / windowHeight : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Zamknij menu i paletę po zmianie strony
  useEffect(() => {
    setIsMenuOpen(false);
    setIsPaletteOpen(false);
    setSearchQuery('');
  }, [pathname]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return PALETTE_ENTRIES;
    return PALETTE_ENTRIES.filter((entry) => entry.label.toLowerCase().includes(query));
  }, [searchQuery]);

  const openEntry = (href: string) => {
    setIsPaletteOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* Pasek postępu scrollowania */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#EAB308] z-50 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <nav className="fixed w-full z-40 bg-[#050505]/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <Camera size={18} className="text-[#050505]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">{siteTitle}</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors flex items-center gap-2 ${
                    isActive ? 'text-[#EAB308]' : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 text-xs text-zinc-400 hover:text-white"
            >
              <Search size={14} />
              <span>Szukaj</span>
              <kbd className="ml-2 font-mono text-[10px] text-zinc-500">⌘K</kbd>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-zinc-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menu mobilne */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#050505] pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-2xl font-light">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 text-zinc-400 hover:text-[#EAB308]"
              >
                <link.icon size={24} />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Powrót na górę */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 rounded-full bg-white text-black shadow-lg shadow-white/5 transition-all duration-300 z-40 ${
          scrollProgress > 0.1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        } hover:bg-[#EAB308] hover:scale-110`}
        aria-label="Wróć na górę"
      >
        <ArrowUp size={20} />
      </button>

      {/* Paleta Ctrl+K */}
      {isPaletteOpen && (
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
                placeholder="Szukaj stron i kategorii..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-600 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredEntries.length > 0) {
                    openEntry(filteredEntries[0].href);
                  }
                }}
              />
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:text-white"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredEntries.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Brak wyników dla <strong className="text-zinc-300">&bdquo;{searchQuery}&rdquo;</strong>
                </div>
              ) : (
                <div className="px-2 py-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2">
                    {searchQuery ? 'Wyniki' : 'Szybkie linki'}
                  </p>
                  <div className="space-y-1">
                    {filteredEntries.map((entry) => (
                      <button
                        key={entry.href}
                        onClick={() => openEntry(entry.href)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors text-left"
                      >
                        <span className="flex items-center gap-3">
                          <entry.icon size={16} className="text-zinc-500" />
                          {entry.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">{entry.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute inset-0 -z-10" onClick={() => setIsPaletteOpen(false)} />
        </div>
      )}
    </>
  );
}
