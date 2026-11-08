import { useEffect, useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { useQuote, waLink } from '../quote';
import { WaIcon } from '../Hero';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

export function Footer() {
  const { site } = useSite();
  const q = useQuote();
  return (
    <footer className="relative overflow-hidden pb-28 pt-20 md:pb-12 md:pt-28" style={{ background: '#0B0C0E' }}>
      <div className="mx-auto max-w-[1320px] px-5 md:px-12">
        <h2 className="d-xl max-w-[12ch]">Let’s build <span className="y">yours.</span></h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#price" className="btn btn-y">Price my drive</a>
          <a href={waLink(q)} target="_blank" rel="noreferrer" className="btn btn-ghost"><WaIcon /> WhatsApp {site.owner.first}</a>
          <a href={tel(site.phone)} className="btn btn-ghost">Call {site.phone}</a>
        </div>
        <div className="mt-16 grid gap-6 border-t pt-8 text-[14px] sm:grid-cols-2 md:grid-cols-4" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Call</div><a href={tel(site.phone)}>{site.phone}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>WhatsApp</div><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">{site.mobile}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Email</div><a href={`mailto:${site.email}`} className="break-all">{site.email}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Working across</div>{site.region}</div>
        </div>
        <div className="mt-10 flex items-center gap-4">
          <img src="/brand/badge-96-v1.webp" alt="" width={96} height={96} loading="lazy" className="h-12 w-12" />
          <span className="font-display text-[20px] font-semibold tracking-[.14em]">ASPECT</span>
          <span className="text-[13px]" style={{ color: 'var(--muted)' }}>Drives &amp; patios, by design</span>
        </div>
        <div className="mt-8 flex flex-col gap-2 text-[12px] md:flex-row md:justify-between" style={{ color: 'var(--muted)' }}>
          <span>{site.legalName}. Company no. {site.companyNo}</span>
          <span>Demo by Clientgateway. Prices are examples; the hero, layers, blends and concrete are illustrations.</span>
        </div>
      </div>
    </footer>
  );
}

// Phones: Call / WhatsApp / Price, shown once past the hero, hidden over the price block and the footer.
export function StickyBar() {
  const { site } = useSite();
  const q = useQuote();
  const [hidden, setHidden] = useState({ top: true, price: false, foot: false });
  useEffect(() => {
    const ids: [keyof typeof hidden, Element | null][] = [['top', document.getElementById('top')], ['price', document.getElementById('price')], ['foot', document.querySelector('footer')]];
    const io = new IntersectionObserver((es) => {
      setHidden((h) => { const n = { ...h }; for (const e of es) { const k = ids.find(([, el]) => el === e.target)?.[0]; if (k) n[k] = e.isIntersecting; } return n; });
    }, { rootMargin: '0px 0px -30% 0px' });
    ids.forEach(([, el]) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const show = !hidden.top && !hidden.price && !hidden.foot;
  return (
    <nav aria-label="Quick contact" aria-hidden={!show} className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-40 grid grid-cols-[1fr_1.3fr_1fr] gap-1.5 rounded-full p-1.5 md:hidden"
      style={{ background: 'rgba(16,18,21,.92)', boxShadow: 'inset 0 0 0 1px rgba(236,236,232,.12), 0 12px 30px rgba(0,0,0,.45)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        transform: show ? 'none' : 'translateY(120%)', opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none', transition: 'transform 420ms cubic-bezier(.32,.72,0,1), opacity 300ms ease' }}>
      <a tabIndex={show ? 0 : -1} href={tel(site.phone)} className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold" style={{ background: 'rgba(236,236,232,.08)' }}>Call</a>
      <a tabIndex={show ? 0 : -1} href={waLink(q)} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: 'rgba(236,236,232,.08)' }}><WaIcon size={16} /> WhatsApp</a>
      <a tabIndex={show ? 0 : -1} href="#price" className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold" style={{ background: '#F4C21B', color: '#121315' }}>Price</a>
    </nav>
  );
}
