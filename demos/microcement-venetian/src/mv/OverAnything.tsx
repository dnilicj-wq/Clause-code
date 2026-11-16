import { useEffect, useRef, useState } from 'react';

// "Over almost anything": pick a surface, watch one seamless coat flow down over it, then his real photo of that job.
type Item = { k: string; label: string; base: string | null; pattern?: 'tiles' | 'slabs'; after: string; ratio: number; title: string; say: string; quote?: string; who?: string; extra?: string };
const ITEMS: Item[] = [
  { k: 'tiles', label: 'Tiles', base: null, pattern: 'tiles', after: 'wetroom-long', ratio: 0.75, title: 'Straight over the old tiles', say: 'No ripping out. Sound tiles can be coated over and turned into one seamless, grout-free surface.', quote: 'We had micro cement over existing tiles in a wet room. The workmanship was very professional and the floor looks amazing.', who: 'Susan Butcher, Google review' },
  { k: 'wood', label: 'Wooden worktop', base: 'worktop-before', after: 'worktop-after', ratio: 0.75, title: 'Microcement overlay', say: 'Applied over the existing wooden worktops and tiles, plus custom-fitted 30mm MDF worktops with drainer grooves for the utility area.', extra: 'drainer' },
  { k: 'steel', label: 'Steel column', base: 'column-apply', after: 'column-office', ratio: 0.8, title: 'Venetian plaster on steel', say: 'Florenzia Venetian plaster applied to steel columns, polished to a deep green, marbled finish.' },
  { k: 'out', label: 'Outdoor terrace', base: null, pattern: 'slabs', after: 'goring-canopy', ratio: 0.75, title: '150 m², outside', say: '150 m² of Luna microcement applied externally in Goring, near Reading.' },
];

export default function OverAnything() {
  const [i, setI] = useState(0);
  const [p, setP] = useState(0); // 0..1 coat progress, then photo
  const frame = useRef<HTMLDivElement>(null);
  const coat = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const it = ITEMS[i];

  const play = () => {
    const el = coat.current; if (!el) return;
    if (reduce) { el.style.clipPath = 'none'; setP(1); return; }
    setP(0);
    const t0 = performance.now(), D = 1500;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / D); const e = 1 - Math.pow(1 - k, 3);
      const pts: string[] = [];
      for (let x = 0; x <= 20; x++) {
        const fx = x / 20; const y = e * 118 - 12 + Math.sin(fx * 9 + k * 8) * 3.2 * (1 - k) + Math.sin(fx * 23 - k * 5) * 1.2 * (1 - k);
        pts.push(`${(fx * 100).toFixed(1)}% ${Math.max(0, y).toFixed(1)}%`);
      }
      el.style.clipPath = `polygon(0 0, 100% 0, ${pts.reverse().join(', ')})`;
      if (k < 1) requestAnimationFrame(step); else setP(1);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => { if (seen.current) play(); }, [i]);
  useEffect(() => { // auto-demo the first one when it scrolls into view
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !seen.current) { seen.current = true; setTimeout(play, 250); io.disconnect(); } }, { threshold: 0.45 });
    io.observe(frame.current!); return () => io.disconnect();
  }, []);

  // swipe between surfaces on phones
  const sx = useRef<number | null>(null);
  const go = (d: number) => setI((n) => (n + d + ITEMS.length) % ITEMS.length);

  return (
    <div className="over">
      <div className="over-tabs" role="tablist" aria-label="Pick a surface">
        {ITEMS.map((x, n) => (
          <button key={x.k} role="tab" aria-selected={i === n} aria-controls="over-panel" className={`otab ${i === n ? 'on' : ''}`} onClick={() => (i === n ? play() : setI(n))}>{x.label}</button>
        ))}
      </div>
      <div className="over-grid" id="over-panel" role="tabpanel">
        <div className="over-frame" ref={frame} style={{ aspectRatio: String(it.ratio) }}
          onPointerDown={(e) => { sx.current = e.clientX; }} onPointerUp={(e) => { if (sx.current !== null && Math.abs(e.clientX - sx.current) > 50) go(e.clientX < sx.current ? 1 : -1); sx.current = null; }}>
          {it.base
            ? <img key={it.base} className="o-base" src={`/client/${it.base}-sm-v1.webp`} alt={`${it.label} before: one of James’s jobs`} width={760} height={1013} />
            : <div key={it.pattern} className={`o-base o-pat ${it.pattern}`} role="img" aria-label={`Illustration of ${it.label.toLowerCase()}`} />}
          {p < 1 && <span className="tag tl">{it.base ? 'Before · his photo' : 'Illustration'}</span>}
          <div ref={coat} className="o-coat" style={{ clipPath: 'polygon(0 0,100% 0,100% 0,0 0)' }} aria-hidden="true" />
          <img key={it.after} className={`o-after ${p >= 1 ? 'in' : ''}`} src={`/client/${it.after}-sm-v1.webp`} alt={`${it.title}: James’s finished job`} width={760} height={1013} loading="lazy" />
          {p >= 1 && <span className="tag tr">His job · finished</span>}
        </div>
        <div className="over-txt" aria-live="polite">
          <p className="kicker">{String(i + 1).padStart(2, '0')} / {ITEMS.length} · {it.label}</p>
          <h3 className="h3">{it.title}</h3>
          <p>{it.say}</p>
          {it.quote && <blockquote className="mini-q">“{it.quote}”<cite>{it.who}</cite></blockquote>}
          {it.extra && <img className="o-extra" src={`/client/${it.extra}-sm-v1.webp`} alt="The drainer grooves cut into the microcement worktop" width={760} height={1013} loading="lazy" />}
          <div className="over-nav">
            <button className="round" onClick={() => go(-1)} aria-label="Previous surface">←</button>
            <button className="btn btn-ghost sm" onClick={play}>Pour it again</button>
            <button className="round" onClick={() => go(1)} aria-label="Next surface">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
