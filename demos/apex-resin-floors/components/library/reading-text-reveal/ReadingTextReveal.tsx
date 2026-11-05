// Port of Reading Text Reveal (21st.dev @waleedkibhen). Same engine: an "eye line" at 62% of the view,
// eased progress (0.12 per frame), words switch from 40% muted to full ink as the eye line passes.
// Changes: story text is a prop (the original hard-codes a freelancer story), optional scroll `container`,
// preset tokens + display font, no 400vh/end-card padding (the parent decides the height). Reduced motion: all lit.
import { useRef, useEffect, useState, type RefObject } from 'react';
import { cn } from '@/src/lib/cn';

export function ReadingTextReveal({ segments, container, className, pClassName }: {
  segments: string[]; container?: RefObject<HTMLElement | null>; className?: string; pClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);
  const allWords = segments.flatMap((s) => s.split(' '));
  const totalWords = allWords.length;

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setRevealed(totalWords); return; }
    let raf: number | null = null; let target = 0; let current = 0;
    const scroller: HTMLElement | Window = container?.current ?? window;
    const tick = () => {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) > 0.001) { setRevealed(Math.floor(current * totalWords)); raf = requestAnimationFrame(tick); }
      else setRevealed(Math.floor(target * totalWords));
    };
    const onScroll = () => {
      const el = ref.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const box = container?.current?.getBoundingClientRect();
      const viewTop = box ? box.top : 0; const viewH = box ? box.height : window.innerHeight;
      const eye = viewTop + viewH * 0.62;
      target = Math.max(0, Math.min(1, (eye - rect.top) / rect.height));
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { scroller.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [totalWords, container]);

  let wi = 0;
  return (
    <div ref={ref} className={cn('space-y-10', className)}>
      {segments.map((seg, si) => {
        const ws = seg.split(' '); const start = wi; wi += ws.length;
        return (
          <p key={si} className={cn('text-4xl leading-tight md:text-5xl', pClassName)} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-.02em' }}>
            {ws.map((w, i) => {
              const on = start + i < revealed;
              return <span key={i} style={{ transition: 'all 0.3s ease-out', opacity: on ? 1 : 0.4, color: on ? 'var(--ink)' : 'var(--muted)' }}>{w}{' '}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}
