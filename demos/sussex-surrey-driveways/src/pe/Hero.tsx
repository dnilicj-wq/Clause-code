import { useEffect, useRef, useState } from 'react';
import type { SlabApi } from '@/components/signature/slab-drop/slabs';
import { whenReadyForGL, glMode, softwareRenderer } from '@/src/lib/gl';
import { useSite } from '@/src/lib/ctx';
import { CutReveal, Stars } from './lite';
import { types } from '@/config/driveway';
import { swatch } from '@/config/swatches';
import { useQuote, waLink } from './quote';
import { useArea } from './area';

// Signature moment: a live 3D drive. It opens by laying block paving over a tired old surface; pick resin,
// tarmac, gravel or natural stone and that surface goes down over it, the way it would on site.
// The poster (a real frame of this scene) paints first; three.js loads once the page is idle.
export function Hero() {
  const { site, preset } = useSite();
  const area = useArea();
  const q = useQuote();
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<SlabApi | null>(null);
  const typeRef = useRef<string>('block');
  const posters = site.slabPosters;
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!host.current || !canvas.current) return;
    if (glMode() === 'off' || softwareRenderer()) (window as any).__heroNoGL = true;
    let gone = false;
    const afterLoad = (f: () => void) => {
      const idle = () => ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(f, { timeout: 150 }) : setTimeout(f, 0));
      if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
    };
    const stop = whenReadyForGL(() => afterLoad(start), { eagerTouch: true });
    async function start() {
      if (gone) return;
      const cb = { fog: preset.bg, tex: '/tex/', onReady: () => setLive(true), onLost: () => setLive(false) };
      const a = (await import('@/components/signature/slab-drop/slabs')).initSlabs(host.current!, canvas.current!, cb);
      if (!a) return;
      if (gone) { a.destroy(); return; }
      api.current = a;
      const go = () => { if (a.loaded) (window as any).__heroReady = true; if (!(a.loaded && (window as any).__ld !== false)) return setTimeout(go, 60); a.surface(typeRef.current as any); };
      go();
    }
    return () => { gone = true; stop(); api.current?.destroy(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (q.type.key === 'resin') api.current?.set(q.blend); }, [q.blend, q.type.key]);
  const typeKey = q.type.key;
  typeRef.current = typeKey;
  useEffect(() => { api.current?.surface(typeKey as any); }, [typeKey]);

  return (
    <section ref={host} id="top" className="relative isolate overflow-hidden"
      style={{ height: '100svh', minHeight: 640, touchAction: 'pan-y' }}
      aria-label="Hero: a driveway being laid in the surface you pick">
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet={posters.m} />
        <img src={posters.d} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5]" style={{ background: 'linear-gradient(180deg, rgba(7,11,24,.72) 0%, rgba(7,11,24,0) 22%, rgba(7,11,24,0) 40%, rgba(7,11,24,.55) 62%, rgba(7,11,24,.92) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(7,11,24,.66) 0%, rgba(7,11,24,0) 48%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5]" style={{ background: 'radial-gradient(60% 50% at 85% 100%, rgba(47,91,255,.22), transparent 70%), radial-gradient(40% 40% at 0% 0%, rgba(216,177,64,.14), transparent 70%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-24 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-14">
        <div className="md:max-w-[640px]">
          <a href={site.socials.google} target="_blank" rel="noreferrer"
            className="pointer-events-auto mb-4 inline-flex items-center gap-2 text-[14px] font-medium">
            <Stars size={13} /> <span>{site.proof.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--muted)' }}>{`from ${site.proof.reviewCount} Google reviews`}</span>
          </a>
          <h1 className="font-display text-[clamp(42px,8vw,108px)] font-medium leading-[.93] tracking-[-.035em]">
            {(area ? [`Driveways in ${area}`, 'laid properly'] : ['Your drive,', 'laid new']).map((l, i) => (
              <span key={i} className="block"><CutReveal text={l} delay={0.12 + i * 0.16} className={i === 1 ? 'gild-cut' : ''} /></span>
            ))}
          </h1>
          <p className="mt-4 max-w-[46ch] [@media(max-height:640px)]:hidden text-[15px] leading-relaxed md:mt-5 md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 84%, transparent)' }}>
            {area
              ? `Block paving, resin, tarmac and gravel driveways, patios and landscaping in ${area}, from a family-run team based in ${site.town}.`
              : `Block paving, resin, tarmac and gravel driveways, patios and landscaping. A family-run team in ${site.town}, working across ${site.areaLine}.`}
          </p>
        </div>
        <HeroQuote />
      </div>
      <span className="ex-tag right-4 top-[76px] md:right-6">Live 3D illustration</span>
    </section>
  );
}

