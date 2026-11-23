import { useEffect, useRef, useState } from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { useSite } from '@/src/lib/ctx';
import { waLink } from './wa';

// Signature: finish pills switch the hero between Dean's own clips (one real job each).
// Captions repeat his reel captions (sources in content-inventory.md).
// First paint = the metallic poster (preloaded, no cover). Clips load only when their finish is shown.
// Auto-cycles every 6s until the visitor taps a pill. Reduced motion / save-data: posters only, no autoplay, no cycle.
const FIN = [
  { k: 'Metallic', id: 'metallic', cap: 'Metallic epoxy in a UK home', alt: 'Cream metallic epoxy floor in a UK home, laid by The Resin Originals' },
  { k: 'Flake', id: 'flake', cap: 'Flake garage floor with a logo set in', alt: 'Grey flake epoxy garage floor with a red track logo set into it' },
  { k: 'Quartz', id: 'quartz', cap: 'Blue quartz for an eye clinic theatre room', alt: 'Blue quartz epoxy floor with coving in an eye clinic theatre room' },
] as const;
const src = (id: string, w: number, poster = false) => `/client/hero/${id}-${poster ? 'poster-' : ''}${w}-v1.${poster ? 'webp' : 'mp4'}`;

export function Hero() {
  const { site } = useSite();
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false); // visitor tapped: stop cycling
  const [motion, setMotion] = useState(false); // false until load + no reduced motion
  const [seen, setSeen] = useState<number[]>([0]); // posters/clips we've asked for
  const [playing, setPlaying] = useState<number[]>([]);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saver = (navigator as any).connection?.saveData;
    const go = () => { setSeen([0, 1, 2]); if (!reduce && !saver) setMotion(true); }; // other posters are small; fetch after load
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
    return () => removeEventListener('load', go);
  }, []);

  useEffect(() => {
    if (!motion || held) return;
    const t = setInterval(() => setI((n) => (n + 1) % FIN.length), 6000);
    return () => clearInterval(t);
  }, [motion, held]);

  // load + play only the active clip
  useEffect(() => {
    if (!motion) return;
    const w = matchMedia('(min-width: 768px)').matches ? 720 : 540;
    vids.current.forEach((v, n) => {
      if (!v) return;
      if (n === i) {
        if (!v.getAttribute('src')) v.src = src(FIN[n].id, w);
        v.currentTime = 0;
        v.play().catch(() => {});
      } else v.pause();
    });
  }, [i, motion]);

  const pick = (n: number) => { setHeld(true); setI(n); if (!seen.includes(n)) setSeen((s) => [...s, n]); };

  return (
    <section id="top" aria-label="The Resin Originals" className="hero relative overflow-hidden">
      <div className="hero__grid wrap">
        <div className="hero__copy">
          <p className="eyebrow hero__rise" style={{ color: 'var(--accent2)' }}>Epoxy resin floors</p>
          <h1 className="hero__h1 hero__rise">Every floor, <em>an original.</em></h1>
          <div className="hero__pills hero__rise" role="group" aria-label="Show a finish">
            {FIN.map((f, n) => (
              <button key={f.k} type="button" className={`pill ${n === i ? 'is-on' : ''}`} aria-pressed={n === i} onClick={() => pick(n)}>{f.k}</button>
            ))}
          </div>
          <p className="hero__now hero__rise" aria-live="polite"><span>On screen:</span> {FIN[i].cap}</p>
          <p className="hero__sub hero__rise">Metallic, flake and quartz epoxy floors for homes, garages and commercial spaces.</p>
          <div className="hero__ctas hero__rise">
            <a href="#plan" className="btn btn--gold">Plan my floor</a>
            <a href={waLink(site.whatsapp, "Hi Dean, I saw your website and I'd like to talk about a floor.")} target="_blank" rel="noopener" className="btn btn--ghost">
              <IconBrandWhatsapp size={19} stroke={1.6} aria-hidden /> WhatsApp Dean
            </a>
          </div>
        </div>
        <figure className="hero__media">
          <div className="hero__frame">
            {FIN.map((f, n) => (
              <div key={f.id} className={`hero__layer ${n === i ? 'is-on' : ''}`} aria-hidden={n !== i}>
                {seen.includes(n) && (
                  <img src={src(f.id, 540, true)} srcSet={`${src(f.id, 540, true)} 540w, ${src(f.id, 720, true)} 720w`} sizes="(min-width: 768px) 440px, 100vw"
                    alt={f.alt} width={720} height={1280} fetchPriority={n === 0 ? 'high' : 'low'} decoding={n === 0 ? 'sync' : 'async'} className="hero__img" />
                )}
                <video ref={(el) => { vids.current[n] = el; }} muted loop playsInline preload="none" aria-hidden
                  onPlaying={() => setPlaying((p) => (p.includes(n) ? p : [...p, n]))}
                  className={`hero__vid ${playing.includes(n) ? 'is-on' : ''}`} />
              </div>
            ))}
            <div className="hero__sweep" aria-hidden><i /></div>
          </div>
          <figcaption className="hero__cap">Real footage from our jobs.</figcaption>
        </figure>
      </div>
    </section>
  );
}
