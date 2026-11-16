// Heat strip: a row of cells coloured by value (cool -> accent -> hot), swept in on view, with a scrub readout.
// Rebuilt in the spirit of @eugeneshilow's Heat Strip; original source not reachable. Preset tokens only.
import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/cn';

export type HeatCell = { v: number; label?: string; phase?: string };
export type HeatStripProps = {
  cells: HeatCell[];
  min: number; max: number;
  format?: (v: number) => string;
  phases?: { from: number; to: number; name: string }[];   // index ranges shown under the strip
  hot?: string;                                              // colour at max (default warm red)
  caption?: string;
  autoplay?: boolean;
  className?: string;
};

const colourFor = (t: number, hot: string) => {
  // 0..0.5: surface -> accent, 0.5..1: accent -> hot
  if (t < 0.5) return `color-mix(in oklab, var(--accent) ${Math.round(t * 200)}%, var(--surface))`;
  return `color-mix(in oklab, ${hot} ${Math.round((t - 0.5) * 200)}%, var(--accent))`;
};

export function HeatStrip({ cells, min, max, format = (v) => String(v), phases = [], hot = '#E2553A', caption, autoplay = true, className }: HeatStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-60px' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(false);
  const [i, setI] = useState(0);
  const [user, setUser] = useState(false);

  useEffect(() => { if (inView) setShown(true); }, [inView]);
  useEffect(() => {
    if (!shown || !autoplay || user || reduce || !inView) return;
    const id = setInterval(() => setI((x) => (x + 1) % cells.length), 380);
    return () => clearInterval(id);
  }, [shown, autoplay, user, reduce, inView, cells.length]);

  const n = cells.length;
  const t = (v: number) => Math.min(1, Math.max(0, (v - min) / (max - min)));
  const cur = cells[i];
  const peak = cells.reduce((a, c) => Math.max(a, c.v), -Infinity);

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>{cur.phase ?? ''}</p>
          <p className="font-display text-4xl font-semibold tabular-nums leading-none" style={{ color: colourFor(t(cur.v), hot) }}>{format(cur.v)}</p>
        </div>
        <p className="text-right text-xs" style={{ color: 'var(--muted)' }}>{cur.label}<br /><span className="tabular-nums">peak {format(peak)}</span></p>
      </div>

      <div className="relative mt-5" onPointerLeave={() => setUser(false)}>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {cells.map((c, k) => (
            <button key={k} aria-label={`${c.label ?? k}: ${format(c.v)}`}
              onPointerEnter={() => { setUser(true); setI(k); }} onFocus={() => { setUser(true); setI(k); }} onClick={() => { setUser(true); setI(k); }}
              className="h-14 rounded-[4px] outline-none transition-[transform,opacity,background-color] duration-500 md:h-16"
              style={{
                background: colourFor(t(c.v), hot),
                opacity: shown ? 1 : 0,
                transform: shown ? `scaleY(${k === i ? 1.12 : 1})` : 'scaleY(.2)',
                transitionDelay: shown && !user ? `${reduce ? 0 : k * 22}ms` : '0ms',
                boxShadow: k === i ? `0 0 0 2px var(--bg), 0 0 0 3px var(--ink)` : 'none',
              }} />
          ))}
        </div>
        {phases.length > 0 && (
          <div className="relative mt-3 h-8">
            {phases.map((p) => (
              <div key={p.name} className="absolute top-0 border-t pt-1.5 text-[11px]" style={{ left: `${(p.from / n) * 100}%`, width: `${((p.to - p.from + 1) / n) * 100}%`, borderColor: 'var(--line)', color: 'var(--muted)' }}>
                <span className="block truncate pr-1">{p.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted)' }}>
        <span>{format(min)}</span>
        <span className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, var(--surface), var(--accent), ${hot})` }} />
        <span>{format(max)}</span>
      </div>
      {caption && <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>{caption}</p>}
    </div>
  );
}
export default HeatStrip;
