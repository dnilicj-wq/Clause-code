// Funnel chart. Rebuild of reaviz "Funnel Chart (Big)" from the 21st.dev catalogue: the original wraps the paid-free
// reaviz <FunnelChart> (not a dependency here), so the same look is redrawn in SVG: a mirrored smooth funnel with a
// glow, column axis lines and stage labels, plus a slow sheen so it never sits still. Preset tokens only.
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/cn';

export type FunnelStage = { key: string; data: number };
export type FunnelChartProps = {
  data: FunnelStage[];
  height?: number;
  format?: (v: number) => string;
  className?: string;
  onActive?: (i: number | null) => void;
  /** Most stages shown on narrow widths (< 440px). Extra middle stages are dropped so labels never crowd. */
  narrowMax?: number;
};

function smoothPath(pts: [number, number][]) {
  // Monotone cubic (Fritsch-Carlson): smooth like reaviz's funnel edge, but never overshoots into a pinch
  // when a big drop is followed by a small one.
  const n = pts.length;
  const dx = pts.slice(1).map((p, i) => p[0] - pts[i][0]);
  const sl = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / (dx[i] || 1));
  const m = pts.map((_, i) => (i === 0 ? sl[0] : i === n - 1 ? sl[n - 2] : sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (sl[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / sl[i], b = m[i + 1] / sl[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * sl[i]; m[i + 1] = t * b * sl[i]; }
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C ${pts[i][0] + h} ${pts[i][1] + m[i] * h}, ${pts[i + 1][0] - h} ${pts[i + 1][1] - m[i + 1] * h}, ${pts[i + 1][0]} ${pts[i + 1][1]}`;
  }
  return d;
}

export function FunnelChart({ data: all, height = 250, format = (v) => String(v), className, onActive, narrowMax = 4 }: FunnelChartProps) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const small = W < 560;
  // Narrow screens: keep first and last, evenly sample the middle down to narrowMax. idx maps back to the caller's indices.
  const idx = useMemo(() => {
    const ids = all.map((_, i) => i);
    if (W >= 440 || all.length <= narrowMax) return ids;
    // keep first + last, then the middle stages with the biggest drop into them (the story beats)
    const mid = ids.slice(1, -1).sort((x, y) => (all[y - 1].data - all[y].data) - (all[x - 1].data - all[x].data)).slice(0, narrowMax - 2);
    return [0, ...mid.sort((x, y) => x - y), all.length - 1];
  }, [all, W, narrowMax]);
  const data = useMemo(() => idx.map((i) => all[i]), [idx, all]);
  const H = height, top = small ? 46 : 56, mid = top + (H - top) / 2, maxH = H - top - 10;
  const max = Math.max(...data.map((d) => d.data), 1);
  const n = data.length;
  const colW = W / n;
  const { upper, path } = useMemo(() => {
    // one point at each column's left edge + a final point at the right edge (holding the last value)
    const xs = [...data.map((_, i) => i * colW), W];
    const vs = [...data.map((d) => d.data), data[n - 1].data];
    const hs = vs.map((v) => Math.max(8, (v / max) * maxH));
    const up: [number, number][] = xs.map((x, i) => [x, mid - hs[i] / 2]);
    const lo: [number, number][] = xs.map((x, i) => [x, mid + hs[i] / 2]).reverse() as [number, number][];
    const d = smoothPath(up) + ' L ' + lo[0].join(' ') + smoothPath(lo).replace(/^M [^C]+/, ' ') + ' Z';
    return { upper: up, path: d };
  }, [data, colW, n, max, maxH, mid, W]);
  const set = (i: number | null) => { setActive(i); onActive?.(i == null ? null : idx[i]); };

  return (
    <div ref={ref} className={cn('relative w-full', className)} onPointerLeave={() => set(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block w-full overflow-visible" role="img" aria-label={data.map((d) => `${d.key} ${format(d.data)}`).join(', ')}>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id={`${id}-sheen`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".28" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x={-80} y={-80} width={W + 160} height={H + 160}><feGaussianBlur stdDeviation={small ? 12 : 18} /></filter>
          <clipPath id={`${id}-clip`}><path d={path} /></clipPath>
        </defs>

        <motion.g style={{ originY: `${mid}px`, transformBox: 'view-box' } as any} initial={reduce ? false : { scaleY: 0.04, opacity: 0 }} animate={inView ? { scaleY: 1, opacity: 1 } : {}} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
          <path d={path} fill="var(--accent)" opacity=".45" filter={`url(#${id}-glow)`} />
          <path d={path} fill={`url(#${id}-fill)`} />
          <g clipPath={`url(#${id}-clip)`}>
            {active !== null && <rect x={active * colW} y={0} width={colW} height={H} fill="var(--ink)" opacity=".12" />}
            {!reduce && (
              <motion.rect y={0} height={H} width={W * 0.28} fill={`url(#${id}-sheen)`} initial={{ x: -W * 0.3 }} animate={{ x: W * 1.05 }} transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }} />
            )}
          </g>
        </motion.g>

        {data.map((d, i) => (
          <g key={d.key}>
            {i > 0 && <line x1={i * colW} x2={i * colW} y1={top - 4} y2={H} stroke="var(--line)" strokeWidth="1.5" />}
            <text x={i * colW + (small ? 6 : 14)} y={small ? 16 : 20} fontSize={small ? 15 : 18} fontWeight="700" fill={active === i ? 'var(--ink)' : 'var(--muted)'} style={{ fontFamily: 'var(--font-body)' }}>{format(d.data)}</text>
            <text x={i * colW + (small ? 6 : 14)} y={small ? 34 : 42} fontSize={small ? 11.5 : 14} fill="var(--muted)" style={{ fontFamily: 'var(--font-body)' }}>{d.key}</text>
            <rect x={i * colW} y={0} width={colW} height={H} fill="transparent" onPointerEnter={() => set(i)} onClick={() => set(i)} style={{ cursor: 'pointer' }} />
          </g>
        ))}
        {void upper}
      </svg>
    </div>
  );
}
export default FunnelChart;
