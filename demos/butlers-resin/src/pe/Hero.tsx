import { useEffect, useRef, useState } from 'react';
import type { BrickApi } from '@/components/signature/brick-drop/bricks';
import { whenReadyForGL, isCoarse, glMode, softwareRenderer } from '@/src/lib/gl';
import { useSite } from '@/src/lib/ctx';
import { CutReveal } from './lite';
import { types, blends } from '@/config/driveway';
import { swatch } from '@/config/swatches';
import { useQuote } from './quote';
import { Stars } from './lite';

// Signature moment: an old cracked drive, and the surface you pick goes down on it the way it would on site
// (resin and concrete poured, blocks dropped course by course, patio flags laid by hand). Poster paints first.
export function Hero() {
  const { site, preset } = useSite();
  const q = useQuote();
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<BrickApi | null>(null);
  const typeRef = useRef<string>('resin');
  const blendRef = useRef(q.blend);
  blendRef.current = q.blend;
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
      const go = () => { if (a.loaded) (window as any).__heroReady = true; if (!(a.loaded && (window as any).__ld !== false)) return setTimeout(go, 60); a.set(blendRef.current); if (typeRef.current !== 'block') a.surface(typeRef.current as any); else a.demo(); };
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
      aria-label="Hero: pick a surface and watch it go down">
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet={site.posters.m} />
        <img src={site.posters.d} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,.7) 0%, rgba(10,10,10,0) 22%, rgba(10,10,10,0) 40%, rgba(10,10,10,.55) 64%, rgba(10,10,10,.9) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] md:hidden" style={{ background: 'linear-gradient(180deg, rgba(14,14,15,.6) 0%, rgba(14,14,15,0) 11%, rgba(14,14,15,0) 32%, rgba(14,14,15,.72) 44%, rgba(14,14,15,.9) 58%, rgba(14,14,15,.96) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,.78) 0%, rgba(10,10,10,.35) 38%, rgba(10,10,10,0) 55%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-24 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-14">
        <div className="md:max-w-[720px]">
          <a href={site.socials.checkatrade} target="_blank" rel="noreferrer" data-nopour
            className="pointer-events-auto mb-4 inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium"
            style={{ background: 'rgba(11,15,21,.62)', border: '1px solid rgba(169,195,227,.18)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            <span className="grid h-6 place-items-center rounded-full px-2 text-[12px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{`${site.proof.checkatradeScore}/10`}</span>
            <span>{`Checkatrade, ${site.proof.checkatradeCount} reviews`}</span>
          </a>
          <h1 className="font-display text-[clamp(40px,min(8vw,6.4vw+12px),96px)] font-bold leading-[1.04] tracking-[-.03em]" style={{ textWrap: 'balance' } as any}>
            {['Resin driveways,', 'laid properly.'].map((l, i) => (
              <span key={i} className="block md:whitespace-nowrap" style={i === 1 ? { color: 'var(--accent)', fontWeight: 500 } : undefined}><CutReveal text={l} delay={0.08 + i * 0.12} /></span>
            ))}
          </h1>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed md:mt-5 md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 84%, transparent)' }}>
            {`Resin bound driveways, patios and paths across ${site.areaLine}, from ${site.town}.`}
          </p>
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

// Surface type: what goes down (ported from the earlier driveway build). Swatches are stills of the hero's own renders.
function TypePick() {
  const q = useQuote();
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-medium" style={{ color: 'var(--muted)' }}>Choose your surface</p>
        <p className="text-[12px] font-medium">{q.type.label}</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="New surface">
        {types.map((t) => {
          const on = q.type.key === t.key;
          return (
            <button key={t.key} role="radio" aria-checked={on} aria-label={t.label} onClick={() => q.setType(t.key)}
              className="press flex flex-col items-center gap-1 rounded-xl px-1 pb-1 pt-1 md:pb-1.5 md:pt-1.5 text-[11.5px] font-medium leading-tight transition-colors md:text-[12px]"
              style={on ? { background: 'rgba(240,178,78,.16)', border: '1px solid var(--accent)' } : { background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)' }}>
              <span className="block h-5 w-full rounded-md bg-cover bg-center md:h-8" style={{ backgroundImage: swatch[t.key] ? `url(${swatch[t.key]})` : undefined }} aria-hidden />
              <span className="md:hidden">{t.short}</span><span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// Resin blend chips (names he has laid; colours are illustrations). Repaints the hero's resin live.
function BlendPick() {
  const q = useQuote();
  if (q.type.key !== 'resin') return null;
  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Resin blend">
        {blends.map((b) => {
          const on = q.blend.key === b.key;
          return (
            <button key={b.key} role="radio" aria-checked={on} onClick={() => q.setBlend(b.key)}
              className="press flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12.5px] font-medium"
              style={on ? { background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.4)' } : { background: 'rgba(255,255,255,.03)', border: '1px solid var(--line)' }}>
              <span className="block h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: `radial-gradient(circle at 35% 35%, ${b.c3}, ${b.c2} 45%, ${b.c1})` }} aria-hidden />
              <span>{b.name}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[10.5px]" style={{ color: 'var(--muted)' }}>Blends he has laid, colours approximate</p>
    </div>
  );
}
// Hero card: surface picker, resin blends, then the survey CTA above the fold (his current site has none up here).
function HeroQuote() {
  const { site } = useSite();
  return (
    <div data-nopour className="pointer-events-auto mt-5 w-full rounded-2xl p-3.5 md:mt-0 md:w-[420px] md:shrink-0 md:p-5"
      style={{ background: 'linear-gradient(160deg, rgba(22,30,40,.82), rgba(11,15,21,.86))', border: '1px solid rgba(169,195,227,.16)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)' }}>
      <TypePick />
      <BlendPick />
      <a href="#survey" className="btn-gold press mt-3.5 flex h-12 items-center justify-center rounded-full text-[15px] font-semibold">
        Book your free survey →
      </a>
      <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="mt-1 flex h-9 items-center justify-center text-[13.5px] md:mt-2 md:h-10" style={{ color: 'var(--muted)' }}>
        {`or call ${site.phone}`}
      </a>
    </div>
  );
}

export function WaIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>;
}
