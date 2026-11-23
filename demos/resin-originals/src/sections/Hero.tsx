import { useEffect, useRef, useState } from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { useSite } from '@/src/lib/ctx';
import { waLink } from './wa';

// Signature 1: "lights on". The hero film is Dean's own footage (home, garage, reception).
// A gold strip light sweeps down the panel once and the floor appears behind it, like a showroom switching on.
// Plain CSS keyframes (off the main thread). Negative delay keeps it in step when React replaces the prerendered shell.
// Reduced motion: no sweep, no autoplay, the still poster shows straight away.
export function Hero() {
  const { site } = useSite();
  const vid = useRef<HTMLVideoElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (sweep.current) sweep.current.style.setProperty('--t0', `${Math.round(350 - performance.now())}ms`);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saver = (navigator as any).connection?.saveData;
    if (reduce || saver) return;
    const start = () => {
      const v = vid.current; if (!v) return;
      v.src = matchMedia('(min-width: 768px)').matches ? '/client/hero/hero-720-v1.mp4' : '/client/hero/hero-540-v1.mp4';
      v.play().catch(() => {});
    };
    const t = setTimeout(start, 1400); // after the poster (LCP) and the sweep have landed
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="top" aria-label="The Resin Originals" className="hero relative overflow-hidden">
      <div className="hero__grid wrap">
        <div className="hero__copy">
          <p className="eyebrow hero__rise" style={{ color: 'var(--accent2)' }}>Epoxy resin floors</p>
          <h1 className="hero__h1 hero__rise">Every floor, <em>an original.</em></h1>
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
            <img src={site.posters.m} srcSet={`${site.posters.m} 540w, ${site.posters.d} 720w`} sizes="(min-width: 768px) 440px, 100vw"
              alt="A cream metallic epoxy floor laid by The Resin Originals in a UK home" width={720} height={1280} fetchPriority="high" decoding="async" className="hero__img" />
            <video ref={vid} muted loop playsInline preload="none" aria-hidden onPlaying={() => setPlaying(true)}
              className={`hero__vid ${playing ? 'is-on' : ''}`} />
            <div ref={sweep} data-sweep className="hero__veil" aria-hidden><i /></div>
          </div>
          <figcaption className="hero__cap">Filmed on our jobs: a home, a garage and a reception.</figcaption>
        </figure>
      </div>
    </section>
  );
}
