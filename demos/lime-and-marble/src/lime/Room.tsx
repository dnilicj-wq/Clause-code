import { useState } from 'react';

// Surface switcher. One illustrated room; tap a surface and it turns to microcement.
// Applications are only the ones listed on their microcement page.
const S = [
  { k: 'floor', label: 'Floor', say: 'Seamless and grout-free. A sweep or a mop keeps it clean.' },
  { k: 'walls', label: 'Walls', say: 'One continuous skin, wall to wall, with no joints to break the flow.' },
  { k: 'worktop', label: 'Worktop', say: 'Worktops in the same finish as the floor, for one joined-up kitchen.' },
  { k: 'splash', label: 'Splashback', say: 'No grout lines behind the hob. Just wipe it.' },
  { k: 'outdoor', label: 'Outdoor terrace', say: 'Patios, pool surrounds and terraces, outside as well as in.' },
] as const;
type K = (typeof S)[number]['k'];

export default function Room() {
  const [k, setK] = useState<K>('floor');
  const cur = S.find((s) => s.k === k)!;
  const f = (key: K) => ({ className: `srf ${k === key ? 'on' : ''}` });
  return (
    <div className="room">
      <div className="room-stage">
        <svg viewBox="0 0 800 560" role="img" aria-label={`Illustration of a kitchen with the ${cur.label.toLowerCase()} in microcement`}>
          <defs>
            <filter id="mc" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency=".011 .02" numOctaves="4" seed="7" result="n" />
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 .70  0 0 0 0 .67  0 0 0 0 .62  0 0 0 -1.1 1.05" result="c" />
              <feFlood floodColor="#CFC8BC" result="b" />
              <feComposite in="c" in2="b" operator="over" result="t" />
              <feComposite in="t" in2="SourceAlpha" operator="in" />
            </filter>
            <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
              <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0" dur="3.2s" repeatCount="indefinite" />
            </linearGradient>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E6ECE9" /><stop offset="1" stopColor="#F4F1EA" /></linearGradient>
            <clipPath id="glass"><rect x="486" y="112" width="166" height="248" /></clipPath>
          </defs>
          {/* outside, seen through the glass doors */}
          <g clipPath="url(#glass)">
            <rect x="486" y="112" width="166" height="248" fill="url(#sky)" />
            <path d="M486 250 q20 -40 44 -10 q16 -36 40 -6 q24 -30 46 0 q20 -24 36 10 V300 H486Z" fill="#B9C2A6" opacity=".7" />
            <g {...f('outdoor')}>
              <path className="base" d="M486 300 H652 V360 H486Z" />
              <path className="tex" d="M486 300 H652 V360 H486Z" />
              <path className="glint" d="M486 300 H652 V360 H486Z" />
            </g>
          </g>
          {/* walls */}
          <g {...f('walls')}>
            <path className="base" d="M120 60 H486 V112 H652 V60 H680 V360 H652 V112 H486 V360 H120Z M0 0 L120 60 V360 L0 560Z M800 0 L680 60 V360 L800 560Z" />
            <path className="tex" d="M120 60 H486 V112 H652 V60 H680 V360 H652 V112 H486 V360 H120Z M0 0 L120 60 V360 L0 560Z M800 0 L680 60 V360 L800 560Z" />
            <path className="glint" d="M120 60 H486 V360 H120Z" />
          </g>
          <rect x="486" y="112" width="166" height="248" fill="none" stroke="#2B2A27" strokeWidth="3" />
          <line x1="569" y1="112" x2="569" y2="360" stroke="#2B2A27" strokeWidth="2" />
          {/* floor */}
          <g {...f('floor')}>
            <path className="base" d="M120 360 H680 L800 560 H0Z" />
            <path className="tex" d="M120 360 H680 L800 560 H0Z" />
            <path className="glint" d="M120 360 H680 L800 560 H0Z" />
          </g>
          {/* back run: wall units, splashback, counter */}
          <rect x="150" y="84" width="300" height="86" fill="#F7F4EE" stroke="#2B2A27" strokeWidth="2" />
          <line x1="250" y1="84" x2="250" y2="170" stroke="#2B2A27" strokeWidth="1.5" /><line x1="350" y1="84" x2="350" y2="170" stroke="#2B2A27" strokeWidth="1.5" />
          <g {...f('splash')}>
            <path className="base" d="M150 196 H450 V262 H150Z" />
            <path className="tex" d="M150 196 H450 V262 H150Z" />
            <path className="glint" d="M150 196 H450 V262 H150Z" />
          </g>
          <path d="M258 214 q42 -26 84 0" fill="none" stroke="#2B2A27" strokeWidth="2" />
          <rect x="146" y="262" width="308" height="10" fill="#E8E3DA" stroke="#2B2A27" strokeWidth="2" />
          <rect x="150" y="272" width="300" height="88" fill="#F7F4EE" stroke="#2B2A27" strokeWidth="2" />
          {/* pendant lights */}
          <g stroke="#2B2A27" strokeWidth="1.5" fill="#F7F4EE">
            <line x1="250" y1="0" x2="250" y2="250" /><path d="M236 250 h28 l-6 -14 h-16z" />
            <line x1="330" y1="0" x2="330" y2="240" /><path d="M316 240 h28 l-6 -14 h-16z" />
          </g>
          {/* island */}
          <g {...f('worktop')}>
            <path className="base" d="M160 360 H470 L500 404 H130Z M130 404 H500 V416 H130Z" />
            <path className="tex" d="M160 360 H470 L500 404 H130Z M130 404 H500 V416 H130Z" />
            <path className="glint" d="M160 360 H470 L500 404 H130Z" />
          </g>
          <path d="M136 416 H494 V506 H136Z" fill="#EEE9E0" stroke="#2B2A27" strokeWidth="2" />
          <g stroke="#2B2A27" strokeWidth="2" fill="none">
            <path d="M560 420 v86 M600 420 v86 M548 420 h64" /><path d="M640 400 v106 M680 400 v106 M628 400 h64" />
          </g>
          <path d="M700 300 q-14 -40 4 -70 q12 30 -4 70z M712 300 q10 -50 34 -64 q-4 40 -34 64z" fill="#9AA88B" />
          <path d="M694 300 h40 l-6 40 h-28z" fill="#E8E3DA" stroke="#2B2A27" strokeWidth="2" />
        </svg>
        <span className="tag">Illustration</span>
      </div>
      <div className="chips room-chips" role="radiogroup" aria-label="Surface">
        {S.map((s) => (
          <button key={s.k} role="radio" aria-checked={k === s.k} className={`chip ${k === s.k ? 'on' : ''}`} onClick={() => setK(s.k)}>{s.label}</button>
        ))}
      </div>
      <p className="room-say" aria-live="polite"><b>{cur.label}.</b> {cur.say}</p>
    </div>
  );
}
