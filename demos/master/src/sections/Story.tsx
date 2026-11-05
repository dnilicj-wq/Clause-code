import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { Marquee } from '@/components/library/marquee/Marquee';
import ScrollExpandMedia from '@/components/library/scroll-expansion-hero/ScrollExpansionHero';
import StackingCards, { StackingCardItem } from '@/components/library/stacking-cards/StackingCards';
import { LayerStack, useLayerScroll, type Layer } from '@/components/signature/layer-explode/LayerExplode';

const TEX: Record<string, string> = {
  slab: '/demo/tex-slab-v1.webp', primer: '/demo/tex-primer-v1.webp', base: '/demo/tex-base-v1.webp',
  flake: '/demo/tex-flake-v1.webp', top: '/demo/tex-top-v1.webp',
};

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

// Scroll Expansion: a gloss floor grows to full screen, then "Visualise your garage".
export function Expand({ onVisualise }: { onVisualise?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useTransform(scrollYProgress, [0, 0.8], [0, 1], { clamp: true });
  const [v, setV] = useState(0);
  useMotionValueEvent(p, 'change', setV);
  return (
    <section ref={ref} aria-label="See it in your space" className="relative h-[125vh] md:h-[220vh]">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <ScrollExpandMedia progress={v} mediaType="image"
          mediaSrc="/demo/unit-gloss-1600-v1.webp" bgImageSrc="/demo/tex-slab-v1.webp"
          title="Imagine yours" scrollToExpand="Scroll to see it" textBlend />
        <motion.div className="pointer-events-none absolute inset-x-0 bottom-[9vh] flex flex-col items-center gap-3 px-6 text-center"
          animate={{ opacity: v > 0.92 ? 1 : 0, y: v > 0.92 ? 0 : 20 }} transition={{ duration: 0.5 }}>
          <p className="max-w-[34ch] text-[15px] md:text-[17px]" style={{ color: 'rgba(255,255,255,.88)', textShadow: '0 1px 20px rgba(0,0,0,.6)' }}>
            {onVisualise ? 'Upload a photo of your garage and see it with the floor finished.' : 'Pick a finish and see a real price range in ten seconds.'}
          </p>
          {onVisualise ? (
            <button onClick={onVisualise} className="pointer-events-auto rounded-full px-6 py-3.5 text-[15px] font-semibold shadow-2xl" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
              Visualise your garage
            </button>
          ) : (
            <a href="#price" className="pointer-events-auto rounded-full px-6 py-3.5 text-[15px] font-semibold shadow-2xl" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
              See your price
            </a>
          )}
        </motion.div>
        <span className="ex-tag left-4 top-20">Example image</span>
      </div>
    </section>
  );
}

export function Layers() {
  const { trade } = useSite();
  const layers: Layer[] = trade.layers.map((l) => ({ ...l, tex: TEX[l.key] }));
  const { ref, progress, active } = useLayerScroll(layers.length);
  return (
    <section id="layers" aria-label="The layers" className="relative" style={{ background: 'var(--bg)' }}>
      <div className="section wrap pb-0">
        <p className="eyebrow">What goes into a floor</p>
        <h2 className="h2 mt-4">Five layers.<br /><span className="serif" style={{ color: 'var(--accent2)' }}>Skip one and it fails.</span></h2>
        <p className="lede mt-5">A cheap quote is usually a missing layer. Scroll to take the floor apart.</p>
      </div>
      <div ref={ref} className="relative mx-auto grid max-w-[1240px] gap-0 px-5 md:grid-cols-2 md:gap-14 md:px-16">
        <div className="sticky top-0 z-10 flex h-[44vh] items-center justify-center md:h-screen" style={{ background: 'linear-gradient(var(--bg) 82%, transparent)' }}>
          <LayerStack layers={layers} progress={progress} active={active} />
          <span className="ex-tag bottom-3 right-0 md:bottom-16">Rendered textures</span>
        </div>
        <StackingCards totalCards={layers.length} scaleMultiplier={0.035} className="pb-[12vh] [--card-top:46vh] md:[--card-top:18vh]">
          {layers.map((l, i) => (
            <StackingCardItem key={l.key} index={i} className="h-[27vh] md:h-[60vh]" topPosition={`calc(var(--card-top) + ${i * 12}px)`}>
              <article className="flex h-full max-h-[260px] flex-col justify-between overflow-hidden rounded-[var(--radius)] border p-6 md:max-h-[340px] md:p-8"
                style={{ borderColor: active === i ? 'var(--accent)' : 'var(--line)', background: `linear-gradient(160deg, var(--surface), var(--bg2))`, boxShadow: '0 30px 60px -30px rgba(0,0,0,.7)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[44px] font-semibold leading-none md:text-[64px]" style={{ color: 'var(--accent)' }}>0{i + 1}</span>
                  <span className="h-14 w-14 rounded-full border md:h-16 md:w-16" style={{ backgroundImage: `url(${l.tex})`, backgroundSize: 'cover', borderColor: 'var(--line)' }} />
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
