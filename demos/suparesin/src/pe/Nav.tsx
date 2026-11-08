import { useEffect, useState } from 'react';
import { useSite } from '@/src/lib/ctx';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export function Nav() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const links: [string, string][] = [['Projects', '#work'], ['Reviews', '#reviews'], ['Design & price', '#price'], ['FAQ', '#practical']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
      <nav className="flex w-full max-w-[1280px] items-center justify-between rounded-full border py-1.5 pl-4 pr-1.5 transition-[background-color,border-color,box-shadow] duration-500"
        style={scrolled ? { background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--line)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', boxShadow: '0 12px 32px -14px rgba(0,0,0,.65)' } : { borderColor: 'transparent' }}>
        <a href="#top" className="flex items-center" title="Suparesin, back to top">
          <img src="/brand/logo-light-480-v1.webp" alt="Suparesin" width={480} height={129} className="block h-[30px] w-auto md:h-[36px]" />
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([l, h]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[14px] transition-colors hover:bg-white/10" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{l}</a>)}
        </div>
        <a href={tel(site.mobile)} className="btn btn-y !h-10 !px-4 !text-[14px]">
          <span className="sm:hidden">Call</span><span className="hidden sm:inline">{`Call ${site.mobile}`}</span>
        </a>
      </nav>
    </header>
  );
}
