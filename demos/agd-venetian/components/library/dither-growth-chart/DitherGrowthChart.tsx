// Port of Subhan-code "DitherGrowthChart" (Monocharts, MIT; listed on 21st.dev by @su2491251).
// Same canvas dither fill, shimmer, pointer glow, range morph, spring scrubber + tooltip.
// Changes: data/ranges/labels come in as props; colours read from preset CSS vars at draw time (no hard-coded blue/white).
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useCanvasSetup } from './useCanvasSetup';

const smoothstep = (a: number, b: number, v: number) => { const x = Math.max(0, Math.min(1, (v - a) / (b - a))); return x * x * (3 - 2 * x); };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export type DitherRange = { name: string; data: number[]; labels: string[] };
export type DitherGrowthChartProps = {
  ranges: DitherRange[];
  defaultRange?: number;
  headline: (last: number) => string;       // big animated number text
  subtitle: string;
  badge?: ReactNode;
  tooltip: (v: number, label: string) => string;
  yMax?: number;                            // fixed scale (e.g. 100 for %)
  yFormat?: (v: number) => string;
  icon?: ReactNode;
  caption?: string;
};

function AnimatedText({ value, fmt }: { value: number; fmt: (v: number) => string }) {
  const reduce = useReducedMotion();
  const s = useSpring(value, { stiffness: 190, damping: 27, mass: 0.7 });
  const d = useTransform(s, (c) => fmt(c));
  useEffect(() => { reduce ? s.jump(value) : s.set(value); }, [value, s, reduce]);
  return <motion.span className="tabular-nums">{d}</motion.span>;
}

const readVar = (el: Element, name: string, fb: string) => getComputedStyle(el).getPropertyValue(name).trim() || fb;

