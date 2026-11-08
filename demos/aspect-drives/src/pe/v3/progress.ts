import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Scroll progress (0..1) through a tall section whose inner stage is CSS-sticky. ScrollTrigger only measures;
// the pinning is plain `position: sticky`, so React owns the DOM and nothing gets wrapped in pin-spacers.
export function useSectionProgress(ref: RefObject<HTMLElement | null>, cb: (p: number) => void, deps: unknown[] = []) {
  useEffect(() => {
    if (!ref.current) return;
    const st = ScrollTrigger.create({ trigger: ref.current, start: 'top top', end: 'bottom bottom', onUpdate: (s) => cb(s.progress), onRefresh: (s) => cb(s.progress) });
    cb(st.progress);
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(document.body);
    return () => { st.kill(); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const reducedMotion = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
