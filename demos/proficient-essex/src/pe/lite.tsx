import { useEffect, useRef, useState } from 'react';

// Motion-free bits for the first chunk (hero), so the animation library loads with the sections below.
export function CutReveal({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, wi, arr) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {[...w].map((c, ci) => {
            const n = arr.slice(0, wi).join('').length + ci;
            return <span key={ci} className="inline-block overflow-hidden align-bottom"><span className="pe-cut inline-block" style={{ animationDelay: `${delay + n * 0.018}s` }}>{c}</span></span>;
          })}
          {wi < arr.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}

export function Ticker({ value }: { value: number }) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const a = from.current, t0 = performance.now(); let raf = 0;
    const f = (t: number) => {
      const k = Math.min(1, (t - t0) / 650), e = 1 - Math.pow(1 - k, 3);
      const x = Math.round(a + (value - a) * e); setV(x); from.current = x;
      if (k < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{v.toLocaleString('en-GB')}</span>;
}

export function Stars({ size = 14, n = 5 }: { size?: number; n?: number }) {
  return (
    <span className="inline-flex gap-[2px]" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.5 6 .7-4.4 4.1 1.1 6L10 14.9 4.7 17.8l1.1-6L1.4 7.7l6-.7z" fill="#F5B83D" /></svg>
      ))}
    </span>
  );
}

// Their house-and-drive mark, redrawn as vector strokes from the logo on proficientessex.co.uk.
export const MARK_PATHS = ['M42 236 V114 L133 52 L226 114 V236 Z', 'M133 236 V162', 'M276 180 C 332 176, 364 210, 356 250 C 349 286, 318 303, 282 303 L 146 306 C 113 308, 96 331, 96 364 L 96 410'];
export function Mark({ size = 30, id = 'mk' }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={Math.round(size * 1.04)} viewBox="0 0 400 416" fill="none" aria-hidden className="block">
      <defs><linearGradient id={id} x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stopColor="#FFF1C8" /><stop offset=".42" stopColor="#C9A961" /><stop offset=".72" stopColor="#8E6D35" /><stop offset="1" stopColor="#E6D3A2" /></linearGradient></defs>
      <g stroke={`url(#${id})`} strokeWidth="26" strokeLinejoin="miter">{MARK_PATHS.map((d) => <path key={d} d={d} />)}</g>
    </svg>
  );
}
