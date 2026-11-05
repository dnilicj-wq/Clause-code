// Port of larsen66 "animated-sparkline" (21st.dev catalogue). Same geometry, clip-reveal, fade mask, glow and endpoint.
// Changes: NumberFlow -> motion spring number, phosphor arrows -> lucide, Radix green/red -> preset accent / warm red.
import { memo, useEffect, useId, useMemo, type CSSProperties } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/src/lib/cn';

export type SparklineCurve = 'sharp' | 'smooth';
export type SparklinePoint = { label?: string; value: number };
type Pt = { x: number; y: number };

function coords(data: readonly SparklinePoint[], width: number, height: number): Pt[] {
  const vals = data.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const hp = 6, vp = 4, iw = width - hp * 2, ih = height - vp * 2;
  return data.map((p, i) => ({ x: hp + (i / Math.max(data.length - 1, 1)) * iw, y: vp + ih - ((p.value - min) / range) * ih }));
}
const sharp = (pts: readonly Pt[]) => pts.reduce((d, p, i) => `${d} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`, '');
function smooth(pts: readonly Pt[]) {
  if (pts.length <= 2) return sharp(pts);
  return pts.slice(1).reduce((d, p, i) => {
    const prev = pts[i], bp = pts[i - 1] ?? prev, next = pts[i + 2] ?? p;
    const c1 = { x: prev.x + (p.x - bp.x) / 6, y: prev.y + (p.y - bp.y) / 6 };
    const c2 = { x: p.x - (next.x - prev.x) / 6, y: p.y - (next.y - prev.y) / 6 };
    return `${d} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }, `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`);
}
function visible(pts: readonly Pt[], curve: SparklineCurve) {
  if (curve === 'smooth' || pts.length <= 18) return pts as Pt[];
  const step = Math.ceil(pts.length / 18);
  const out = pts.filter((_, i) => i % step === 0);
  const last = pts.at(-1); if (last && out.at(-1) !== last) out.push(last);
  return out;
}

type SparklineProps = {
  ariaLabel?: string; className?: string; color?: string; curve?: SparklineCurve; data: readonly SparklinePoint[];
  duration?: number; glow?: boolean; height?: number; replayKey?: number | string; showEndpoint?: boolean; strokeWidth?: number; width?: number;
};

export const Sparkline = memo(function Sparkline({ ariaLabel = 'Sparkline', className, color = 'currentColor', curve = 'smooth', data, duration = 980, glow = false, height = 72, replayKey = 0, showEndpoint = false, strokeWidth = 2, width = 220 }: SparklineProps) {
  const id = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const dur = reduce ? 0 : duration;
  const pts = useMemo(() => coords(data, width, height), [data, width, height]);
  const vis = useMemo(() => visible(pts, curve), [pts, curve]);
  const path = useMemo(() => (curve === 'smooth' ? smooth(vis) : sharp(vis)), [vis, curve]);
  const last = vis.at(-1);
  const key = `${replayKey}-${dur}`;
  const bleed = glow ? 18 : Math.ceil(strokeWidth / 2);
  const clip = { height: height + bleed * 2, width: width + bleed * 2, x: -bleed, y: -bleed };
  const cap = curve === 'sharp' ? 'butt' : 'round', join = curve === 'sharp' ? 'miter' : 'round';
  return (
    <svg aria-label={ariaLabel} className={cn('block h-auto w-full overflow-visible', className)} key={key} preserveAspectRatio="none" role="img" style={{ color } as CSSProperties} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-fade`} x1="0" x2={width} y1="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" /><stop offset="40%" stopColor="white" stopOpacity="1" /><stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" {...clip}><rect fill={`url(#${id}-fade)`} {...clip} /></mask>
        <clipPath id={`${id}-clip`}>
          <rect key={key} height={clip.height} width={dur > 0 ? 0 : clip.width} x={clip.x} y={clip.y}>
            {dur > 0 ? <animate attributeName="width" calcMode="spline" dur={`${dur}ms`} fill="freeze" from="0" keySplines="0.25 1 0.5 1" keyTimes="0;1" to={clip.width} /> : null}
          </rect>
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`} mask={`url(#${id}-mask)`}>
        {glow && (<>
          <path className="fill-none stroke-current opacity-10 blur-[6px]" d={path} strokeLinecap={cap} strokeLinejoin={join} strokeWidth={strokeWidth + 8} vectorEffect="non-scaling-stroke" />
          <path className="fill-none stroke-current opacity-20 blur-[2px]" d={path} strokeLinecap={cap} strokeLinejoin={join} strokeWidth={strokeWidth + 3} vectorEffect="non-scaling-stroke" />
        </>)}
        <path className="fill-none stroke-current" d={path} strokeLinecap={cap} strokeLinejoin={join} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      </g>
      {showEndpoint && last && (
        <circle className="fill-current [filter:drop-shadow(0_0_5px_currentColor)]" cx={last.x} cy={last.y} key={`${key}-end`} opacity={dur > 0 ? '0' : '1'} r={strokeWidth + 1}>
          {dur > 0 ? <animate attributeName="opacity" dur={`${dur}ms`} fill="freeze" keyTimes="0;0.78;1" values="0;0;1" /> : null}
        </circle>
      )}
    </svg>
  );
});