export function DitherGrowthChart({ ranges, defaultRange = 0, headline, subtitle, badge, tooltip, yMax, yFormat = (v) => String(Math.round(v)), icon, caption }: DitherGrowthChartProps) {
  const [ri, setRi] = useState(defaultRange);
  const { canvasRef, rect, isVisible, reducedMotion } = useCanvasSetup();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const range = ranges[ri];
  const [scrub, setScrub] = useState<number | null>(null);
  const tx = useSpring(0, { stiffness: 650, damping: 42, mass: 0.5 });
  const ty = useSpring(0, { stiffness: 650, damping: 42, mass: 0.5 });

  const { data, maxVal } = useMemo(() => ({ data: range.data, maxVal: yMax ?? Math.max(3, ...range.data) }), [range, yMax]);
  const timeRef = useRef(0);
  const raf = useRef<number>(0);
  const ptr = useRef({ x: -100, y: -100 });
  const ptrOn = useRef(false);
  const fromD = useRef([...data]); const fromM = useRef(maxVal);
  const toD = useRef([...data]); const toM = useRef(maxVal);
  const t0 = useRef(0);
  const colours = useRef({ fill: '#fff', faint: 'rgba(255,255,255,.03)' });

  useEffect(() => {
    // Grow in from zero on first mount, then morph between ranges.
    fromD.current = t0.current === 0 ? data.map(() => 0) : toD.current.slice();
    fromM.current = toM.current;
    toD.current = [...data]; toM.current = maxVal;
    if (fromD.current.length !== toD.current.length) {
      const len = toD.current.length, old = fromD.current;
      fromD.current = Array.from({ length: len }, (_, i) => old[Math.round((i / (len - 1)) * (old.length - 1))]);
    }
    t0.current = performance.now();
  }, [data, maxVal]);

  useEffect(() => {
    const el = wrapperRef.current; if (!el) return;
    const sync = () => {
      const ink = readVar(el, '--ink', '#fff');
      colours.current = { fill: readVar(el, '--accent', '#fff'), faint: `color-mix(in srgb, ${ink} 5%, transparent)` };
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const draw = () => {
      if (!isVisible.current) { raf.current = requestAnimationFrame(draw); return; }
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const { width: w, height: h } = rect.current;
      if (!w || !h) { raf.current = requestAnimationFrame(draw); return; }
      timeRef.current += reducedMotion ? 0 : 0.03;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cell = Math.max(3, Math.round(w / 180));
      ctx.save(); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.scale(dpr, dpr);
      const prog = reducedMotion ? 1 : Math.min(1, (performance.now() - t0.current) / 700);
      const e = 1 - Math.pow(1 - prog, 3);
      const curMax = fromM.current + (toM.current - fromM.current) * e;
      const cur = toD.current.map((v, i) => fromD.current[i] + (v - fromD.current[i]) * e);
      const { x: px, y: py } = ptr.current; const on = ptrOn.current; const t2 = timeRef.current;
      const faint = colours.current.faint;
      for (let x = 0; x < w; x += cell) {
        const ex = (x / w) * (cur.length - 1); const i0 = Math.floor(ex); const i1 = Math.min(i0 + 1, cur.length - 1);
        const val = cur[i0] + (cur[i1] - cur[i0]) * (ex - i0);
        const plotH = h - 0.16 * h; const cy = h - plotH * (val / curMax);
        for (let y = h; y >= 0; y -= cell) {
          ctx.fillStyle = faint; ctx.fillRect(x + 1, y + 1, cell - 1, cell - 1);
          if (y < cy) continue;
          const dist = Math.hypot(x - px, y - py);
          const glow = on && !reducedMotion ? 1 - smoothstep(0, h * 0.35, dist) : 0;
          const shimmer = reducedMotion ? 0 : Math.sin(y * 0.1 - t2 * 2) * 0.07;
          const depth = 1 - ((y - cy) / Math.max(1, h - cy)) * 0.25;          // slightly brighter near the curve
          ctx.fillStyle = colours.current.fill;
          const sz = cell * (0.7 + shimmer + glow * 0.3);
          ctx.globalAlpha = Math.min(1, (0.62 + glow * 0.38) * depth + 0.08);
          const o = (cell - sz) / 2; ctx.fillRect(x + o, y + o, sz, sz); ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [reducedMotion, canvasRef, rect, isVisible]);

  const onPtr = (e: React.PointerEvent) => {
    const wr = wrapperRef.current; if (!wr) return;
    const r = wr.getBoundingClientRect(); const x = e.clientX - r.left; const y = e.clientY - r.top;
    ptr.current = { x, y }; ptrOn.current = true;
    const { width: w, height: h } = rect.current;
    const idx = Math.round(clamp(x / w, 0, 1) * (data.length - 1)); setScrub(idx);
    tx.set((data.length > 1 ? idx / (data.length - 1) : 0.5) * w);
    ty.set(h - (h - 0.16 * h) * (data[idx] / maxVal));
  };
  const off = () => { ptrOn.current = false; setScrub(null); };
  const xPos = useTransform(tx, (x) => `${x}px`); const yPos = useTransform(ty, (y) => `${y}px`);
  const ticks = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];
  const L = range.labels; const dl = [L[0], L[Math.floor(L.length * 0.25)], L[Math.floor(L.length * 0.5)], L[Math.floor(L.length * 0.75)], L[L.length - 1]];
  const last = data[data.length - 1];

  return (
    <div className="relative w-full rounded-3xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {icon && <div className="rounded-2xl p-2.5" style={{ background: 'color-mix(in oklab, var(--accent) 14%, transparent)', color: 'var(--accent)' }}>{icon}</div>}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight"><AnimatedText value={last} fmt={headline} /></span>
              {badge && <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>{badge}</span>}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center rounded-full border p-1 text-xs font-medium" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}>
          {ranges.map((r, i) => (
            <button key={r.name} onClick={() => setRi(i)} className="cursor-pointer rounded-full px-3 py-1 transition-all"
              style={ri === i ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : { color: 'var(--muted)' }}>{r.name}</button>
          ))}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="relative h-[180px] w-8 shrink-0">
          {ticks.map((t, i) => (
            <span key={i} className="absolute right-0 font-mono text-[10px]" style={{ top: `${(0.16 + (i / 3) * 0.84) * 100}%`, transform: 'translateY(-50%)', color: 'var(--muted)' }}>{yFormat(t)}</span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={wrapperRef} className="relative h-[180px] cursor-crosshair touch-none overflow-hidden rounded-xl" onPointerMove={onPtr} onPointerDown={onPtr} onPointerLeave={off}>
            <div className="pointer-events-none absolute inset-0 border-b border-t border-dashed" style={{ borderColor: 'var(--line)' }} />
            <canvas ref={canvasRef} className="block h-full w-full" />
            {scrub !== null && (<>
              <motion.div className="pointer-events-none absolute bottom-0 top-0 z-10 w-px" style={{ left: xPos, background: 'var(--ink)', opacity: 0.6 }} />
              <motion.div className="pointer-events-none absolute z-20 -ml-[6px] -mt-[6px] h-3 w-3 rounded-full border-2 shadow-lg" style={{ left: xPos, top: yPos, background: 'var(--accent)', borderColor: 'var(--ink)' }} />
              <motion.div className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-xl"
                style={{ left: xPos, top: yPos, background: 'var(--bg)', borderColor: 'var(--line)' }}>
                <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>{L[scrub]}</div>
                <div>{tooltip(data[scrub], L[scrub])}</div>
              </motion.div>
            </>)}
          </div>
          <div className="mt-2 flex items-center justify-between whitespace-nowrap px-1 font-mono text-[10px] opacity-60">{dl.map((l, i) => <span key={i} className={i % 2 ? 'max-sm:hidden' : ''}>{l}</span>)}</div>
        </div>
      </div>
      {caption && <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>{caption}</p>}
    </div>
  );
}
export default DitherGrowthChart;
