// Port of Hirael "comparison-03" by Mohammad Shehadeh (MIT), widened from 2 panels to N (system types).
// Same structure: eyebrow + serif heading, hairline-divided panels, segmented switch on phones, footer row with CTA.
// tw-animate enter classes replaced with motion; colours read preset tokens only.
import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check, CircleAlert, CircleCheck, X } from 'lucide-react';
import { cn } from '@/src/lib/cn';

export type ComparisonProps = {
  eyebrow?: string;
  heading: ReactNode;
  cols: string[];               // first column is the recommended one
  short?: string[];             // shorter labels for the phone switch
  rows: string[][];             // [label, col1, col2, ...]
  note?: string;
  cta?: { label: string; href: string };
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Comparison03({ eyebrow = 'Side by side', heading, cols, short, rows, note, cta, className, bare = false }: ComparisonProps & { bare?: boolean }) {
  const [view, setView] = useState(0);
  const reduce = useReducedMotion();
  const enter = (i: number) => (reduce ? {} : {
    initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, ease, delay: i * 0.06 },
  });
  return (
    <section data-slot="comparison" className={cn('w-full', className)} aria-labelledby={bare ? undefined : "comparison-03-heading"}>
      {!bare && <div className="max-w-2xl">
        <motion.p {...enter(0)} className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>{eyebrow}</motion.p>
        <motion.h2 {...enter(1)} id="comparison-03-heading" className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>{heading}</motion.h2>
      </div>}

      <motion.div {...enter(2)} role="tablist" aria-label="Show" className="mt-8 flex w-full rounded-[calc(var(--radius)*.5)] border p-1 md:hidden" style={{ borderColor: 'var(--line)' }}>
        {cols.map((c, i) => (
          <button key={c} role="tab" aria-selected={view === i} onClick={() => setView(i)}
            className="flex-1 rounded-[calc(var(--radius)*.35)] px-2 py-2 text-xs font-medium leading-tight transition-colors"
            style={view === i ? { background: i === 0 ? 'var(--accent)' : 'var(--surface)', color: i === 0 ? 'var(--accent-ink)' : 'var(--ink)' } : { color: 'var(--muted)' }}>
            {short?.[i] ?? c}
          </button>
        ))}
      </motion.div>

      <motion.div {...enter(3)} data-slot="comparison-panels"
        className="mt-4 grid gap-px overflow-hidden rounded-[calc(var(--radius)*.5)] border md:mt-10"
        style={{ borderColor: 'var(--line)', background: 'var(--line)', gridTemplateColumns: `repeat(var(--cols), minmax(0, 1fr))`, ['--cols' as any]: 1 }}>
        <style>{`@media (min-width: 768px){[data-slot="comparison-panels"]{--cols:${cols.length}!important}}`}</style>
        {cols.map((c, ci) => {
          const best = ci === 0;
          return (
            <div key={c} data-slot={best ? 'comparison-after' : 'comparison-before'} className={cn('p-7 sm:p-8 md:block', view === ci ? 'block' : 'hidden')}
              style={{ background: best ? 'var(--surface)' : 'var(--bg)' }}>
              <motion.div key={view} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease }}>
                <div className="flex items-center gap-2">
                  {best ? <CircleCheck aria-hidden className="size-4" style={{ color: 'var(--accent)' }} /> : <CircleAlert aria-hidden className="size-4" style={{ color: 'var(--muted)' }} />}
                  <h3 className="text-xs uppercase tracking-[0.12em]" style={{ color: best ? 'var(--ink)' : 'var(--muted)' }}>{c}</h3>
                </div>
                <ul className="mt-6 flex flex-col gap-4">
                  {rows.map((r) => (
                    <li key={r[0]} className="flex gap-3 text-sm" style={{ color: best ? 'var(--ink)' : 'var(--muted)' }}>
                      {best ? <Check aria-hidden className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--accent)' }} /> : <X aria-hidden className="mt-0.5 size-4 shrink-0" />}
                      <span><span className="block text-[11px] uppercase tracking-wider opacity-70">{r[0]}</span>{r[ci + 1]}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      <motion.div {...enter(4)} className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        {note && <p className="text-xs" style={{ color: 'var(--muted)' }}>{note}</p>}
        {cta && (
          <a href={cta.href} className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface)]" style={{ borderColor: 'var(--line)' }}>
            {cta.label}
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </a>
        )}
      </motion.div>
    </section>
  );
}
export default Comparison03;
