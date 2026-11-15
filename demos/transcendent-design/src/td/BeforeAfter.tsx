import { useEffect, useRef, useState } from 'react';
import { pairs } from './data';

// Real before/after pairs from their site. Drag (or use the slider) to wipe from before to after.
export default function BeforeAfter() {
  const [k, setK] = useState<(typeof pairs)[number]['k']>('wetroom');
  const [p, setP] = useState(0.5);
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const cur = pairs.find((x) => x.k === k)!;

  // first time it's on screen: one slow wipe so phones see what it does
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || touched.current) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        if (touched.current) return;
        const f = Math.min(1, (t - t0) / 2200);
        setP(0.5 + Math.sin(f * Math.PI * 2) * 0.38 * (1 - f * 0.3));
        if (f < 1) raf = requestAnimationFrame(step); else setP(0.5);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(box.current!);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const drag = (e: React.PointerEvent) => {
    if (e.type === 'pointermove' && !e.buttons && e.pointerType !== 'mouse') return;
    touched.current = true;
    const r = box.current!.getBoundingClientRect();
    setP(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };

  return (
    <div className="ba">
      <div className="chips ba-chips" role="radiogroup" aria-label="Job">
        {pairs.map((x) => (
          <button key={x.k} role="radio" aria-checked={k === x.k} className={`chip ${k === x.k ? 'on' : ''}`} onClick={() => { setK(x.k); touched.current = true; }}>{x.label}</button>
        ))}
      </div>
      <div className="ba-stage" ref={box} onPointerDown={drag} onPointerMove={drag} style={{ aspectRatio: `${cur.w} / ${cur.h}` }}>
        <img src={`/client/${cur.after}-sm-v1.webp`} alt={`${cur.label} after: finished by Transcendent Design`} width={760} height={Math.round(760 * cur.h / cur.w)} loading="lazy" draggable={false} />
        <img className="ba-before" src={`/client/${cur.before}-sm-v1.webp`} alt={`${cur.label} before`} width={760} height={Math.round(760 * cur.h / cur.w)} loading="lazy" draggable={false} style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }} />
        <span className="ba-l" aria-hidden="true">Before</span><span className="ba-r" aria-hidden="true">After</span>
        <div className="ba-handle" style={{ left: `${p * 100}%` }} aria-hidden="true"><span /></div>
      </div>
      <input className="range" type="range" min={0} max={100} value={Math.round(p * 100)} aria-label="Before and after" onChange={(e) => { touched.current = true; setP(+e.target.value / 100); }} />
      <p className="ba-say">{cur.say}</p>
      <p className="fine">Their photos, from the {cur.from} on transcendentdesignuk.com.</p>
    </div>
  );
}
