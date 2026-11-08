import { useEffect, useRef, useState } from 'react';
import { initDrive, type DriveApi } from '@/components/signature/drive-pour/drive';
import type { SlabApi } from '@/components/signature/slab-drop/slabs';
import { whenReadyForGL, isCoarse, glMode, softwareRenderer } from '@/src/lib/gl';
import { useSite } from '@/src/lib/ctx';
import { CutReveal, Ticker } from './lite';
import { blends, sizes, surfaces } from '@/config/driveway';
import { useQuote, waLink, EXAMPLE_LABEL } from './quote';
import { Stars } from './lite';

// Signature moment: drag to pour resin-bound stone over a cracked, weedy tarmac drive.
// Poster (a real frame of this shader) paints first; the live pour takes over and auto-demos on phones.
const heroStyle = (d: 'slabs' | 'gravel') => {
  if (typeof location === 'undefined') return d;
  const h = new URLSearchParams(location.search).get('hero');
  return h === 'gravel' || h === 'slabs' ? h : d;
};

export function Hero() {
  const { site, preset } = useSite();
  const q = useQuote();
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<DriveApi | SlabApi | null>(null);
  const style = heroStyle(site.heroStyle);
  const slabs = style === 'slabs';
  const posters = slabs ? site.slabPosters : site.posters;
  const [live, setLive] = useState(false);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [cov, setCov] = useState(0);
  const coarse = typeof window !== 'undefined' && isCoarse();

  useEffect(() => {
    if (!host.current || !canvas.current) return;
    if (glMode() === 'off' || softwareRenderer()) (window as any).__heroNoGL = true;
    let gone = false;
    // the slab scene (three.js + textures) waits until the page has loaded and gone idle, so it never competes with first paint
    const afterLoad = (f: () => void) => {
      const idle = () => ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(f, { timeout: 700 }) : setTimeout(f, 200));
      if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
    };
    const stop = whenReadyForGL(() => (slabs ? afterLoad(start) : start()), { eagerTouch: true });
    async function start() {
      if (gone) return;
      const cb = { fog: preset.bg, tex: '/tex/', onFirst: () => setTouched(true), onCoverage: setCov, onFinished: () => setDone(true), onReady: () => setLive(true), onLost: () => setLive(false) };
      // three.js only loads for the slab hero, and only once the page is idle
      const a = slabs
        ? (await import('@/components/signature/slab-drop/slabs')).initSlabs(host.current!, canvas.current!, cb)
        : initDrive(host.current!, canvas.current!, { ...cb, blend: q.blend });
      if (!a) return;
      if (gone) { a.destroy(); return; }
      api.current = a;
      const go = () => { if (a.loaded) (window as any).__heroReady = true; return a.loaded && (window as any).__ld !== false ? a.demo() : setTimeout(go, 60); };
      go();
    }
    return () => { gone = true; stop(); api.current?.destroy(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { api.current?.set(q.blend); }, [q.blend]);

  const pct = Math.round(Math.min(1, cov / 0.72) * 100);

  return (
    <section ref={host} id="top" className="relative isolate overflow-hidden"
      style={{ height: '100svh', minHeight: 640, touchAction: 'pan-y', cursor: live && !done ? 'crosshair' : undefined }}
      aria-label={slabs ? "Hero: lay a porcelain patio" : "Hero: pour a resin driveway"}>
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet={posters.m} />
        <img src={posters.d} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5]" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.7) 0%, rgba(10,10,10,0) 22%, rgba(10,10,10,0) 40%, rgba(10,10,10,.55) 64%, rgba(10,10,10,.9) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,.6) 0%, rgba(10,10,10,0) 45%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-24 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-14">
        <div className="md:max-w-[640px]">
          <a href={site.socials.google} target="_blank" rel="noreferrer" data-nopour
            className="pointer-events-auto mb-4 inline-flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-[13px] font-medium"
            style={{ background: 'rgba(14,14,14,.62)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            <Stars size={13} /> <span>{site.proof.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--muted)' }}>{`· ${site.proof.reviewCount} Google reviews`}</span>
          </a>
          <h1 className="font-display text-[clamp(44px,8vw,112px)] font-semibold leading-[.9] tracking-[-.035em]">
            {(slabs ? ['Cracked patio?', 'Lay it new.'] : ['Cracked drive?', 'Pour it new.']).map((l, i) => (
              <span key={i} className="block"><CutReveal text={l} delay={0.12 + i * 0.16} className={i === 1 ? 'serif font-normal' : ''} /></span>
            ))}
          </h1>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed md:mt-5 md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 84%, transparent)' }}>
            {`Resin driveways, driveways and patios from a family-run team in ${site.town}, working across ${site.areaLine}.`}
          </p>
          {!coarse && live && (
            <div className="pointer-events-auto mt-6 hidden items-center gap-3 md:flex" data-nopour>
              <span className="glass flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-[13px]">
                <span style={{ color: 'var(--muted)' }}>{done ? 'Finished' : touched ? (slabs ? 'Laying' : 'Pouring') : (slabs ? 'Drag across the patio' : 'Drag across the drive')}</span>
                <span className="relative h-1 w-20 overflow-hidden rounded-full bg-white/10">
                  <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300" style={{ width: `${done ? 100 : pct}%`, background: 'var(--accent)' }} />
                </span>
                {done
                  ? <button onClick={() => { api.current?.reset(); setDone(false); setCov(0); }} className="rounded-full bg-white/10 px-3 py-1.5 font-medium hover:bg-white/15">{slabs ? 'Lay again' : 'Pour again'}</button>
                  : <button onClick={() => api.current?.finish()} className="rounded-full px-3 py-1.5 font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{slabs ? 'Lay the rest' : 'Finish the drive'}</button>}
              </span>
            </div>
          )}
        </div>
        <HeroQuote />
      </div>

      {live && !touched && !done && (
          <div
            className="pe-hint glass pointer-events-none absolute left-1/2 top-[19%] -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] md:left-[38%] md:top-[30%]">
            {slabs ? (coarse ? 'Swipe to lay the slabs' : 'Drag across to lay the slabs') : (coarse ? 'Swipe the drive to pour' : 'Drag across the drive to pour')} ↔
          </div>
        )}
      <span className="ex-tag right-4 top-[76px] md:right-6">Live illustration</span>
    </section>
  );
}

// Instant quote, above the fold. Phones: size + price, then on to the full designer. Desktop: the whole quote.
function HeroQuote() {
  const q = useQuote();
  const { site } = useSite();
  const [step, setStep] = useState<'price' | 'details'>('price');
  const [who, setWho] = useState({ name: '', phone: '', postcode: '' });
  const ok = who.name.trim().length > 1 && /\d{6,}/.test(who.phone.replace(/\s/g, '')) && who.postcode.trim().length >= 3;
  return (
    <div data-nopour className="pointer-events-auto mt-5 w-full rounded-[22px] p-3.5 md:mt-0 md:w-[400px] md:shrink-0 md:p-5"
      style={{ background: 'rgba(16,16,16,.74)', border: '1px solid rgba(240,225,190,.14)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', boxShadow: '0 30px 60px -30px rgba(0,0,0,.8)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[.14em]" style={{ color: 'var(--accent2)' }}>Instant price</p>
        <p className="hidden text-[11px] md:block" style={{ color: 'var(--muted)' }}>No phone number needed to see it</p>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Driveway size">
        {sizes.map((s) => (
          <button key={s.key} role="radio" aria-checked={q.sizeKey === s.key} onClick={() => q.setSize(s.key)}
            className="h-10 rounded-xl text-[14px] font-medium transition-colors"
            style={q.sizeKey === s.key ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : { background: 'rgba(255,255,255,.06)', border: '1px solid var(--line)' }}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="mt-3 hidden md:block">
        <div className="mb-1.5 text-[11px] uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>What's there now</div>
        <div className="grid grid-cols-4 gap-1.5">
          {surfaces.map((s) => (
            <button key={s.key} onClick={() => q.setSurface(s.key)} className="h-9 rounded-lg px-1 text-[12px] font-medium leading-tight"
              style={q.surface.key === s.key ? { background: 'rgba(201,169,97,.18)', border: '1px solid var(--accent)' } : { background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)' }}>
              {s.label.replace(' or soil', '')}
            </button>
          ))}
        </div>
        <div className="mb-1.5 mt-3 text-[11px] uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>Blend · <span style={{ color: 'var(--ink)' }}>{q.blend.name}</span></div>
        <div className="flex gap-2">
          {blends.map((b) => (
            <button key={b.key} onClick={() => q.setBlend(b.key)} aria-label={`${b.name} (example blend)`} title={b.name}
              className="h-8 w-8 rounded-full bg-cover transition-transform hover:scale-110"
              style={{ backgroundImage: `url(/blends/${b.key}-160-v1.webp)`, outline: q.blend.key === b.key ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,.2)', outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="font-display text-[30px] font-semibold leading-none tracking-tight md:text-[38px]">
          £<Ticker value={q.low} />
          <span style={{ color: 'var(--muted)' }}>–</span>£<Ticker value={q.high} />
        </div>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-snug" style={{ color: 'var(--muted)' }}>{EXAMPLE_LABEL}</p>

      {/* phones: go on to the full designer */}
      <a href="#design" className="mt-3 flex h-12 items-center justify-center rounded-full text-[15px] font-semibold md:hidden" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
        Pick surface &amp; colour →
      </a>
      {/* desktop: finish the quote right here */}
      <div className="hidden md:block">
        {step === 'price' ? (
          <button onClick={() => setStep('details')} className="mt-4 h-12 w-full rounded-full text-[15px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
            Book a free survey →
          </button>
        ) : (
          <form className="mt-4 grid gap-2" onSubmit={(e) => { e.preventDefault(); if (ok) window.open(waLink(q, who), '_blank'); }}>
            <input className="pe-in" placeholder="Your name" autoComplete="name" value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} aria-label="Your name" />
            <div className="grid grid-cols-[1.4fr_1fr] gap-2">
              <input className="pe-in" placeholder="Phone" type="tel" autoComplete="tel" value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value })} aria-label="Phone" />
              <input className="pe-in" placeholder="Postcode" autoComplete="postal-code" value={who.postcode} onChange={(e) => setWho({ ...who, postcode: e.target.value })} aria-label="Postcode" />
            </div>
            <button disabled={!ok} className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-50" style={{ background: '#25D366', color: '#062b14' }}>
              <WaIcon /> {`Send to ${site.owner.first} on WhatsApp`}
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
