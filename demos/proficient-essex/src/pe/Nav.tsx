import { useEffect, useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { Mark } from './lite';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export function Nav() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const links: [string, string][] = [['Design yours', '#design'], ['Their work', '#work'], ['Why resin', '#why'], ['Reviews', '#reviews']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3" data-nopour>
      <nav className="flex w-full max-w-[1280px] items-center justify-between rounded-full border py-1.5 pl-3 pr-1.5 transition-[background-color,border-color,box-shadow] duration-500"
        style={scrolled ? { background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--line)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', boxShadow: '0 12px 32px -14px rgba(0,0,0,.65)' } : { borderColor: 'transparent' }}>
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${site.company}, back to top`}>
          <Mark size={30} id="mk-n" />
          <span className="font-display text-[16px] font-semibold uppercase tracking-[.14em]" style={{ color: 'var(--accent2)' }}>Proficient<span className="hidden font-medium sm:inline" style={{ color: 'var(--muted)' }}> Essex</span></span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([l, h]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[14px] transition-colors hover:bg-white/10" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{l}</a>)}
        </div>
        <a href={tel(site.phone)} className="rounded-full px-4 py-2.5 text-[14px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
          <span className="hidden sm:inline">Call </span>{site.phone}
        </a>
      </nav>
    </header>
  );
}

