import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initTrowel, type TrowelApi } from './trowel';
import { whenReadyForGL, isCoarse, reducedMotion } from '@/src/lib/gl';
import { useSite } from '@/src/lib/ctx';
import VerticalCutReveal from '@/components/library/vertical-cut-reveal/VerticalCutReveal';
import { MetalCTA } from '@/components/library/liquid-metal-button/MetalCTA';

// Microcement signature hero: a dated tiled wall; move (desktop) or swipe (phone) to trowel microcement over it.
// Drop-in alternative to PourHero. Poster frame first (a real still of this shader), then the live wall takes over.
export type TrowelColour = { name: string; hex: string };
export const defaultTrowelColours: TrowelColour[] = [
  { name: 'Stone grey', hex: '#BEB8AE' },
  { name: 'Chalk', hex: '#ECE8E0' },
  { name: 'Limestone', hex: '#D8CEBE' },
  { name: 'Warm clay', hex: '#B89C82' },
  { name: 'Graphite', hex: '#66625D' },
];

export type TrowelHeroProps = {
  eyebrow?: string;
  lines?: [string, string];
  sub?: ReactNode;
  hint?: { mouse: string; touch: string };
  colours?: TrowelColour[];
  cta?: { label: string; href: string };
  poster?: { desktop: string; mobile: string };
  compact?: boolean;
  children?: ReactNode;
};

export function TrowelHero({
  eyebrow = 'Microcement walls & floors',
  lines = ['Smooth over', 'the old tiles.'],
  sub,
  hint = { mouse: 'Move to trowel', touch: 'Swipe to trowel' },
  colours = defaultTrowelColours,
  cta = { label: 'Get my price', href: '#price' },
  poster = { desktop: '/posters/trowel-d-v1.webp', mobile: '/posters/trowel-m-v1.webp' },
  compact = false,
  children,
}: TrowelHeroProps) {
  const { site } = useSite();
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<TrowelApi | null>(null);
  const [live, setLive] = useState(false);
  const [cover, setCover] = useState(0);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [colour, setColour] = useState<TrowelColour>(colours[0]);
  const coarse = typeof window !== 'undefined' && isCoarse();

  useEffect(() => {
    if (!host.current || !canvas.current || reducedMotion()) return;
    const stop = whenReadyForGL(() => {
      const a = initTrowel(host.current!, canvas.current!, {
        colour: colour.hex,
        onReady: () => setLive(true),
        onFirst: () => setTouched(true),
        onCoverage: (c) => setCover(c),
        onCured: () => setDone(true),
      });
      if (!a) return;
      api.current = a;
      a.demo();
    }, { eagerTouch: true });
    return () => { stop(); api.current?.destroy(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.setColour(colour.hex); }, [colour]);

  const pct = Math.round(Math.min(1, cover / 0.72) * 100);
  const subText = sub ?? <>Seamless microcement over existing tiles, plaster and concrete across {site.town} and {site.region}. {coarse ? 'Swipe' : 'Move'} across the wall to trowel it.</>;

  return (
    <section ref={host} id="top" className="relative isolate overflow-hidden"
      style={{ height: compact ? 640 : '100svh', minHeight: 600, touchAction: 'pan-y', cursor: live && !done ? 'crosshair' : undefined, color: 'var(--ink)' }}
      aria-label="Hero: trowel microcement over a tiled wall">
      {/* poster: a real still of the trowel shader, so the first paint is never flat */}
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet={poster.mobile} />
        <img src={poster.desktop} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      {/* scrim from the preset background, so the copy reads in light and dark presets alike */}
      <div className="pointer-events-none absolute inset-0 -z-[5]"
        style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--bg) 55%, transparent) 0%, transparent 22%, transparent 40%, color-mix(in srgb, var(--bg) 82%, transparent) 78%, var(--bg) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] md:hidden" style={{ background: 'linear-gradient(0deg, color-mix(in srgb, var(--bg) 70%, transparent) 0%, transparent 60%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1240px] flex-col justify-end px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-24 md:px-16 md:pb-16">
        <div className="eyebrow mb-4 flex items-center gap-2" style={{ color: 'color-mix(in srgb, var(--ink) 78%, transparent)' }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
          {eyebrow} · {site.town}
        </div>
        <h1 className={`font-display font-semibold leading-[.9] tracking-[-.035em] ${compact ? 'text-[clamp(40px,5.2vw,76px)]' : 'text-[clamp(46px,8.4vw,128px)]'}`}>
          {lines.map((l, i) => (
            <span key={i} className="block"><VerticalCutReveal splitBy="characters" staggerDuration={0.018} staggerFrom="first"
              transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 + i * 0.16 }}
              containerClassName={i === 1 ? 'serif font-normal' : ''}>
              {l}
            </VerticalCutReveal></span>
          ))}
        </h1>
        <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 84%, transparent)' }}>{subText}</p>

        <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3" data-notrowel>
          <MetalCTA label={cta.label} href={cta.href} width={coarse ? 168 : 190} height={52} />
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="glass inline-flex h-[52px] items-center gap-2 rounded-full px-5 text-[15px] font-medium">
            <span aria-hidden>☏</span> {site.phone}
          </a>
        </div>

        {/* colour picker + trowel progress */}
        <div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-2 transition-opacity duration-500 md:absolute md:bottom-16 md:right-16 md:mt-0 md:max-w-[360px] md:flex-col md:items-end" style={{ opacity: live ? 1 : 0, visibility: live ? 'visible' : 'hidden' }} data-notrowel>
          <div className="glass flex items-center gap-1.5 rounded-full p-1.5">
            {colours.map((c) => (
              <button key={c.hex} onClick={() => setColour(c)} aria-label={`Trowel ${c.name}`} title={c.name}
                className="relative h-8 w-8 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95"
                style={{ background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${c.hex} 70%, white), ${c.hex} 65%)`, outline: colour.hex === c.hex ? '2px solid var(--accent)' : '1px solid rgba(128,128,128,.35)', outlineOffset: 2 }} />
            ))}
          </div>
          <div className="glass flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-[13px]">
            <span className="whitespace-nowrap" style={{ color: 'var(--muted)' }}>{colour.name}</span>
            <span className="relative h-1 w-20 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--ink) 14%, transparent)' }}>
              <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300" style={{ width: `${done ? 100 : pct}%`, background: 'var(--accent)' }} />
            </span>
            {done ? (
              <button onClick={() => { api.current?.reset(); setDone(false); setCover(0); }} className="rounded-full px-3 py-1.5 font-medium" style={{ background: 'color-mix(in srgb, var(--ink) 10%, transparent)' }}>Start again</button>
            ) : (
              <button onClick={() => api.current?.finish()} className="rounded-full px-3 py-1.5 font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Finish wall</button>
            )}
          </div>
        </div>
        {children}
      </div>

      <AnimatePresence>
        {live && !touched && !done && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 1.6 }}
            className={`glass pointer-events-none absolute rounded-full px-4 py-2 text-[13px] ${compact ? 'left-4 top-4' : 'left-1/2 top-[18%] -translate-x-1/2 md:left-auto md:right-[10%] md:top-[16%] md:translate-x-0'}`}>
            {coarse ? hint.touch : hint.mouse} ↔
          </motion.div>
        )}
      </AnimatePresence>
      <span className="ex-tag right-4 top-[76px] md:right-6">{live ? 'Live render · not a photo' : 'Render · not a photo'}</span>
    </section>
  );
}

export default TrowelHero;
