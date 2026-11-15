// Stagger Testimonials — port of 21st.dev/@vaib215/components/stagger-testimonials (catalogue copy).
// Unchanged: clipped-corner cards fanned along X, alternating tilt, centre card lifted with a hard offset shadow,
// click a card (or the arrows) to rotate the list. Hard-coded SaaS quotes + pravatar photos removed:
// testimonials come in as props (real reviews only), and a monogram tile replaces the avatar when there's no photo.
// Re-skinned to preset tokens; height is a prop; optional autoplay keeps it moving when idle.
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/cn';

const SQRT_5000 = Math.sqrt(5000);
export type StaggerItem = { quote: string; by: string; img?: string };
type Row = StaggerItem & { tempId: number };

function TestimonialCard({ position, t, handleMove, cardSize }: { position: number; t: Row; handleMove: (s: number) => void; cardSize: number }) {
  const isCenter = position === 0;
  const initials = t.by.split(/[ ,]/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div onClick={() => handleMove(position)}
      className={cn('absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out',
        isCenter ? 'z-10 border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]' : 'z-0 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)]')}
      style={{
        width: cardSize, height: cardSize,
        clipPath: 'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
        transform: `translate(-50%, -50%) translateX(${(cardSize / 1.5) * position}px) translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px) rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)`,
        boxShadow: isCenter ? '0px 8px 0px 4px var(--line)' : '0px 0px 0px 0px transparent',
      }}>
      <span className="absolute block origin-top-right rotate-45" style={{ right: -2, top: 48, width: SQRT_5000, height: 2, background: isCenter ? 'color-mix(in srgb, var(--accent-ink) 30%, transparent)' : 'var(--line)' }} />
      {t.img ? (
        <img src={t.img} alt="" className="mb-4 h-14 w-12 object-cover object-top" style={{ boxShadow: '3px 3px 0px var(--bg)' }} />
      ) : (
        <span className="mb-4 grid h-14 w-12 place-items-center font-display text-lg font-semibold" style={{ boxShadow: '3px 3px 0px var(--bg)', background: isCenter ? 'var(--accent-ink)' : 'var(--bg2)', color: isCenter ? 'var(--accent)' : 'var(--muted)' }}>{initials}</span>
      )}
      <h3 className="text-base font-medium sm:text-xl" style={{ color: 'inherit' }}>"{t.quote}"</h3>
      <p className="absolute bottom-8 left-8 right-8 mt-2 text-sm italic" style={{ color: isCenter ? 'color-mix(in srgb, var(--accent-ink) 80%, transparent)' : 'var(--muted)' }}>- {t.by}</p>
    </div>
  );
}

export function StaggerTestimonials({ testimonials, height = 600, autoplay = 0, className }: { testimonials: StaggerItem[]; height?: number; autoplay?: number; className?: string }) {
  const [cardSize, setCardSize] = useState(365);
  const [list, setList] = useState<Row[]>(() => testimonials.map((t, i) => ({ ...t, tempId: i })));
  const [paused, setPaused] = useState(false);

  const handleMove = (steps: number) => {
    setList((cur) => {
      const n = [...cur];
      if (steps > 0) for (let i = steps; i > 0; i--) { const it = n.shift(); if (!it) return cur; n.push({ ...it, tempId: Math.random() }); }
      else for (let i = steps; i < 0; i++) { const it = n.pop(); if (!it) return cur; n.unshift({ ...it, tempId: Math.random() }); }
      return n;
    });
  };

  useEffect(() => {
    const update = () => setCardSize(window.matchMedia('(min-width: 640px)').matches ? 365 : 290);
    update(); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update);
  }, []);
  useEffect(() => {
    if (!autoplay || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => handleMove(1), autoplay); return () => clearInterval(id);
  }, [autoplay, paused]);

  const btn = 'flex h-14 w-14 items-center justify-center text-2xl transition-colors border-2 border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2';
  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={{ height, background: 'color-mix(in srgb, var(--bg2) 60%, transparent)' }}
      onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      {list.map((t, index) => {
        const position = list.length % 2 ? index - (list.length + 1) / 2 : index - list.length / 2;
        return <TestimonialCard key={t.tempId} t={t} handleMove={handleMove} position={position} cardSize={cardSize} />;
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button onClick={() => handleMove(-1)} className={btn} aria-label="Previous review"><ChevronLeft /></button>
        <button onClick={() => handleMove(1)} className={btn} aria-label="Next review"><ChevronRight /></button>
      </div>
    </div>
  );
}
export default StaggerTestimonials;
