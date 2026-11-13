// Ported from 21st.dev/@kokonutd/components/background-paths (Kokonut UI).
// Source: library-inbox/background-paths.tsx. Changes: framer-motion → motion/react, shadcn Button → plain button,
// colours from preset tokens, path animation pauses offscreen and is static with reduced motion,
// per-path durations fixed per mount (useMemo) instead of re-randomised every render.
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useMemo, useRef, type ReactNode } from 'react';

function FloatingPaths({ position, run }: { position: number; run: boolean }) {
  const paths = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    dur: 20 + Math.random() * 10,
  })), [position]);
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="h-full w-full" viewBox="0 0 696 316" fill="none" style={{ color: 'var(--accent2)' }}>
        <title>Background Paths</title>
        {paths.map((p) => (
          <motion.path key={p.id} d={p.d} stroke="currentColor" strokeWidth={p.width} strokeOpacity={0.1 + p.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={run ? { pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] } : { pathLength: 1, opacity: 0.45 }}
            transition={run ? { duration: p.dur, repeat: Infinity, ease: 'linear' } : { duration: 0 }} />
        ))}
      </svg>
    </div>
  );
}

/** Background only (two mirrored path fields). */
export function PathsField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '100px' });
  const reduced = useReducedMotion();
  const run = inView && !reduced;
  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      <FloatingPaths position={1} run={run} />
      <FloatingPaths position={-1} run={run} />
    </div>
  );
}

/** Full component as in the original: paths + spring-in letter title + glass CTA. */
export function BackgroundPaths({ title = 'Background Paths', cta = 'Discover Excellence', onCta, children, className = '' }: {
  title?: string; cta?: string; onCta?: () => void; children?: ReactNode; className?: string;
}) {
  const words = title.split(' ');
  return (
    <div className={`relative flex min-h-[inherit] w-full items-center justify-center overflow-hidden ${className}`} style={{ background: 'var(--bg)', containerType: 'inline-size' }}>
      <PathsField />
      <div className="relative z-10 mx-auto px-4 text-center md:px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="mx-auto max-w-4xl">
          <h1 className="mb-[clamp(14px,3cqw,32px)] font-display text-[clamp(30px,6.5cqw,96px)] leading-[1.02] font-semibold tracking-tighter">
            {words.map((word, wi) => (
              <span key={wi} className="mr-[.25em] inline-block last:mr-0">
                {word.split('').map((l, li) => (
                  <motion.span key={`${wi}-${li}`} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: wi * 0.1 + li * 0.03, type: 'spring', stiffness: 150, damping: 25 }}
                    className="inline-block bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(90deg, var(--ink), color-mix(in srgb, var(--ink) 80%, transparent))' }}>{l}</motion.span>
                ))}
              </span>
            ))}
          </h1>
          {children}
          {cta && (
            <div className="group relative inline-block overflow-hidden rounded-2xl p-px shadow-lg backdrop-blur-lg transition-shadow duration-300 hover:shadow-xl"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.12), rgba(0,0,0,.12))' }}>
              <button onClick={onCta} className="rounded-[1.15rem] border px-[clamp(18px,2.4cqw,32px)] py-[clamp(10px,1.3cqw,18px)] text-[clamp(14px,1.3cqw,18px)] font-semibold backdrop-blur-md transition-all duration-300 group-hover:-translate-y-0.5"
                style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', color: 'var(--ink)', borderColor: 'var(--line)' }}>
                <span className="opacity-90 group-hover:opacity-100">{cta}</span>
                <span className="ml-3 inline-block opacity-70 transition-all duration-300 group-hover:translate-x-1.5 group-hover:opacity-100">→</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
