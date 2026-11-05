import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initPour, type PourApi } from './pour';
import { whenReadyForGL, isCoarse } from '@/src/lib/gl';
import { useSite, fill } from '@/src/lib/ctx';
import VerticalCutReveal from '@/components/library/vertical-cut-reveal/VerticalCutReveal';
import { MetalCTA } from '@/components/library/liquid-metal-button/MetalCTA';
import type { Finish } from '@/config/trades/epoxy';

// Default hero. Poster frame first (a real frame of this shader), then the live pour takes over.
export function PourHero({ compact = false }: { compact?: boolean }) {
  const { site, trade, preset } = useSite();
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<PourApi | null>(null);
  const [live, setLive] = useState(false);
  const [poured, setPoured] = useState(0);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const [finish, setFinish] = useState<Finish>(() => trade.finishes.find((f) => f.type === 'metallic' && f.key.includes('copper')) || trade.finishes[1]);
  const coarse = typeof window !== 'undefined' && isCoarse();

  useEffect(() => {
    if (!host.current || !canvas.current) return;
    const f0 = { base: preset.resin.base, metal: preset.resin.metal };
    const stop = whenReadyForGL(() => {
      const a = initPour(host.current!, canvas.current!, {
        base: f0.base, metal: f0.metal, kind: 'metallic', concrete: preset.concrete,
        onFirst: () => setTouched(true),
        onCoverage: (c) => setPoured(c),
        onFinished: () => setDone(true),
        onReady: () => setLive(true),
      });
      if (!a) return;
      api.current = a;
      a.demo();
    }, { eagerTouch: true });
    return () => { stop(); api.current?.destroy(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.set({ base: finish.type === 'metallic' && finish.key.includes('copper') ? preset.resin.base : finish.base, metal: finish.type === 'metallic' && finish.key.includes('copper') ? preset.resin.metal : finish.metal, kind: finish.type }); }, [finish, preset]);

  const pct = Math.round(Math.min(1, poured / 0.6) * 100);
  const lines = trade.hero.lines;

  return (
    <section
      ref={host}
      id="top"
      className="relative isolate overflow-hidden"
      style={{ height: compact ? 640 : '100svh', minHeight: 600, touchAction: 'pan-y', cursor: live && !done ? 'crosshair' : undefined }}
      aria-label="Hero: pour a resin floor"
    >
      {/* poster: a real rendered frame of the pour, so first paint is never flat */}
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet="/posters/pour-m-v1.webp" />
        <img src="/posters/pour-d-v1.webp" alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5]" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 52%, rgba(0,0,0,.72) 100%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1240px] flex-col justify-end px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-24 md:px-16 md:pb-16">
        <div className="eyebrow mb-4 flex items-center gap-2 text-[var(--ink)]/80" style={{ color: 'color-mix(in srgb, var(--ink) 75%, transparent)' }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
          {trade.hero.eyebrow} · {site.town}
        </div>
        <h1 className="font-display text-[clamp(46px,8.4vw,128px)] font-semibold leading-[.9] tracking-[-.035em]" style={{ textShadow: '0 2px 30px rgba(0,0,0,.35)' }}>
          {lines.map((l, i) => (
            <span key={i} className="block"><VerticalCutReveal splitBy="characters" staggerDuration={0.018} staggerFrom="first"
              transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 + i * 0.16 }}
              containerClassName={i === 1 ? 'serif font-normal' : ''}>
              {l}
            </VerticalCutReveal></span>
          ))}
        </h1>
        <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 82%, transparent)' }}>
          {fill(trade.hero.sub, site)}
        </p>

        <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3" data-nopour>
          <MetalCTA label="Get my price" href="#price" width={coarse ? 168 : 190} height={52} />
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="glass inline-flex h-[52px] items-center gap-2 rounded-full px-5 text-[15px] font-medium">
            <span aria-hidden>☏</span> {site.phone}
          </a>
        </div>

        {/* finish picker + pour progress */}
        <div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-2 md:absolute md:bottom-16 md:right-16 md:mt-0 md:max-w-[360px] md:flex-col md:items-end" data-nopour>
          <div className="glass flex items-center gap-1.5 rounded-full p-1.5">
            {trade.finishes.slice(0, 5).map((f) => (
              <button key={f.key} onClick={() => setFinish(f)} aria-label={`Pour ${f.name}`} title={f.name}
                className="relative h-8 w-8 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95"
                style={{ background: `radial-gradient(circle at 35% 30%, ${f.metal}, ${f.base} 70%)`, outline: finish.key === f.key ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,.18)', outlineOffset: 2 }} />
            ))}
          </div>
          <div className="glass flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-[13px]">
            <span className="whitespace-nowrap" style={{ color: 'var(--muted)' }}>{finish.name}</span>
            <span className="relative h-1 w-20 overflow-hidden rounded-full bg-white/10">
              <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300" style={{ width: `${done ? 100 : pct}%`, background: 'var(--accent)' }} />
            </span>
            {done ? (
              <button onClick={() => { api.current?.reset(); setDone(false); setPoured(0); }} className="rounded-full bg-white/10 px-3 py-1.5 font-medium hover:bg-white/15">Pour again</button>
            ) : (
              <button onClick={() => api.current?.finish()} className="rounded-full px-3 py-1.5 font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Finish floor</button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {live && !touched && !done && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 1.6 }}
            className="glass pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 rounded-full px-4 py-2 text-[13px] md:left-auto md:right-[10%] md:top-[16%] md:translate-x-0">
            {coarse ? trade.hero.hint.touch : trade.hero.hint.mouse} ↔
          </motion.div>
        )}
      </AnimatePresence>
      <span className="ex-tag right-4 top-[76px] md:right-6">Live render · not a photo</span>
    </section>
  );
}
