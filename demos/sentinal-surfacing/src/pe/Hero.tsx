import { useEffect, useRef, useState } from 'react';
import type { BrickApi } from '@/components/signature/brick-drop/bricks';
import { whenReadyForGL, glMode, softwareRenderer } from '@/src/lib/gl';
import { useSite } from '@/src/lib/ctx';
import { CutReveal } from './lite';
import { types } from '@/config/driveway';
import { swatch } from '@/config/swatches';
import { useQuote } from './quote';

// Signature moment: fresh resin-bound stone pours over an old cracked concrete drive on load (auto, under 3 s).
// The picker re-pours the whole frame in microcement or a glossy floor coating: one per service on their site.
export function Hero() {
  const { site, preset } = useSite();
  const q = useQuote();
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<BrickApi | null>(null);
  const [live, setLive] = useState(false);

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
        fog: preset.bg, tex: '/tex/', first: 'resin',
        onReady: () => setLive(true), onLost: () => setLive(false),
      });
      if (!a) return;
      if (gone) { a.destroy(); return; }
      api.current = a;
      const go = () => { if (a.loaded) (window as any).__heroReady = true; if (!(a.loaded && (window as any).__ld !== false)) return setTimeout(go, 60); a.demo(); };
      go();
    }
    return () => { gone = true; stop(); api.current?.destroy(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.set(q.blend); }, [q.blend]);
  // the background follows the chosen surface
  const typeKey = q.type.key;
  useEffect(() => { api.current?.surface(typeKey); }, [typeKey]);

  return (
    <section ref={host} id="top" className="relative isolate overflow-hidden"
      style={{ height: '100svh', minHeight: 640, touchAction: 'pan-y' }}
      aria-label="Hero: fresh resin poured over an old concrete drive">
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet={site.posters.m} />
        <img src={site.posters.d} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(180deg, rgba(9,13,24,.72) 0%, rgba(9,13,24,0) 22%, rgba(9,13,24,0) 40%, rgba(9,13,24,.55) 64%, rgba(9,13,24,.92) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] md:hidden" style={{ background: 'linear-gradient(180deg, rgba(9,13,24,.62) 0%, rgba(9,13,24,0) 11%, rgba(9,13,24,0) 32%, rgba(9,13,24,.74) 44%, rgba(9,13,24,.92) 58%, rgba(9,13,24,.97) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(9,13,24,.8) 0%, rgba(9,13,24,.35) 38%, rgba(9,13,24,0) 55%)' }} />
      {/* coloured light: amber from the left, electric blue from the right */}
      <div className="pointer-events-none absolute inset-0 -z-[4] ss-drift" style={{ background: 'radial-gradient(60% 50% at 8% 92%, rgba(252,184,97,.22), transparent 70%), radial-gradient(50% 40% at 96% 12%, rgba(111,140,255,.16), transparent 70%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-24 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-14">
        <div className="md:max-w-[660px]">
          <a href="#reviews" data-nopour
            className="pointer-events-auto mb-4 inline-flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-[13px] font-medium"
            style={{ background: 'rgba(9,13,24,.62)', border: '1px solid rgba(196,208,255,.14)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            <GoogleG /> <span>{site.proof.ratingWord}</span>
            <span style={{ color: 'var(--muted)' }}>{`· ${site.proof.reviewCount} Google reviews`}</span>
          </a>
          <h1 className="font-display text-[clamp(44px,8vw,112px)] font-semibold leading-[.9] tracking-[-.035em]">
            {['Seamless surfaces,', 'inside and out.'].map((l, i) => (
              <span key={i} className="block"><CutReveal text={l} delay={0.12 + i * 0.16} className={i === 1 ? 'serif ss-grad-text font-normal' : ''} /></span>
            ))}
          </h1>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed md:mt-5 md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 84%, transparent)' }}>
            {`Resin-bound driveways, microcement and commercial floors since ${site.since}. Based in ${site.town}, working across ${site.areaLine}.`}
          </p>
        </div>
        <HeroQuote />
      </div>
      <span className="ex-tag right-4 top-[76px] md:right-6">Live illustration</span>
    </section>
  );
}

// Surface type: what goes down. Swatches are crops of their own job photos.
function TypePick() {
  const q = useQuote();
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[.14em]" style={{ color: 'var(--pop)' }}>Pour a new surface</p>
        <p className="text-[12px] font-medium">{q.type.label}</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="New surface">
        {types.map((t) => {
          const on = q.type.key === t.key;
          return (
            <button key={t.key} role="radio" aria-checked={on} aria-label={t.label} onClick={() => q.setType(t.key)}
              className="flex flex-col items-center gap-1 rounded-xl px-1 pb-1 pt-1 text-[11.5px] font-medium leading-tight transition-colors md:pb-1.5 md:pt-1.5 md:text-[12px]"
              style={on ? { background: 'rgba(252,184,97,.16)', border: '1px solid var(--accent)', boxShadow: '0 0 22px -6px rgba(252,184,97,.6)' } : { background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)' }}>
              <span className="block h-6 w-full rounded-md bg-cover bg-center md:h-9" style={{ backgroundImage: swatch[t.key] ? `url(${swatch[t.key]})` : undefined }} aria-hidden />
              <span className="md:hidden">{t.short}</span><span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// Hero card: the surface picker and one button on to the quote form (#design). Kept light so the hero breathes on phones.
function HeroQuote() {
  return (
    <div data-nopour className="ss-glass pointer-events-auto mt-5 w-full rounded-[22px] p-3.5 md:mt-0 md:w-[400px] md:shrink-0 md:p-5">
      <TypePick />
      <a href="#design" className="ss-btn mt-3.5 flex h-12 items-center justify-center rounded-full text-[15px] font-semibold">
        Get a quote →
      </a>
    </div>
  );
}

export function GoogleG({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12a11.9 11.9 0 0 1 8.4 3.3l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12a11.9 11.9 0 0 1 8.4 3.3l5.7-5.7A20 20 0 0 0 6.3 14.7z" /><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.2 5.3C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" /></svg>;
}
