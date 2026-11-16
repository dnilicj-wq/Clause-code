import { useEffect, useState } from 'react';
import { gallery } from './data';

// His own photos only, filterable by surface, with a lightbox.
const TAGS = ['All', 'Wet room', 'Microcement walls & floor', 'Worktop', 'Venetian plaster', 'Outdoor'];

export default function Gallery() {
  const [tag, setTag] = useState('All');
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const list = gallery.filter((g) => tag === 'All' || g.tag === tag);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') setOpen((o) => (o! + 1) % list.length); if (e.key === 'ArrowLeft') setOpen((o) => (o! - 1 + list.length) % list.length); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open, list.length]);
  return (
    <div className="gal">
      <div className="chips gal-f" role="radiogroup" aria-label="Filter by surface">
        {TAGS.filter((t) => t === 'All' || gallery.some((g) => g.tag === t)).map((t) => (
          <button key={t} role="radio" aria-checked={tag === t} className={`chip ${tag === t ? 'on' : ''}`} onClick={() => setTag(t)}>{t}</button>
        ))}
      </div>
      <div className={`gal-grid ${all ? 'all' : ''}`}>
        {list.map((g, i) => (
          <button className="gal-card" key={g.src} onClick={() => setOpen(i)} aria-label={`Open photo: ${g.alt}`}>
            <img src={`/client/${g.src}-sm-v1.webp`} width={760} height={Math.round(760 * g.h / g.w)} alt={g.alt} loading="lazy" decoding="async" />
            <span className="gal-tag">{g.tag}</span>
          </button>
        ))}
      </div>
      {!all && list.length > 6 && <button className="btn btn-ghost sm gal-more" onClick={() => setAll(true)}>Show all {list.length} photos</button>}
      <p className="fine">Every photo here is one of James’s jobs, from microcement-venetian.com.</p>
      {open !== null && list[open] && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={list[open].alt} onClick={() => setOpen(null)}>
          <img src={`/client/${list[open].src}-v1.webp`} alt={list[open].alt} />
          <p>{list[open].tag}</p>
          <button className="round lb-x" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
