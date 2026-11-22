// Rebuilt; original source not reachable (Motion's "scroll word reveal" example, 21st.dev @motiondotdev).
// Same idea: scroll progress through the block drives each word in turn from blurred, low and faint to sharp.
// Optional scroll `container`; reduced motion shows the text plainly.
import { useRef, type RefObject } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import { cn } from '@/src/lib/cn';

function W({ w, p, a, b, accent }: { w: string; p: MotionValue<number>; a: number; b: number; accent?: boolean }) {
  const opacity = useTransform(p, [a, b], [0.08, 1]);
  const y = useTransform(p, [a, b], ['0.35em', '0em']);
  const blur = useTransform(p, [a, b], [8, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  return <motion.span className="mr-[0.25em] inline-block will-change-transform" style={{ opacity, y, filter, color: accent ? 'var(--accent)' : undefined }}>{w}</motion.span>;
}

export function ScrollWordReveal({ text, accentWords = [], container, className, offset = ['start 0.85', 'end 0.45'] }: {
  text: string; accentWords?: string[]; container?: RefObject<HTMLElement | null>; className?: string; offset?: any;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, container: container as any, offset });
  const words = text.split(' ');
  const cls = cn('font-semibold leading-[1.05] tracking-[-0.025em]', className);
  if (reduce) return <p className={cls} style={{ fontFamily: 'var(--font-display)' }}>{text}</p>;
  const n = words.length;
  return (
    <p ref={ref} className={cn('flex flex-wrap', cls)} style={{ fontFamily: 'var(--font-display)' }} aria-label={text}>
      {words.map((w, i) => {
        const a = (i / n) * 0.85; const b = a + 0.15 + 1 / n;
        return <W key={i} w={w} p={scrollYProgress} a={a} b={Math.min(1, b)} accent={accentWords.includes(w.replace(/[.,!?]/g, ''))} />;
      })}
    </p>
  );
}
