import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { fetchSiteSettings } from '@/lib/queries';

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchSiteSettings().catch(() => null);
  const siteTitle = settings?.title || 'Photo Journal';

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-[#EAB308] selection:text-black">
      <SiteNav siteTitle={siteTitle} />
      {children}
      <SiteFooter siteTitle={siteTitle} footerText={settings?.footerText} />
    </div>
  );
}
