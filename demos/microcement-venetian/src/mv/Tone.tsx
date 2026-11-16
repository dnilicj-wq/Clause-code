import { useState } from 'react';

// "Pick your tone": a fan of example mineral tones re-tints one illustrated wet room. Then his real Hammock job.
const TONES = [
  { n: 'Chalk', c: '#E6E2DA' },
  { n: 'Oat', c: '#CDBFA8' },
  { n: 'Putty', c: '#B3AA9C' },
  { n: 'Mist', c: '#A7B2B5' },
  { n: 'Slate', c: '#6F777A' },
  { n: 'Graphite', c: '#3D4042' },
];

export default function Tone() {
  const [t, setT] = useState(1);
  const c = TONES[t].c;
  return (
    <div className="tone">
      <div className="tone-scene">
        <svg viewBox="0 0 600 480" role="img" aria-label={`Illustration of a wet room in ${TONES[t].n}`} style={{ ['--tone' as string]: c }}>
          <defs>
            <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .22 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
            <filter id="cloud" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="3" seed="9" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .16 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
            <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
            <linearGradient id="wl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".12" /></linearGradient>
          </defs>
          {/* back wall, side wall, floor */}
          <rect className="tw" x="0" y="0" width="600" height="340" />
          <rect x="0" y="0" width="600" height="340" fill="url(#wl)" />
          <polygon className="tw" points="0,0 90,40 90,360 0,480" style={{ filter: 'brightness(.88)' }} />
          <polygon className="tw" points="90,340 600,340 600,480 0,480 90,360" style={{ filter: 'brightness(.94)' }} />
          <polygon points="90,340 600,340 600,480 0,480 90,360" fill="url(#fl)" />
          {/* niche, linear drain, glass, shower */}
          <rect x="390" y="140" width="120" height="70" rx="3" className="tw" style={{ filter: 'brightness(.8)' }} />
          <rect x="400" y="190" width="10" height="20" fill="#fff" opacity=".5" /><rect x="416" y="184" width="14" height="26" fill="#fff" opacity=".35" />
          <rect x="250" y="420" width="260" height="6" rx="3" fill="#000" opacity=".28" />
          <rect x="230" y="40" width="4" height="380" fill="#222" opacity=".7" />
          <rect x="234" y="40" width="200" height="380" fill="#fff" opacity=".06" />
          <rect x="455" y="40" width="5" height="60" fill="#222" opacity=".8" /><rect x="430" y="96" width="56" height="6" rx="3" fill="#222" opacity=".8" />
          <rect x="0" y="0" width="600" height="480" filter="url(#cloud)" />
          <rect x="0" y="0" width="600" height="480" filter="url(#grain)" />
        </svg>
        <span className="tag tl">Illustration · example tones</span>
      </div>
      <div className="tone-side">
        <div className="fan" role="radiogroup" aria-label="Example tones">
          {TONES.map((x, n) => (
            <button key={x.n} role="radio" aria-checked={t === n} className={`sw ${t === n ? 'on' : ''}`} onClick={() => setT(n)}
              style={{ ['--c' as string]: x.c, ['--r' as string]: `${(n - (TONES.length - 1) / 2) * 7}deg`, color: n >= 4 ? '#F2F1EE' : '#1F2224' }}>
              <span>{x.n}</span>
            </button>
          ))}
        </div>
        <p className="tone-note">Example tones, not a colour chart. <b>Microcement can be tinted to match your paint colour.</b> On one job James matched Farrow &amp; Ball Hammock No. 38.</p>
        <figure className="tone-real">
          <img src="/client/bath-finished-sm-v1.webp" alt="The Hammock No. 38 bathroom: tinted microcement walls and floor with a round mirror" width={760} height={1013} loading="lazy" />
          <figcaption><b>The real one.</b> Tinted microcement walls and floor, Hammock No. 38, with a refined, subtly smooth texture.</figcaption>
        </figure>
      </div>
    </div>
  );
}
