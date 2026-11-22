import { useEffect, type RefObject } from 'react';
// Lab-only: gently auto-scrolls a ScrollBox (down, pause, back to top) until the visitor touches it,
// so scroll-driven demos show their motion in a static card.
export function useAutoScroll(ref: RefObject<HTMLElement | null>, speed = 0.9) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, stopped = false, pauseUntil = performance.now() + 900, visible = false;
    const stop = () => { stopped = true; };
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((e) => el.addEventListener(e, stop, { passive: true }));
    const io = new IntersectionObserver(([x]) => { visible = x.isIntersecting; }, { threshold: 0.3 });
    io.observe(el);
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (stopped || !visible || t < pauseUntil) return;
      const max = el.scrollHeight - el.clientHeight;
      if (el.scrollTop >= max - 1) { pauseUntil = t + 1600; el.scrollTop = 0; return; }
      el.scrollTop = Math.min(max, el.scrollTop + speed);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((e) => el.removeEventListener(e, stop)); };
  }, [ref, speed]);
}
export function AutoScroll({ target, speed }: { target: RefObject<HTMLElement | null>; speed?: number }) {
  useAutoScroll(target, speed);
  return null;
}
