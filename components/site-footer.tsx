import Link from 'next/link';
import { BookOpen, Camera } from 'lucide-react';
import InstagramIcon from './instagram-icon';

const INSTAGRAM_URL = 'https://www.instagram.com/radcichocki/';

export default function SiteFooter({ siteTitle, footerText }: { siteTitle: string; footerText?: string }) {
  return (
    <footer className="bg-zinc-950 py-12 px-6 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Camera size={20} className="text-[#EAB308]" />
          <span className="text-xl font-bold text-white">{siteTitle}</span>
        </div>
        <p className="text-zinc-500 text-sm">
          {footerText || `© ${new Date().getFullYear()} Wszelkie prawa zastrzeżone.`}
        </p>
        <div className="flex gap-4">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Instagram — @radcichocki"
          >
            <InstagramIcon size={18} />
          </a>
          <Link
            href="/wyprawy"
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Wyprawy"
          >
            <BookOpen size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
