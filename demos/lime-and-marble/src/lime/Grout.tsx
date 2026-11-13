import { useEffect, useRef, useState } from 'react';

// "Lose the grout": a tiled shower wall; drag and one seamless microcement skin flows over the tiles.
// Illustration (drawn, not a photo). Facts in the caption are from their microcement page.
const FIN = [
  { k: 'matte', label: 'Matte' },
  { k: 'satin', label: 'Satin' },
  { k: 'gloss', label: 'High gloss' },
] as const;

export default function Grout() {
  const box = useRef<HTMLDivElement>(null);
  const skin = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0.18);
  const [fin, setFin] = useState<(typeof FIN)[number]['k']>('satin');
  const touched = useRef(false);
  const pr = useRef(p);
  pr.current = p;

  // wavy leading edge, gently alive while on screen
  useEffect(() => {
    let raf = 0, vis = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const draw = (t: number) => {
      const el = skin.current; if (!el) return;
      const x = pr.current * 112 - 6; const pts: string[] = ['0% 0%'];
      for (let i = 0; i <= 24; i++) {
        const y = (i / 24) * 100;
        const w = reduce ? 0 : Math.sin(i * 0.9 + t * 0.0016) * 1.6 + Math.sin(i * 0.37 - t * 0.0011) * 2.2;
        pts.push(`${Math.max(0, x + w).toFixed(2)}% ${y.toFixed(2)}%`);
      }
      pts.push('0% 100%');
      el.style.clipPath = `polygon(${pts.join(',')})`;
      if (vis && !reduce) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      if (vis) {
        raf = requestAnimationFrame(draw);
        // phones / first view: auto demo once, unless someone already dragged
        if (!touched.current) {
          touched.current = true;
          const t0 = performance.now(); const from = pr.current;
          const run = (now: number) => {
            const k = Math.min(1, (now - t0) / (reduce ? 1 : 2400)); const e2 = 1 - Math.pow(1 - k, 3);
            setP(from + (0.86 - from) * e2); if (k < 1) requestAnimationFrame(run);
          };
          setTimeout(() => requestAnimationFrame(run), 350);
        }
      } else cancelAnimationFrame(raf);
    }, { threshold: 0.45 });
    if (box.current) io.observe(box.current);
    draw(0);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const drag = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && !e.buttons) return;
    const r = box.current!.getBoundingClientRect();
    touched.current = true;
    setP(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };

  return (
    <div className="grout">
      <div ref={box} className={`grout-stage fin-${fin}`} onPointerDown={drag} onPointerMove={drag}>
        <svg className="tiles" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id="metro" width="60" height="30" patternUnits="userSpaceOnUse">
              <rect width="60" height="30" fill="#C9CFCF" />
              <rect x="1.5" y="1.5" width="57" height="27" rx="2" fill="url(#tileG)" />
              <rect x="-28.5" y="16.5" width="57" height="27" rx="2" fill="url(#tileG)" />
            </pattern>
            <linearGradient id="tileG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F7F8F6" /><stop offset=".6" stopColor="#E9ECEA" /><stop offset="1" stopColor="#DCE1DF" />
            </linearGradient>
            <pattern id="metro2" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="url(#metro)" />
              <rect x="0" y="30" width="60" height="30" fill="url(#metro)" transform="translate(30 0)" />
            </pattern>
          </defs>
          <rect width="400" height="500" fill="url(#metro2)" />
        </svg>
        <div ref={skin} className="skin" aria-hidden="true">
          <i className="skin-sheen" />
        </div>
        <svg className="fixtures" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" stroke="#2B2A27" strokeWidth="5" strokeLinecap="round">
            <path d="M300 40 V120 Q300 140 280 140 H246" />
          </g>
          <ellipse cx="236" cy="140" rx="34" ry="8" fill="#2B2A27" />
          <circle cx="300" cy="290" r="22" fill="#2B2A27" /><circle cx="300" cy="290" r="9" fill="#5A5852" />
          <rect x="296" y="268" width="8" height="12" rx="3" fill="#8F8C84" />
        </svg>
        <div className="grout-handle" style={{ left: `${p * 100}%` }} aria-hidden="true"><span /></div>
        <span className="tag tag-light">Illustration</span>
      </div>
      <div className="grout-ui">
        <label className="sr-only" htmlFor="grout-range">Cover the tiles</label>
        <input id="grout-range" type="range" min={0} max={100} value={Math.round(p * 100)}
          onChange={(e) => { touched.current = true; setP(+e.target.value / 100); }} className="range" />
        <div className="chips" role="radiogroup" aria-label="Finish">
          {FIN.map((f) => (
            <button key={f.k} role="radio" aria-checked={fin === f.k} className={`chip ${fin === f.k ? 'on' : ''}`} onClick={() => setFin(f.k)}>{f.label}</button>
          ))}
        </div>
      </div>
      <p className="grout-cap">Goes straight over your existing tiles. No rip-out. No grout to scrub.</p>
    </div>
  );
}