function SpringNumber({ value, digits = 1, suffix = '' }: { value: number; digits?: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const s = useSpring(0, { stiffness: 120, damping: 22 });
  const txt = useTransform(s, (v) => `${v.toFixed(digits)}${suffix}`);
  useEffect(() => { reduce ? s.jump(value) : s.set(value); }, [value, reduce, s]);
  return <motion.span className="tabular-nums">{txt}</motion.span>;
}

type AnimatedSparklineProps = {
  className?: string; curve?: SparklineCurve; data: readonly { label: string; value: number }[]; height?: number; label?: string;
  replayKey?: number; showValue?: boolean; trendPercent?: number; valueSuffix?: string; valuePrefix?: string; digits?: number;
  goodWhen?: 'up' | 'down'; width?: number; footnote?: string;
  deltaMode?: 'percent' | 'absolute'; sparkClassName?: string;
};

export function AnimatedSparkline({ className, curve = 'smooth', data, height = 72, label = 'Trend', replayKey = 0, showValue = true, trendPercent, valuePrefix = '', valueSuffix = '', digits = 1, goodWhen = 'up', width = 220, footnote, deltaMode = 'percent', sparkClassName }: AnimatedSparklineProps) {
  const first = data[0]?.value ?? 0, last = data.at(-1)?.value ?? first;
  const delta = deltaMode === 'absolute' ? last - first : trendPercent ?? (first === 0 ? 0 : ((last - first) / first) * 100);
  const up = delta >= 0;
  const good = goodWhen === 'up' ? up : !up;
  const c9 = good ? 'var(--accent)' : '#E2553A';
  return (
    <div className={cn('h-max overflow-hidden rounded-[13px] border p-3 shadow-md', className)} style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase leading-none" style={{ color: 'var(--muted)' }}>{label}</p>
          {showValue && <p className="mt-1 text-2xl font-semibold leading-none tabular-nums" style={{ color: 'var(--ink)' }}>{valuePrefix}{last.toFixed(digits)}{valueSuffix}</p>}
        </div>
        <div className="grid grid-cols-[14px_auto] items-center gap-0.5 text-sm font-semibold uppercase leading-none" style={{ color: 'var(--muted)' }}>
          {up ? <ArrowUpRight aria-hidden size={14} strokeWidth={3} style={{ color: c9 }} /> : <ArrowDownLeft aria-hidden size={14} strokeWidth={3} style={{ color: c9 }} />}
          <SpringNumber value={Math.abs(delta)} digits={deltaMode === 'absolute' ? digits : 1} suffix={deltaMode === 'absolute' ? valueSuffix : '%'} />
        </div>
      </div>
      <Sparkline ariaLabel={`${label} ${up ? 'up' : 'down'} ${Math.abs(delta).toFixed(1)} ${deltaMode === 'absolute' ? valueSuffix : 'percent'}`} className={cn('mt-2', sparkClassName)} color={c9} curve={curve} data={data}
        duration={980} glow height={height} key={replayKey} replayKey={replayKey} showEndpoint strokeWidth={2} width={width} />
      {footnote && <p className="mt-2 text-[11px]" style={{ color: 'var(--muted)' }}>{footnote}</p>}
    </div>
  );
}
export default AnimatedSparkline;
