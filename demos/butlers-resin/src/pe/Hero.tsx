import { useEffect, useRef, useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { CutReveal } from './lite';
import { types, blends } from '@/config/driveway';
import { useQuote } from './quote';

// His own finished jobs, full-bleed. The surface you pick swaps to his matching job (crossfade + slow Ken Burns drift).
// Concrete has no finished photo of his yet, so it shows his base dig-out (every surface starts there, per his site).
const HERO: Record<string, { img: string; m?: string; cap: string; pos: string; mpos: string }> = {
  resin: { img: 'hero-resin', cap: 'Resin drive, lit at dusk', pos: '50% 62%', mpos: '50% 50%' },
  block: { img: 'hero-block', cap: 'Herringbone block paving', pos: '50% 55%', mpos: '50% 50%' },
  patio: { img: 'hero-patio', m: '/client/hero-patio-m-v2.webp', cap: 'Porcelain patio', pos: '50% 60%', mpos: '50% 50%' },
  concrete: { img: 'hero-concrete', cap: 'Dug out to a proper base', pos: '50% 50%', mpos: '50% 50%' },
};
export function Hero() {
  const { site } = useSite();
  const q = useQuote();
  const key = q.type.key;
  const [warm, setWarm] = useState(false); // other surfaces' photos load only after the page settles
  const seen = useRef(new Set<string>(['resin']));
  seen.current.add(key);
  useEffect(() => {
    const go = () => setWarm(true);
    const idle = () => ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 600));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  }, []);

  return (
    <section id="top" className="hero relative isolate overflow-hidden" style={{ height: '100svh', minHeight: 640 }} aria-label="Butler's Resin and Construction">
      <div className="hero-par absolute inset-0 -z-20" aria-hidden>
        <div className="hero-kb absolute inset-0">
          {Object.entries(HERO).map(([k, h]) => (warm || seen.current.has(k)) && (
            <picture key={k} className="hero-ph absolute inset-0" data-on={k === key}>
              <source media="(max-width: 699px)" srcSet={h.m ?? `/client/${h.img}-m-v1.webp`} />
              <img src={`/client/${h.img}-1600-v1.webp`} alt="" className="h-full w-full object-cover" style={{ objectPosition: h.pos }}
                fetchPriority={k === 'resin' ? 'high' : 'low'} decoding="async" />
            </picture>
          ))}
        </div>
      </div>
      {/* scrim: keeps the copy and card legible on any of his photos */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(11,15,21,.55) 0%, rgba(11,15,21,0) 18%, rgba(11,15,21,0) 38%, rgba(11,15,21,.62) 62%, rgba(11,15,21,.94) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(11,15,21,.72) 0%, rgba(11,15,21,.3) 42%, rgba(11,15,21,0) 62%)' }} />

      <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-20 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-14">
        <div className="md:max-w-[720px]">
          <a href={site.socials.checkatrade} target="_blank" rel="noreferrer"
            className="press mb-4 inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium"
            style={{ background: 'rgba(11,15,21,.72)', border: '1px solid rgba(169,195,227,.18)' }}>
            <span className="grid h-6 place-items-center rounded-full px-2 text-[12px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{`${site.proof.checkatradeScore}/10`}</span>
            <span>{`Checkatrade, ${site.proof.checkatradeCount} reviews`}</span>
          </a>
          <h1 className="font-display text-[clamp(40px,min(8vw,6.4vw+12px),96px)] font-bold leading-[1.04] tracking-[-.03em]" style={{ textWrap: 'balance' } as any}>
            {['Resin driveways,', 'laid properly.'].map((l, i) => (
              <span key={i} className="block md:whitespace-nowrap" style={i === 1 ? { color: 'var(--accent)', fontWeight: 500 } : undefined}><CutReveal text={l} delay={0.08 + i * 0.12} /></span>
            ))}
          </h1>
          <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed md:mt-5 md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 86%, transparent)' }}>
            {`Resin bound driveways, patios and paths across ${site.areaLine}, from ${site.town}.`}
          </p>
        </div>
        <HeroQuote />
      </div>
      <p className="pointer-events-none absolute right-4 top-[76px] max-w-[60vw] text-right text-[11.5px] md:bottom-4 md:right-12 md:top-auto md:text-[12px]" style={{ color: 'rgba(243,241,236,.78)', textShadow: '0 1px 8px rgba(0,0,0,.8)' }} aria-live="polite">
        {`His job: ${HERO[key].cap}`}
      </p>
    </section>
  );
}

// Surface type. Chip thumbnails are close crops of the same job photos.
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
              <span className="block h-5 w-full rounded-md bg-cover bg-center md:h-8" style={{ backgroundImage: `url(/client/chip-${t.key}-v1.webp)` }} aria-hidden />
              <span className="md:hidden">{t.short}</span><span className="hidden md:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// Resin blend chips: names from his own project write-ups (butlersrc.co.uk/recent-projects-1); colours are illustrations.
// The chosen blend goes into the survey email.
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
