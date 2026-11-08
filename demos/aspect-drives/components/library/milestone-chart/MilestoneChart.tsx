// Milestone chart (cure timeline). Rebuilt in the spirit of @f0rextasy's Milestone Chart: a progress rail that
// fills in view and lights each milestone as it passes; tap/hover a milestone to scrub to it.
// Original source not reachable (not in the public catalogue mirrors). Preset tokens only.
import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/cn';

export type Milestone = { at: number; label: string; detail?: string };
export type MilestoneChartProps = {
  milestones: Milestone[];
  max: number;                       // rail end (e.g. 7 days)
  unit?: (n: number) => string;      // tick label
  ticks?: number[];
  title?: string;
  caption?: string;                  // honesty label, always shown
  duration?: number;                 // seconds for the fill
  className?: string;
};

export function MilestoneChart({ milestones, max, unit = (n) => `Day ${n}`, ticks, title, caption, duration = 4.2, className }: MilestoneChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduce = useReducedMotion();
  const p = useMotionValue(0);                       // 0..max
  const [pos, setPos] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);
  useMotionValueEvent(p, 'change', (v) => setPos(v));

  useEffect(() => {
    if (!inView) return;
    if (reduce) { p.set(max); return; }
    const c = animate(p, max, { duration, ease: [0.45, 0, 0.2, 1] });
    return () => c.stop();
  }, [inView, reduce, max, duration, p]);

  const scrub = (i: number) => {
    setFocus(i);
    animate(p, milestones[i].at, { duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] });
  };
  const pct = (n: number) => `${(n / max) * 100}%`;
  const reached = (m: Milestone) => pos >= m.at - 1e-3;
  const active = focus ?? milestones.reduce((a, m, i) => (reached(m) ? i : a), 0);
  const tickList = ticks ?? Array.from({ length: max + 1 }, (_, i) => i);

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {title && <h3 className="font-display text-xl font-semibold">{title}</h3>}

      {/* Desktop: horizontal rail, milestones alternate above/below on stems. Phones: vertical list below. */}
      <div className="relative mt-8 hidden md:block" style={{ height: 196 }}>
        <div className="absolute left-0 right-0 top-[97px] h-[3px] rounded-full" style={{ background: 'var(--line)' }} />
        {tickList.map((t) => (
          <span key={t} className="absolute top-[93px] h-[11px] w-px -translate-x-1/2" style={{ left: pct(t), background: 'var(--line)' }} />
        ))}
        <motion.div className="absolute left-0 top-[97px] h-[3px] rounded-full" style={{ width: pct(pos), background: 'linear-gradient(90deg, color-mix(in oklab, var(--accent) 35%, transparent), var(--accent))', boxShadow: '0 0 16px color-mix(in oklab, var(--accent) 55%, transparent)' }} />
        {milestones.map((m, i) => {
          const on = reached(m);
          const up = i % 2 === 0;
          const f = m.at / max;
          const align = f > 0.88 ? 'right' : f < 0.08 ? 'left' : 'center';
          const shift = align === 'right' ? '-100%' : align === 'left' ? '0%' : '-50%';
          return (
            <button key={m.label} onMouseEnter={() => scrub(i)} onFocus={() => scrub(i)} onClick={() => scrub(i)}
              className="absolute top-0 h-full w-0 outline-none" style={{ left: pct(m.at) }} aria-label={`${unit(m.at)}, ${m.label}. ${m.detail ?? ''}`}>
              <span className="absolute left-0 w-px -translate-x-1/2 transition-colors duration-300" style={{ top: up ? 46 : 104, height: 44, background: on ? 'color-mix(in oklab, var(--accent) 60%, transparent)' : 'var(--line)' }} />
              <span className="absolute left-0 top-[92px] h-[13px] w-[13px] rounded-full border-2 transition-all duration-300"
                style={{ background: on ? 'var(--accent)' : 'var(--bg)', borderColor: on ? 'var(--accent)' : 'var(--line)', transform: `translateX(-50%) scale(${active === i ? 1.35 : 1})`, boxShadow: active === i && on ? '0 0 0 6px color-mix(in oklab, var(--accent) 18%, transparent)' : 'none' }} />
              <span className={cn('absolute left-0 whitespace-nowrap', align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center')}
                style={{ top: up ? 0 : 152, transform: `translateX(${shift})` }}>
                <span className="block text-[11px] uppercase tracking-wider tabular-nums transition-colors duration-300" style={{ color: on ? 'var(--accent)' : 'var(--muted)' }}>{unit(m.at)}</span>
                <span className="block text-sm font-semibold transition-colors duration-300" style={{ color: on ? 'var(--ink)' : 'var(--muted)' }}>{m.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      <motion.p key={active} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 hidden min-h-[22px] text-sm md:block" style={{ color: 'var(--muted)' }}>
        <span style={{ color: 'var(--accent)' }}>{unit(milestones[active].at)}</span> · {milestones[active].detail}
      </motion.p>

      <ol className="relative mt-6 md:hidden">
        <div className="absolute bottom-2 left-[7px] top-2 w-[3px] rounded-full" style={{ background: 'var(--line)' }} />
        <motion.div className="absolute left-[7px] top-2 w-[3px] rounded-full" style={{ height: `calc(${pct(pos)} - 16px)`, background: 'var(--accent)', boxShadow: '0 0 14px color-mix(in oklab, var(--accent) 55%, transparent)' }} />
        {milestones.map((m, i) => {
          const on = reached(m);
          return (
            <li key={m.label} className="relative flex gap-4 pb-5 last:pb-0" onClick={() => scrub(i)}>
              <span className="relative z-10 mt-1 h-[17px] w-[17px] shrink-0 rounded-full border-2 transition-colors duration-300" style={{ borderColor: on ? 'var(--accent)' : 'var(--line)', background: on ? 'var(--accent)' : 'var(--bg)' }} />
              <div>
                <p className="text-[11px] uppercase tracking-wider tabular-nums" style={{ color: on ? 'var(--accent)' : 'var(--muted)' }}>{unit(m.at)}</p>
                <p className="text-sm font-semibold transition-colors duration-300" style={{ color: on ? 'var(--ink)' : 'var(--muted)' }}>{m.label}</p>
                {m.detail && <p className="text-xs" style={{ color: 'var(--muted)' }}>{m.detail}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {caption && <p className="mt-5 text-xs" style={{ color: 'var(--muted)' }}>{caption}</p>}
    </div>
  );
}
export default MilestoneChart;
