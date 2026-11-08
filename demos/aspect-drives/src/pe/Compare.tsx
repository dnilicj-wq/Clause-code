import { useEffect, useRef, useState } from 'react';
import { photoSrc } from '@/config/content';
import { surfaces } from '@/config/driveway';
import { useSite } from '@/src/lib/ctx';
import { useQuote } from './quote';
import { Head } from './ui';

// Drag to compare two of his own finished jobs in different surfaces. No matched before shots were published,
// so this compares finishes, not before/after. Idles with a gentle sweep until touched.
const SIDES = { block: 'block-border', resin: 'resin-border', patio: 'patio-curve' } as const;
const NAMES: Record<string, string> = { block: 'Block paving', resin: 'Resin', patio: 'Patio' };
type K = keyof typeof SIDES;

export function Compare() {
  const { site } = useSite();
  const q = useQuote();
  const [l, setL] = useState<K>('block');
  const [r, setR] = useState<K>('resin');
  const [x, setX] = useState(50);
  const [held, setHeld] = useState(false);
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, vis = false; const t0 = performance.now();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; });
    if (box.current) io.observe(box.current);
    const f = (t: number) => { if (!touched.current && vis) setX(50 + Math.sin((t - t0) / 1400) * 22); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const move = (cx: number) => { const b = box.current!.getBoundingClientRect(); setX(Math.max(2, Math.min(98, ((cx - b.left) / b.width) * 100))); };
  const lab = (k: K) => NAMES[k];
  const pick = (side: 'l' | 'r', k: K) => { touched.current = true; if (side === 'l') { if (k === r) setR(l); setL(k); } else { if (k === l) setL(r); setR(k); } };

  return (
    <section id="compare" aria-labelledby="cmpH" className="section" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <Head id="cmpH" eyebrow="Block, resin or patio?" title="Drag to compare" accent="his real work." lede={`Both sides are ${site.company} jobs. Drag the line, then price the one you like.`} />
        <div ref={box} className="relative mt-8 aspect-[4/3] touch-none select-none overflow-hidden rounded-[var(--radius)] border md:mt-12 md:aspect-[16/8]" style={{ borderColor: 'var(--line)', cursor: 'ew-resize' }}
          onPointerDown={(e) => { touched.current = true; setHeld(true); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); move(e.clientX); }}
          onPointerMove={(e) => { if (held) move(e.clientX); }}
          onPointerUp={() => setHeld(false)} onPointerCancel={() => setHeld(false)}
          role="slider" aria-label="Compare surfaces" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(x)} tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { touched.current = true; setX((v) => Math.max(2, Math.min(98, v + (e.key === 'ArrowLeft' ? -5 : 5)))); } }}>
          <img src={photoSrc(SIDES[r], 1280)} alt={`${lab(r)} driveway by ${site.company}`} loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <img src={photoSrc(SIDES[l], 1280)} alt={`${lab(l)} driveway by ${site.company}`} loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }} />
          <div className="absolute inset-y-0 w-[2px]" style={{ left: `${x}%`, background: '#fff', boxShadow: '0 0 18px rgba(0,0,0,.5)' }}>
            <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[16px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 6px 20px rgba(0,0,0,.45)' }}>↔</span>
          </div>
          <span className="ex-tag left-3 top-3">{lab(l)} · his job</span>
          <span className="ex-tag right-3 top-3">{lab(r)} · his job</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(SIDES) as K[]).map((k) => (
              <button key={k} onClick={() => pick(k === r ? 'r' : 'l', k)} aria-pressed={k === l || k === r}
                className="h-10 rounded-full border px-4 text-[14px] font-medium"
                style={k === l || k === r ? { background: 'rgba(255,255,255,.92)', color: '#111', borderColor: 'transparent' } : { borderColor: 'var(--line)' }}>{lab(k)}</button>
            ))}
          </div>
          <a href="#design" onClick={() => { const k = x < 50 ? r : l; if (surfaces.some((s) => s.key === k)) q.setSurface(k); }} className="flex h-11 items-center rounded-full px-5 text-[15px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
            {(x < 50 ? r : l) === 'patio' ? 'Get a patio quote →' : `Price ${lab(x < 50 ? r : l).toLowerCase()} →`}
          </a>
        </div>
      </div>
    </section>
  );
}
