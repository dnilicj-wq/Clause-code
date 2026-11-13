import { useEffect, useRef, useState } from 'react';
import { gallery } from './data';

// Coverflow on desktop, curved wheel on phones. Their own photos only, tagged with the page they're on.
export default function Gallery() {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const el = track.current!; let raf = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const apply = () => {
      raf = 0;
      const c = el.scrollLeft + el.clientWidth / 2; const narrow = el.clientWidth < 700;
      for (const card of Array.from(el.children) as HTMLElement[]) {
        const mid = card.offsetLeft + card.offsetWidth / 2; const d = (mid - c) / card.offsetWidth;
        const cl = Math.max(-2.2, Math.min(2.2, d));
        if (reduce) { card.style.transform = ''; continue; }
        card.style.transform = narrow
          ? `translateY(${Math.abs(cl) * Math.abs(cl) * 16}px) rotate(${cl * 5}deg) scale(${1 - Math.min(0.14, Math.abs(cl) * 0.08)})`
          : `perspective(1400px) rotateY(${-cl * 32}deg) translateZ(${-Math.abs(cl) * 120}px) scale(${1 - Math.min(0.2, Math.abs(cl) * 0.08)})`;
        card.style.zIndex = String(100 - Math.round(Math.abs(cl) * 10));
        card.style.opacity = String(1 - Math.min(0.45, Math.abs(cl) * 0.2));
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(apply); };
    el.addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    // start on the second card so the stack reads as a flow
    requestAnimationFrame(() => { const c1 = el.children[1] as HTMLElement | undefined; if (c1) el.scrollLeft = c1.offsetLeft - (el.clientWidth - c1.offsetWidth) / 2; apply(); });
    return () => { el.removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);

  const nudge = (dir: number) => { const el = track.current!; el.scrollBy({ left: dir * el.clientWidth * 0.5, behavior: 'smooth' }); };

  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') setOpen((o) => (o! + 1) % gallery.length); if (e.key === 'ArrowLeft') setOpen((o) => (o! - 1 + gallery.length) % gallery.length); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open]);

  return (
    <div className="gal">
      <div className="gal-track" ref={track} tabIndex={0} aria-label="Project photos, scroll sideways">
        {gallery.map((g, i) => (
          <button className="gal-card" key={g.src} onClick={() => setOpen(i)} aria-label={`Open photo: ${g.alt}`}>
            <img src={`/client/${g.src}-sm-v1.webp`} width={760} height={Math.round(760 * g.h / g.w)} alt={g.alt} loading="lazy" decoding="async" />
            <span className="gal-tag"><b>{g.tag}</b></span>
          </button>
        ))}
      </div>
      <div className="gal-nav">
        <button className="round" onClick={() => nudge(-1)} aria-label="Previous photos">←</button>
        <span>Every photo here is a Lime &amp; Marble job, from limeandmarble.com.</span>
        <button className="round" onClick={() => nudge(1)} aria-label="Next photos">→</button>
      </div>
      {open !== null && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={gallery[open].alt} onClick={() => setOpen(null)}>
          <img src={`/client/${gallery[open].src}-v1.webp`} alt={gallery[open].alt} />
          <p>{gallery[open].tag}</p>
          <button className="round lb-x" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
