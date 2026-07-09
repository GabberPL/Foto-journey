import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import { Mail } from 'lucide-react';
import { fetchSiteSettings } from '@/lib/queries';
import { getImageUrl } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'O mnie',
  description: 'Kim jestem i czym fotografuję — Nikon D7100, motocykle ADV, makro i podróże.',
};

export default async function AboutPage() {
  const settings = await fetchSiteSettings().catch(() => null);
  const aboutImage = getImageUrl(settings?.aboutImage, 1000)
    || 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=1000&auto=format&fit=crop';

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Autor</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
            {settings?.aboutTitle || 'O mnie & Pasje'}
          </h1>
          <div className="space-y-6 text-zinc-400 font-light leading-relaxed">
            {settings?.aboutDescription ? (
              <PortableText
                value={settings.aboutDescription}
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
                  Moje życie to ciągły ruch. Kiedy nie przemierzam bezdroży na <strong className="text-white">motocyklu ADV</strong> lub nie odkrywam egzotycznych zakątków <strong className="text-white">Tajlandii</strong>, odnajduję spokój w naturze – szczególnie w świecie <strong className="text-white">makro</strong> i wśród pająków.
                </p>
              </>
            )}
            {settings?.aboutSecondaryText ? (
              <p className="text-zinc-400 font-light leading-relaxed">{settings.aboutSecondaryText}</p>
            ) : null}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-zinc-900 pt-10">
            <div>
              <p className="text-[#EAB308] font-mono text-sm mb-1">Główny sprzęt</p>
              <p className="text-white font-medium">{settings?.aboutEquipment?.split('·')[0]?.trim() || 'Nikon D7100'}</p>
            </div>
            <div>
              <p className="text-[#EAB308] font-mono text-sm mb-1">Ulubiony obiektyw</p>
              <p className="text-white font-medium">{settings?.aboutEquipment?.split('·')[1]?.trim() || 'Nikkor 35mm f/1.8'}</p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <img
              src={aboutImage}
              alt="Autor z aparatem"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#EAB308] rounded-full mix-blend-multiply filter blur-[64px] opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
        </div>
      </div>

      {/* Kontakt */}
      <section className="max-w-5xl mx-auto mt-24 border-t border-zinc-900 pt-16 text-center">
        <p className="text-[#EAB308] font-mono text-xs uppercase tracking-widest mb-3">Kontakt</p>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Napisz do mnie</h2>
        <p className="text-zinc-400 font-light mb-8 max-w-xl mx-auto">
          Masz pytanie o zdjęcie, trasę albo po prostu chcesz pogadać o fotografii? Śmiało.
        </p>
        {settings?.contactEmail ? (
          <a
            href={`mailto:${settings.contactEmail}`}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-[#EAB308] transition-colors duration-300"
          >
            <Mail size={18} /> {settings.contactEmail}
          </a>
        ) : (
          <p className="text-zinc-500 text-sm">Uzupełnij pole „E-mail kontaktowy” w Sanity Studio.</p>
        )}
      </section>
    </main>
  );
}
