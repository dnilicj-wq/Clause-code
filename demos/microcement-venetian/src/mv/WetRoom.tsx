import { useEffect, useRef, useState } from 'react';

// Pinned scroll: an ordinary bathroom becomes a seamless wet room, in four stages, on his own photos.
const STAGES = [
  { n: '01', t: 'Prepped', d: 'The old surface is checked, cleaned and prepared. Sound tiles can often stay where they are.', img: 'bath-stage1' },
  { n: '02', t: 'Coated straight over', d: 'Thin coats of microcement go on by hand, walls and floor, over what’s already there.', img: 'bath-stage2' },
  { n: '03', t: 'Seamless walls and floor', d: 'No grout lines, no joins, no edges for water or dirt to find. Just one surface.', img: 'bath-finished' },
  { n: '04', t: 'Water runs off', d: 'Waterproof and made for wet areas. The shower water goes where it should, and nowhere else.', img: 'wetroom-long' },
];

export default function WetRoom() {
  const wrap = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  useEffect(() => {
    const el = wrap.current!; let raf = 0;
    const on = () => {
      if (raf) return; raf = requestAnimationFrame(() => {
        raf = 0; const r = el.getBoundingClientRect(); const span = r.height - innerHeight;
        const k = Math.min(0.999, Math.max(0, -r.top / Math.max(1, span)));
        setS(Math.floor(k * STAGES.length));
      });
    };
    addEventListener('scroll', on, { passive: true }); on();
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <div className="wet" ref={wrap} style={{ ['--n' as string]: STAGES.length }}>
      <div className="wet-pin">
        <div className="wet-imgs">
          {STAGES.map((x, i) => (
            <img key={x.img} src={`/client/${x.img}-sm-v1.webp`} className={i === s ? 'on' : i < s ? 'past' : ''} alt={i === s ? `${x.t}: one of James’s bathrooms` : ''} aria-hidden={i !== s} width={760} height={1013} loading="lazy" />
          ))}
          {s === 3 && <div className="rain" aria-hidden="true">{Array.from({ length: 14 }, (_, k) => <i key={k} style={{ ['--x' as string]: `${(k * 37) % 100}%`, ['--d' as string]: `${(k % 5) * 0.31}s` }} />)}</div>}
          <span className="tag tl">His photos</span>
        </div>
        <div className="wet-txt">
          <ol className="wet-steps">
            {STAGES.map((x, i) => (
              <li key={x.n} className={i === s ? 'on' : i < s ? 'done' : ''}>
                <span className="wn">{x.n}</span>
                <div><h3>{x.t}</h3><p>{x.d}</p></div>
              </li>
            ))}
          </ol>
          <blockquote className="mini-q">“We had micro cement over existing tiles in a wet room.”<cite>Susan Butcher, Google review</cite></blockquote>
        </div>
      </div>
    </div>
  );
}
