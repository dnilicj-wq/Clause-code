import { useEffect, useState } from 'react';
import { useSite } from '@/src/lib/ctx';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export function Nav() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const links: [string, string][] = [['How it’s built', '#layers'], ['Work', '#work'], ['Reviews', '#reviews'], ['Price', '#price']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3" data-nopour>
      <nav className="flex w-full max-w-[1280px] items-center justify-between rounded-full border py-1.5 pl-3 pr-1.5 transition-[background-color,border-color,box-shadow] duration-500"
        style={scrolled ? { background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--line)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', boxShadow: '0 12px 32px -14px rgba(0,0,0,.65)' } : { borderColor: 'transparent' }}>
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${site.company}, back to top`}>
          <img src="/brand/badge-96-v1.webp" alt="" width={96} height={96} className="block h-[36px] w-[36px] md:h-[42px] md:w-[42px]" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-semibold tracking-[.16em] md:text-[19px]" >ASPECT</span>
            <span className="mt-[3px] text-[9.5px] uppercase tracking-[.2em] md:text-[10.5px]" style={{ color: 'var(--muted)' }}>Drives &amp; patios</span>
          </span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([l, h]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[14px] transition-colors hover:bg-white/10" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{l}</a>)}
        </div>
        <a href={tel(site.phone)} className="btn btn-y !h-10 !px-4 !text-[14px]">
          <span className="sm:hidden">Call</span><span className="hidden sm:inline">{`Call ${site.phone}`}</span>
        </a>
      </nav>
    </header>
  );
}

