import { useEffect, useRef, useState } from 'react';

// Hero "The pour": a photoreal AI film (Higgsfield, labelled Visualisation) of marbled resin pouring
// across a black floor and setting to polished marble and gold. Auto-plays once, sped up to finish in
// under 3s, then holds on the set floor. The poster is the
// prerendered LCP image; the film only loads after the page has painted. Reduced motion: final frame.
const RATE = 2.2;

export default function Pour() {
  const vid = useRef<HTMLVideoElement>(null);
  const [set, setSet] = useState(false);
  const [mob] = useState(() => !matchMedia('(min-width: 700px)').matches);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setSet(true); return; }
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      v.src = mob ? '/posters/pour-m-v1.mp4' : '/posters/pour-d-v1.mp4';
      v.defaultPlaybackRate = RATE; v.playbackRate = RATE;
      const start = () => { v.playbackRate = RATE; v.play().then(() => v.classList.add('on')).catch(() => setSet(true)); };
      v.addEventListener('canplaythrough', start, { once: true });
      v.load();
    };
    const t = setTimeout(go, document.getElementById('boot') ? 900 : 150);
    const end = () => setSet(true);
    v.addEventListener('ended', end);
    return () => { cancelled = true; clearTimeout(t); v.removeEventListener('ended', end); };
  }, [mob]);

  return (
    <div className={`pour ${set ? 'set' : ''}`}>
      <picture>
        <source media="(min-width: 700px)" srcSet="/posters/hero-start-d-v1.webp" />
        <img className="pour-poster" src="/posters/hero-start-m-v1.webp" alt="" width={752} height={1344} fetchPriority="high" />
      </picture>
      <picture>
        <source media="(min-width: 700px)" srcSet="/posters/hero-end-d-v1.webp" />
        <img className="pour-end" src="/posters/hero-end-m-v1.webp" alt="" width={752} height={1344} loading="lazy" decoding="async" />
      </picture>
      <video ref={vid} className="pour-vid" muted playsInline preload="none" aria-hidden="true" />
      <span className="sr-only">Visualisation: marbled white, grey and gold resin pours across a black floor and sets into polished marble.</span>
    </div>
  );
}
