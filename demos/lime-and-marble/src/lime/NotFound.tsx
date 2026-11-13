import { useEffect, useState } from 'react';
import Burnish from './Burnish';

// 404: "This page cracked. Let's polish it." Polish the crack away and you're sent home.
export default function NotFound() {
  const [k, setK] = useState(0);
  useEffect(() => { document.title = 'This page cracked · Lime & Marble'; }, []);
  useEffect(() => { if (k > 0.55) { const t = setTimeout(() => { location.href = '/'; }, 700); return () => clearTimeout(t); } }, [k]);
  return (
    <main className="nf">
      <div className="nf-wall">
        <Burnish mode="game" onCover={setK} className="hero-gl" label="A cracked plaster wall you can polish" />
        <svg className="crack" viewBox="0 0 400 300" style={{ opacity: Math.max(0, 1 - k * 1.8) }} aria-hidden="true">
          <path d="M40 30 L120 90 L105 130 L190 160 L180 200 L260 230 L250 260 L330 290 M190 160 L230 140 L280 150 M120 90 L160 70" fill="none" stroke="#3a3833" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="nf-copy">
        <p className="eyebrow">404</p>
        <h1 className="h1">This page cracked.<br /><em>Let’s polish it.</em></h1>
        <p className="lede">Rub the wall to polish the crack out and we’ll take you home. {Math.round(Math.min(1, k / 0.55) * 100)}%</p>
        <a className="btn btn-ink" href="/">Or just go home</a>
      </div>
    </main>
  );
}
