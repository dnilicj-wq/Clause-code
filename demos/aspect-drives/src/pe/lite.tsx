import { useEffect, useRef, useState } from 'react';

// Motion-free bits for the first chunk (hero), so the animation library loads with the sections below.
export function CutReveal({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, wi, arr) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap" style={wi < arr.length - 1 ? { marginRight: '.27em' } : undefined}>
          {[...w].map((c, ci) => {
            const n = arr.slice(0, wi).join('').length + ci;
            return <span key={ci} className="inline-block overflow-hidden align-bottom"><span className="pe-cut inline-block" style={{ animationDelay: `${delay + n * 0.018}s` }}>{c}</span></span>;
          })}
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

export function Mark({ size = 30 }: { size?: number }) {
  return <img src="/brand/mark-v2.webp" width={size} height={Math.round(size * 1.04)} alt="" aria-hidden className="block" style={{ width: size, height: 'auto' }} />;
}
