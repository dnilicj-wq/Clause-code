import { useEffect, useRef, useState } from 'react';
import { IconBrandWhatsapp, IconArrowDown } from '@tabler/icons-react';
import { useSite } from '@/src/lib/ctx';
import { waLink } from './wa';
import { PALETTES, createPour, type Mode, type Pour } from './pour';

// Signature: "Pour your floor". A coded resin surface (not a photo of a job, and it says so).
// First paint = a pre-rendered still of frame 0 (pour-*.webp), so there is never a black screen.
// The shader starts after the page's load event, renders frame 0 again and fades in over the still.
// Reduced motion: the still, plus one re-rendered frame per tap. No loop, no drag.
const MODES = [{ k: 'Metallic', pal: 0 }, { k: 'Flake', pal: 2 }, { k: 'Quartz', pal: 4 }] as const;

export function Hero() {
  const { site } = useSite();
  const sec = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const pour = useRef<Pour | null>(null);
  const [mode, setMode] = useState<Mode>(0);
  const [pal, setPal] = useState(0);
  const [live, setLive] = useState(false);
  const still = typeof location !== 'undefined' && location.search.includes('pourstill');

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let io: IntersectionObserver | undefined, cancelled = false;
    const boot = async () => {
      if (cancelled || !cv.current) return;
      const p = await createPour(cv.current, { still: reduce || still });
      if (!p || cancelled) { p?.destroy(); return; } // no WebGL: the still stays
      pour.current = p;
      if (reduce || still) { p.frame(); if (still) setLive(true); return; }
      p.start();
      requestAnimationFrame(() => requestAnimationFrame(() => setLive(true)));
      io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? p.start() : p.stop()), { threshold: 0.01 });
      io.observe(sec.current!);
    };
    const vis = () => { const p = pour.current; if (!p || reduce) return; document.hidden ? p.stop() : p.start(); };
    const go = () => setTimeout(boot, still ? 0 : 60);
    if (still || document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
    document.addEventListener('visibilitychange', vis);
    return () => { cancelled = true; removeEventListener('load', go); document.removeEventListener('visibilitychange', vis); io?.disconnect(); pour.current?.destroy(); };
  }, [still]);

  const reduceNow = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pickMode = (m: Mode) => {
    setMode(m); setPal(MODES[m].pal);
    const p = pour.current; if (!p) return;
    p.setPalette(MODES[m].pal); p.setMode(m);
    if (reduceNow()) { p.frame(); setLive(true); }
  };
  const pickPal = (i: number) => {
    setPal(i); const p = pour.current; if (!p) return;
    p.setPalette(i); if (reduceNow()) { p.frame(); setLive(true); }
  };

  // drag = trowel (metallic) / move the light (flake, quartz). pan-y keeps vertical page scrolling on phones.
  const down = useRef(false);
  const onMove = (e: React.PointerEvent) => { if (!reduceNow()) pour.current?.drag(e.clientX, e.clientY, down.current || e.pointerType === 'mouse' && e.buttons === 1); };
  const isUi = (e: React.PointerEvent) => !!(e.target as HTMLElement).closest('a,button');

  return (
    <section id="top" ref={sec} aria-label="The Resin Originals" className="hero relative overflow-hidden"
      onPointerDown={(e) => { if (isUi(e)) return; down.current = true; onMove(e); }}
      onPointerMove={onMove}
      onPointerUp={() => { down.current = false; }} onPointerCancel={() => { down.current = false; }} onPointerLeave={() => { down.current = false; }}>
      <div className="pour" aria-hidden>
        <picture>
          <source media="(min-width: 768px)" srcSet="/client/hero/pour-d-v1.webp" />
          <img src="/client/hero/pour-m-v1.webp" alt="" width={600} height={1300} fetchPriority="high" decoding="sync" className="pour__still" />
        </picture>
        <canvas ref={cv} className={`pour__cv ${live ? 'is-on' : ''}`} />
      </div>
      <div className="hero__grid wrap">
        <div className="hero__copy">
          <p className="eyebrow hero__rise" style={{ color: 'var(--accent2)' }}>Epoxy resin floors</p>
          <h1 className="hero__h1 hero__rise">Every floor, an <span className="gold">original.</span></h1>
          <div className="hero__pills hero__rise" role="group" aria-label="Finish">
            {MODES.map((m, n) => (
              <button key={m.k} type="button" className={`pill ${n === mode ? 'is-on' : ''}`} aria-pressed={n === mode} onClick={() => pickMode(n as Mode)}>{m.k}</button>
            ))}
          </div>
          <div className="hero__chips hero__rise" role="group" aria-label="Colour, taken from our floors">
            {PALETTES.map((p, i) => (
              <button key={p.key} type="button" className={`swatch ${i === pal ? 'is-on' : ''}`} aria-pressed={i === pal} aria-label={p.name} title={p.name}
                style={{ background: `linear-gradient(135deg, ${p.pal[0]} 0%, ${p.pal[1]} 45%, ${p.pal[2]} 75%, ${p.pal[3]} 100%)` }} onClick={() => pickPal(i)} />
            ))}
          </div>
          <a href="#work" className="hero__note hero__rise">Interactive preview. Real floors below <IconArrowDown size={14} stroke={2} aria-hidden /></a>
          <p className="hero__sub hero__rise">Metallic, flake and quartz epoxy floors for homes, garages and commercial spaces.</p>
          <div className="hero__ctas hero__rise">
            <a href="#plan" className="btn btn--gold">Plan my floor</a>
            <a href={waLink(site.whatsapp, "Hi Dean, I saw your website and I'd like to talk about a floor.")} target="_blank" rel="noopener" className="btn btn--ghost">
              <IconBrandWhatsapp size={19} stroke={1.6} aria-hidden /> WhatsApp Dean
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