// Surface type: what goes down. Swatches are stills of the hero's own renders.
function TypePick() {
  const q = useQuote();
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-medium" style={{ color: 'var(--muted)' }}>Tap a surface to lay it</p>
        <p className="text-[12px] font-medium" style={{ color: 'var(--pop)' }}>{q.type.label}</p>
      </div>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="New surface">
        {types.map((t) => {
          const on = q.type.key === t.key;
          return (
            <button key={t.key} role="radio" aria-checked={on} aria-label={t.label} onClick={() => q.setType(t.key)}
              className="press flex min-h-[52px] flex-col items-center gap-1 rounded-xl px-1 pb-1 pt-1 text-[11px] font-medium leading-tight transition-colors md:pb-1.5 md:pt-1.5 md:text-[12px]"
              style={on ? { background: 'rgba(216,177,64,.16)', border: '1px solid var(--accent)' } : { background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)' }}>
              <span className="block h-6 w-full rounded-md bg-cover bg-center md:h-8" style={{ backgroundImage: `url(${swatch[t.key]})` }} aria-hidden />
              <span>{t.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Above the fold. Phones: pick a surface, then on to the full designer. Desktop: the whole request right here.
function HeroQuote() {
  const q = useQuote();
  const [step, setStep] = useState<'pick' | 'details'>('pick');
  const [who, setWho] = useState({ name: '', phone: '', postcode: '' });
  const ok = who.name.trim().length > 1 && /\d{6,}/.test(who.phone.replace(/\s/g, '')) && who.postcode.trim().length >= 3;
  return (
    <div className="glass-card pointer-events-auto mt-5 w-full rounded-[22px] p-3.5 md:mt-0 md:w-[420px] md:shrink-0 md:p-5">
      <TypePick />
      <a href="#design" className="btn-gold press mt-3.5 flex h-12 items-center justify-center rounded-full text-[15px] font-semibold md:hidden">
        Design your drive →
      </a>
      <div className="hidden md:block">
        {step === 'pick' ? (
          <button onClick={() => setStep('details')} className="btn-gold press mt-4 h-12 w-full rounded-full text-[15px] font-semibold">
            Book a free site visit →
          </button>
        ) : (
          <form className="mt-4 grid gap-2" onSubmit={(e) => { e.preventDefault(); if (ok) window.open(waLink(q, who, true), '_blank'); }}>
            <input className="pe-in" placeholder="Your name" autoComplete="name" value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} aria-label="Your name" />
            <div className="grid grid-cols-[1.4fr_1fr] gap-2">
              <input className="pe-in" placeholder="Phone" type="tel" autoComplete="tel" value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value })} aria-label="Phone" />
              <input className="pe-in" placeholder="Postcode" autoComplete="postal-code" value={who.postcode} onChange={(e) => setWho({ ...who, postcode: e.target.value })} aria-label="Postcode" />
            </div>
            <button disabled={!ok} className="press mt-1 flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-50" style={{ background: '#25D366', color: '#062b14' }}>
              <WaIcon /> Send on WhatsApp
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function WaIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>;
}
