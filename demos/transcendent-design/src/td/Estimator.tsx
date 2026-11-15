import { useState } from 'react';
import { wa } from './data';

// Uses their own published range: microcement flooring £110–£150 per m², plus prep where required
// (transcendentdesignuk.com/services/microcement-flooring/). Nothing else is priced.
const LO = 110, HI = 150;
const ROOMS = [
  { label: 'Bathroom', m2: 8 },
  { label: 'Kitchen', m2: 20 },
  { label: 'Open-plan', m2: 45 },
  { label: 'Whole ground floor', m2: 90 },
];
const fmt = (n: number) => '£' + (Math.round(n / 10) * 10).toLocaleString('en-GB');

export default function Estimator() {
  const [m2, setM2] = useState(20);
  const msg = `Hi Kieran, I found you on your website. I've got about ${m2}m² of floor I'd like in microcement. Could you take a look?`;
  return (
    <div className="est">
      <div className="est-l">
        <p className="est-k">Floor area</p>
        <output className="est-m2" aria-live="polite">{m2}<small>m²</small></output>
        <input className="range" type="range" min={4} max={150} value={m2} onChange={(e) => setM2(+e.target.value)} aria-label="Floor area in square metres" />
        <div className="chips">
          {ROOMS.map((r) => (
            <button key={r.label} className={`chip ${m2 === r.m2 ? 'on' : ''}`} onClick={() => setM2(r.m2)}>{r.label} <small>~{r.m2}m²</small></button>
          ))}
        </div>
      </div>
      <div className="est-r">
        <p className="est-k">Microcement flooring, ballpark</p>
        <p className="est-p" aria-live="polite">{fmt(m2 * LO)}<span>–</span>{fmt(m2 * HI)}</p>
        <p className="fine">Based on their published £110–£150 per m². Preparation is extra where it’s needed, and colour, size and the floor underneath all change it. Kieran &amp; Josh quote properly after a look.</p>
        <a className="btn btn-gold" href={wa(msg)} target="_blank" rel="noopener">Get a proper quote <span aria-hidden="true">→</span></a>
      </div>
    </div>
  );
}
