import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { layerBg } from '@/config/trades/epoxy';
import { useSite } from '@/src/lib/ctx';
import { Marquee } from '@/components/library/marquee/Marquee';
import StackingCards, { StackingCardItem } from '@/components/library/stacking-cards/StackingCards';
import { LayerStack, useLayerScroll, type Layer } from '@/components/signature/layer-explode/LayerExplode';


export function Services() {
  const { trade } = useSite();
  return (
    <section aria-label="Services" className="relative border-y py-5" style={{ borderColor: 'var(--line)', background: 'var(--bg2)' }}>
      <Marquee pauseOnHover className="[--duration:38s] [--gap:.75rem]">
        {trade.services.map((s) => (
          <span key={s} className="glass inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[15px]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />{s}
          </span>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16" style={{ background: 'linear-gradient(90deg, var(--bg2), transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16" style={{ background: 'linear-gradient(270deg, var(--bg2), transparent)' }} />
    </section>
  );
}

// Full-bleed finished floor: starts as an inset card and grows edge to edge as you scroll.
export function Expand() {
  const { trade } = useSite();
  const e = trade.copy.expand!;
  const isPhone = typeof matchMedia !== 'undefined' && matchMedia('(max-width: 699px)').matches;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const inset = useTransform(scrollYProgress, [0.25, 0.85], [14, 0], { clamp: true });
  const radius = useTransform(scrollYProgress, [0.25, 0.85], [28, 0], { clamp: true });
  const clip = useTransform([inset, radius], ([i, r]: number[]) => `inset(${i}% ${i * 0.7}% round ${r}px)`);
  const scale = useTransform(scrollYProgress, [0.25, 1], [1.18, 1]);
  const textO = useTransform(scrollYProgress, [0.7, 0.92], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.7, 0.92], [30, 0]);
  return (
    <section ref={ref} aria-label="See it in your space" className="relative h-[130vh] md:h-[200vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath: clip }}>
          <motion.picture className="absolute inset-0 block" style={{ scale }}>
            {e.imageM && <source media="(max-width: 699px)" srcSet={e.imageM} />}
            {e.imageAvif && <source type="image/avif" srcSet={e.imageAvif} />}
            <img src={e.image} alt={e.alt || ''} className="h-full w-full object-cover" style={e.pos ? { objectPosition: isPhone ? (e.posM || 'center') : e.pos } : undefined} loading="lazy" decoding="async" />
          </motion.picture>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,0) 35%, rgba(0,0,0,.65))' }} />
          <span className="ex-tag bottom-3 right-3 !text-[9px] !opacity-80">{e.by || 'Example image'}</span>
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-x-0 bottom-[10vh] flex flex-col items-center gap-4 px-6 text-center" style={{ opacity: textO, y: textY }}>
          <h2 className="h2 text-white" style={{ textShadow: '0 2px 30px rgba(0,0,0,.5)' }}>{e.title}</h2>
          <a href="#price" className="pointer-events-auto rounded-full px-6 py-3.5 text-[15px] font-semibold shadow-2xl" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>See your price</a>
        </motion.div>
      </div>
    </section>
  );
}

// Full-bleed photo break: one still, one line, no chrome.
export function PhotoBreak() {
  const { trade } = useSite();
  const b = trade.copy.photoBreak;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  if (!b) return null;
  return (
    <section ref={ref} aria-label="Photo" className="relative h-[62svh] overflow-hidden md:h-[88vh]">
      <motion.picture className="absolute inset-[-10%_0] block" style={{ y }}>
        {b.imgM && <source media="(max-width: 699px)" srcSet={b.imgM} />}
        {b.imgAvif && <source type="image/avif" srcSet={b.imgAvif} />}
        <img src={b.img} alt={b.alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      </motion.picture>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.7))' }} />
      <p className="absolute inset-x-0 bottom-8 mx-auto max-w-[1240px] px-5 font-display text-[clamp(28px,4.6vw,60px)] font-semibold leading-[1.02] tracking-tight text-white md:bottom-14 md:px-16">{b.line}</p>
      <span className="ex-tag right-3 top-3 !text-[9px] !opacity-80">{b.by || 'Example image'}</span>
    </section>
  );
}

export function Layers() {
  const { trade } = useSite();
  const layers: Layer[] = trade.layers.map((l) => ({ ...l, bg: layerBg(l) }));
  const { ref, progress, active } = useLayerScroll(layers.length);
  const c = trade.copy.layers;
  return (
    <section id="layers" aria-label="The layers" className="relative" style={{ background: 'var(--bg)' }}>
      <div className="section wrap pb-0">
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 className="h2 mt-4">{c.h1}<br /><span className="serif" style={{ color: 'var(--accent2)' }}>{c.h2}</span></h2>
        <p className="lede mt-5">{c.lede}</p>
      </div>
      <div ref={ref} className="relative mx-auto grid max-w-[1240px] gap-0 px-5 md:grid-cols-2 md:gap-14 md:px-16">
        <div className="sticky top-0 z-10 flex h-[44vh] items-center justify-center md:h-screen" style={{ background: 'linear-gradient(var(--bg) 82%, transparent)' }}>
          <LayerStack layers={layers} progress={progress} active={active} />
          <span className="ex-tag bottom-3 right-0 md:bottom-16">{c.tag}</span>
        </div>
        <StackingCards totalCards={layers.length} scaleMultiplier={0.035} className="pb-[5vh] md:pb-[12vh] [--card-top:46vh] md:[--card-top:18vh]">
          {layers.map((l, i) => (
            <StackingCardItem key={l.key} index={i} className="h-[27vh] md:h-[60vh]" topPosition={`calc(var(--card-top) + ${i * 12}px)`}>
              <article className="flex h-full max-h-[260px] flex-col justify-between overflow-hidden rounded-[var(--radius)] border p-6 md:max-h-[340px] md:p-8"
                style={{ borderColor: active === i ? 'var(--accent)' : 'var(--line)', background: `linear-gradient(160deg, var(--surface), var(--bg2))`, boxShadow: '0 30px 60px -30px rgba(0,0,0,.7)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[44px] font-semibold leading-none md:text-[64px]" style={{ color: 'var(--accent)' }}>0{i + 1}</span>
                  <span className="h-14 w-14 rounded-full border md:h-16 md:w-16" style={{ backgroundImage: l.bg, backgroundSize: 'cover', borderColor: 'var(--line)' }} />
                </div>
                <div>
                  <h3 className="font-display text-[26px] font-semibold md:text-[34px]">{l.name}</h3>
                  <p className="mt-1 text-[14px] uppercase tracking-[.1em]" style={{ color: 'var(--muted)' }}>{l.what}</p>
                  <p className="mt-3 text-[16px] leading-relaxed md:text-[18px]" style={{ color: 'color-mix(in srgb, var(--ink) 85%, transparent)' }}>{l.why}</p>
                </div>
              </article>
            </StackingCardItem>
          ))}
        </StackingCards>
      </div>
    </section>
  );
}
