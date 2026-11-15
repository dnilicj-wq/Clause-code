// Port of 21st.dev Horizontal Scroll Carousel (@uniquesonu). Sticky stage + scroll-linked x translate (1% → -95%) and
// hover zoom are verbatim. Changes: cards via props, optional `scroller` (scroll box instead of the window) and
// `height`/`stage` sizes so it fits a section or lab card, preset tokens, optional corner label, motion/react.
import { motion, useTransform, useScroll } from 'motion/react';
import { useRef, type RefObject } from 'react';

export type HScrollCard = { id: string | number; title: string; url: string };

export function HorizontalScrollCarousel({
  cards, scroller, height = '300vh', stage = '100vh', cardSize = 'clamp(240px, 32vw, 450px)', label, endX = '-95%',
}: {
  cards: HScrollCard[]; scroller?: RefObject<HTMLElement | null>; height?: string; stage?: string;
  cardSize?: string; label?: string; endX?: string;
}) {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, ...(scroller ? { container: scroller } : {}) });
  const x = useTransform(scrollYProgress, [0, 1], ['1%', endX]);

  return (
    <section ref={targetRef} className="relative bg-bg2" style={{ height }}>
      <div className="sticky top-0 flex items-center overflow-hidden" style={{ height: stage }}>
        {label && <span className="absolute left-3 top-3 z-20 rounded bg-black/55 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">{label}</span>}
        <motion.div style={{ x }} className="flex gap-4">
          {cards.map((card) => <Card card={card} size={cardSize} key={card.id} />)}
        </motion.div>
      </div>
    </section>
  );
}

function Card({ card, size }: { card: HScrollCard; size: string }) {
  return (
    <div className="group relative shrink-0 overflow-hidden rounded-[var(--radius)] bg-surface" style={{ width: size, height: size, containerType: 'inline-size' }}>
      <div style={{ backgroundImage: `url(${card.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 z-10 grid place-items-center bg-black/15 p-4">
        <p className="h-fit w-fit bg-gradient-to-br from-white/20 to-white/0 px-[7cqw] py-[5cqw] text-center text-[clamp(18px,11cqw,56px)] font-black uppercase leading-none text-white backdrop-blur-lg"
          style={{ fontFamily: 'var(--font-display)', textShadow: '0 1px 12px rgba(0,0,0,.35)' }}>
          {card.title}
        </p>
      </div>
    </div>
  );
}

export default HorizontalScrollCarousel;
