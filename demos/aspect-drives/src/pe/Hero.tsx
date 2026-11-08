import { useEffect, useRef, useState } from 'react';
import type { BrickApi } from '@/components/signature/brick-drop/bricks';
import { whenReadyForGL, isCoarse, glMode, softwareRenderer } from '@/src/lib/gl';
import { useSite } from '@/src/lib/ctx';
import { CutReveal } from './lite';
import { types } from '@/config/driveway';
import { swatch } from '@/config/swatches';
import { useQuote } from './quote';

// Signature moment: drag to lay block paving over a cracked old drive; the card switches the surface (block, resin, patio, concrete).
// Poster (a real frame of this shader) paints first; the live pour takes over and auto-demos on phones.
export function Hero() {
  const { site, preset } = useSite();
  const q = useQuote();
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<BrickApi | null>(null);
  const typeRef = useRef<string>('block');
  const [live, setLive] = useState(false);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const [cov, setCov] = useState(0);
  const coarse = typeof window !== 'undefined' && isCoarse();

  useEffect(() => {
    if (!host.current || !canvas.current) return;
    if (glMode() === 'off' || softwareRenderer()) (window as any).__heroNoGL = true;
    let gone = false;
    // three.js + textures wait until the page has loaded and gone idle, so they never compete with first paint
    const afterLoad = (f: () => void) => {
      const idle = () => ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(f, { timeout: 700 }) : setTimeout(f, 200));
      if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
    };
    const stop = whenReadyForGL(() => afterLoad(start), { eagerTouch: true });
    async function start() {
      if (gone) return;
      const a = (await import('@/components/signature/brick-drop/bricks')).initBricks(host.current!, canvas.current!, {
        fog: preset.bg, tex: '/tex/', onFirst: () => setTouched(true), onCoverage: setCov, onFinished: () => setDone(true),
        onReady: () => setLive(true), onLost: () => setLive(false),
      });
      if (!a) return;
      if (gone) { a.destroy(); return; }
      api.current = a;
      const go = () => { if (a.loaded) (window as any).__heroReady = true; if (!(a.loaded && (window as any).__ld !== false)) return setTimeout(go, 60); if (typeRef.current !== 'block') a.surface(typeRef.current as any); else a.demo(); };
      go();
    }
    return () => { gone = true; stop(); api.current?.destroy(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.set(q.blend); }, [q.blend]);
  // the background follows the chosen surface
  const typeKey = q.type.key;
  typeRef.current = typeKey;
  useEffect(() => {
    const a = api.current;
    if (!a) return;
    setDone(false); setCov(0);
    a.surface(typeKey);
  }, [typeKey]);
  const lay = typeKey === 'block';

  const pct = Math.round(Math.min(1, cov / 0.72) * 100);

  return (
    <section ref={host} id="top" className="relative isolate overflow-hidden"
      style={{ height: '100svh', minHeight: 640, touchAction: 'pan-y', cursor: live && !done ? 'crosshair' : undefined }}
      aria-label="Hero: lay a block-paved driveway">
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet={site.posters.m} />
        <img src={site.posters.d} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(180deg, rgba(16,18,21,.7) 0%, rgba(16,18,21,0) 22%, rgba(16,18,21,0) 40%, rgba(16,18,21,.55) 64%, rgba(16,18,21,.9) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] md:hidden" style={{ background: 'linear-gradient(180deg, rgba(16,18,21,.6) 0%, rgba(16,18,21,0) 11%, rgba(16,18,21,0) 32%, rgba(16,18,21,.72) 44%, rgba(16,18,21,.9) 58%, rgba(16,18,21,.96) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(16,18,21,.78) 0%, rgba(16,18,21,.35) 38%, rgba(16,18,21,0) 55%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-[max(44px,env(safe-area-inset-bottom))] pt-24 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-24">
        <div className="md:max-w-[640px]">
          <h1 className="font-display text-[clamp(52px,8.6vw,96px)] font-semibold leading-[.95] tracking-[-.035em]">
            {['Your drive,', 'by design.'].map((l, i) => (
              <span key={i} className="block"><CutReveal text={l} delay={0.12 + i * 0.16} className={i === 1 ? 'y' : ''} /></span>
            ))}
          </h1>
          <p className="mt-5 max-w-[34ch] text-[16px] leading-relaxed md:text-[19px]" style={{ color: 'color-mix(in srgb, var(--ink) 82%, transparent)' }}>
            {`Block paving, resin and patios across ${site.region}.`}
          </p>
          <div className="pointer-events-auto mt-6 flex flex-wrap gap-2.5 md:mt-8" data-nopour>
            <a href="#price" className="btn btn-y">Price my drive</a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ background: 'rgba(16,18,21,.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}><WaIcon />{` WhatsApp ${site.owner.first}`}</a>
          </div>
          {!coarse && live && lay && (
            <div className="pointer-events-auto mt-6 hidden items-center gap-3 md:flex" data-nopour>
              <span className="glass flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-[13px]">
                <span style={{ color: 'var(--muted)' }}>{done ? 'Finished' : touched ? 'Laying' : 'Drag across the drive'}</span>
                <span className="relative h-1 w-20 overflow-hidden rounded-full bg-white/10">
                  <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300" style={{ width: `${done ? 100 : pct}%`, background: 'var(--accent)' }} />
                </span>
                {done
                  ? <button onClick={() => { api.current?.reset(); setDone(false); setCov(0); }} className="rounded-full bg-white/10 px-3 py-1.5 font-medium hover:bg-white/15">Lay again</button>
                  : <button onClick={() => api.current?.finish()} className="rounded-full px-3 py-1.5 font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Lay the rest</button>}
              </span>
            </div>
          )}
        </div>
        <HeroQuote />
      </div>

      {live && lay && !touched && !done && (
          <div
            className="pe-hint glass pointer-events-none absolute left-1/2 top-[19%] -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[13px] md:left-[38%] md:top-[30%]">
            {coarse ? 'Swipe to lay the bricks' : 'Drag across to lay the bricks'} ↔
          </div>
        )}
      <span className="ex-tag right-4 top-[76px] md:right-6">Live illustration</span>
    </section>
  );
}

// Surface type: what goes down (ported from the Proficient Essex hero). Swatches are stills of the hero's own renders.
function TypePick() {
  const q = useQuote();
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[.14em]" style={{ color: 'var(--accent2)' }}>Choose your surface</p>
        <p className="text-[12px] font-medium">{q.type.label}</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="New surface">
        {types.map((t) => {
          const on = q.type.key === t.key;
          return (
            <button key={t.key} role="radio" aria-checked={on} aria-label={t.label} onClick={() => q.setType(t.key)}
              className="flex flex-col items-center gap-1 rounded-xl px-1 pb-1 pt-1 md:pb-1.5 md:pt-1.5 text-[11.5px] font-medium leading-tight transition-colors md:text-[12px]"
              style={on ? { background: 'rgba(244,194,27,.14)', border: '1px solid #F4C21B' } : { background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)' }}>
              <span className="block h-5 w-full rounded-md bg-cover bg-center md:h-8" style={{ backgroundImage: swatch[t.key] ? `url(${swatch[t.key]})` : undefined }} aria-hidden />
              <span className="md:hidden">{t.short}</span><span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// Hero card (desktop): the surface picker switches the live background.
function HeroQuote() {
  return (
    <div data-nopour className="pointer-events-auto mt-6 hidden w-full rounded-[14px] p-4 md:mt-0 md:block md:w-[380px] md:shrink-0 md:p-5"
      style={{ background: 'rgba(16,18,21,.72)', boxShadow: 'inset 0 0 0 1px rgba(236,236,232,.12), 0 30px 60px -30px rgba(0,0,0,.8)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)' }}>
      <TypePick />
    </div>
  );
}

export function WaIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>;
}
