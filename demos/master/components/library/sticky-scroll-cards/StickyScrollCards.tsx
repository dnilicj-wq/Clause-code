// Ported from https://21st.dev/@thanh/components/sticky-scroll-cards-section (minhxthanh) — copy: https://raw.githubusercontent.com/Deepender25/21st.dev-Component-Skill-/3de21651777d1c23cb2deed3a0ffc978c4270259/components/minhxthanh/sticky-scroll-cards-section.tsx
// Same motion as the original: header + intro fade/rise in on view (IntersectionObserver, 700ms ease-out, 200ms stagger),
// cards are position:sticky at one shared top offset so each new card slides up and covers the last.
// Changes: content via props (original hard-codes 4 SaaS cards + Unsplash images); yellow/amber/orange classes → preset
// tokens (each card a deeper accent tint, like the original's yellow→amber→orange ramp); optional scroll `container`
// for the observer root (lab card); reduced motion skips the fade.
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

export type StickyCard = { title: string; description: ReactNode; image: string; imageAlt?: string; tag?: string; kicker?: string };

function useInView(root?: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { root: root?.current ?? null, rootMargin: '0px', threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, [root]);
  return [ref, inView] as const;
}

const rise = (on: boolean) => `transition-all duration-700 ease-out motion-reduce:transition-none ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;

export function StickyScrollCards({
  heading, intro, cards, top = 120, container, className = '',
}: {
  heading: ReactNode; intro?: ReactNode; cards: StickyCard[]; top?: number | string;
  container?: RefObject<HTMLElement | null>; className?: string;
}) {
  const [hRef, hIn] = useInView(container);
  const [pRef, pIn] = useInView(container);
  return (
    <div className={className} style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <div className="px-[5%]">
        <div className="mx-auto max-w-7xl">
          <section className="flex flex-col items-center py-24 md:py-40">
            <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
              <h2 ref={hRef as any} className={`text-[clamp(32px,5vw,56px)] font-semibold leading-[1.02] tracking-tight ${rise(hIn)}`} style={{ fontFamily: 'var(--font-display)' }}>{heading}</h2>
              {intro && <p ref={pRef as any} className={`mt-4 text-[17px] delay-200 md:text-lg ${rise(pIn)}`} style={{ color: 'var(--muted)' }}>{intro}</p>}
            </div>
            <div className="w-full">
              {cards.map((c, i) => {
                const tint = 10 + Math.round((i / Math.max(1, cards.length - 1)) * 16); // 10% → 26% accent, like the yellow→orange ramp
                return (
                  <div key={i} className="sticky mb-10 grid grid-cols-1 items-center gap-5 overflow-hidden rounded-[var(--radius)] border p-6 md:mb-16 md:grid-cols-2 md:gap-10 md:p-12"
                    style={{ top, borderColor: 'var(--line)', background: `color-mix(in oklab, var(--accent) ${tint}%, var(--surface))`, boxShadow: '0 -18px 40px -24px rgba(0,0,0,.45)' }}>
                    <div className="flex flex-col justify-center">
                      {c.kicker && <span className="mb-3 font-display text-[13px] uppercase tracking-[.16em]" style={{ color: 'var(--accent)' }}>{c.kicker}</span>}
                      <h3 className="mb-3 text-2xl font-semibold md:mb-4 md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>{c.title}</h3>
                      <div className="text-[15.5px] leading-relaxed md:text-[17px]" style={{ color: 'color-mix(in oklab, var(--ink) 78%, var(--muted))' }}>{c.description}</div>
                    </div>
                    <div className="relative">
                      <img src={c.image} alt={c.imageAlt ?? c.title} loading="lazy" className="aspect-[16/10] w-full rounded-[calc(var(--radius)*.6)] object-cover shadow-lg md:aspect-[4/3]" />
                      {c.tag && <span className="ex-tag left-3 top-3">{c.tag}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default StickyScrollCards;
