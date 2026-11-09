import { useEffect, useState } from 'react';
import { useSite } from '@/src/lib/ctx';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export function Nav() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const links: [string, string][] = [['Before & after', '#before-after'], ['Our work', '#work'], ['Reviews', '#reviews'], ['Areas', '#areas']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3" data-nopour>
      <nav className="flex w-full max-w-[1280px] items-center justify-between rounded-full border py-1.5 pl-3 pr-1.5 transition-[background-color,border-color,box-shadow] duration-500"
        style={scrolled ? { background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--line)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', boxShadow: '0 12px 32px -14px rgba(0,0,0,.65)' } : { borderColor: 'transparent' }}>
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${site.company}, back to top`}>
          <img src="/brand/logo-v1.svg" alt={site.company} width={520} height={150} className="block h-[36px] w-auto md:h-[42px]" />
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([l, h]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[14px] transition-colors hover:bg-white/10" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{l}</a>)}
        </div>
        <div className="flex items-center gap-1.5">
          <a href={tel(site.phone)} aria-label={`Call ${site.phone}`} className="flex h-10 items-center justify-center rounded-full px-3 text-[14px] font-medium sm:px-3.5" style={{ color: 'color-mix(in srgb, var(--ink) 85%, transparent)', border: '1px solid var(--line)' }}>
            <svg className="sm:hidden" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
            <span className="hidden sm:inline">{site.phone}</span>
          </a>
          <a href="#survey" className="btn-gold flex h-10 items-center rounded-full px-4 text-[14px] font-semibold">
            <span className="sm:hidden">Free survey</span><span className="hidden sm:inline">Book free survey</span>
          </a>
        </div>
      </nav>
    </header>
  );
}

