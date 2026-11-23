import { useEffect, useRef, type RefObject } from 'react';

// Shared helpers for the canvas signature interactions.
export const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const lowPower = () => {
  const n = navigator as any;
  return !!(n.connection?.saveData) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2) || (n.deviceMemory && n.deviceMemory <= 2);
};
export const cssVar = (el: Element, name: string, fallback = '#888') => getComputedStyle(el).getPropertyValue(name).trim() || fallback;

export function hexToRgb(c: string): [number, number, number] {
  const m = c.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let h = m[1]; if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const r = c.match(/rgba?\(([^)]+)\)/); if (r) { const p = r[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2]]; }
  return [128, 128, 128];
}
export const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const rgb = (c: [number, number, number], a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export type Frame = { ctx: CanvasRenderingContext2D; w: number; h: number; dpr: number; t: number; dt: number };

/**
 * DPR-aware canvas loop. Pauses when off-screen or tab hidden. `draw` returns false to stop
 * requesting frames (static) – call `wake()` to restart. Reduced motion: caller decides.
 */
export function useCanvasLoop(
  ref: RefObject<HTMLCanvasElement | null>,
  draw: (f: Frame) => boolean | void,
  onResize?: (w: number, h: number, dpr: number) => void,
) {
  const drawRef = useRef(draw); drawRef.current = draw;
  const resizeRef = useRef(onResize); resizeRef.current = onResize;
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let w = 0, h = 0, dpr = 1, raf = 0, last = performance.now(), visible = true, running = false;
    const size = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, lowPower() ? 1.25 : 2);
      w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      resizeRef.current?.(w, h, dpr);
      wake();
    };
    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const more = drawRef.current({ ctx, w, h, dpr, t: now / 1000, dt });
      if (more === false) { running = false; return; }
      if (visible && !document.hidden) raf = requestAnimationFrame(tick); else running = false;
    };
    const wake = () => { if (!raf && w > 0) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } };
    wakeRef.current = wake;
    const ro = new ResizeObserver(size); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }, { rootMargin: '100px' });
    io.observe(c);
    const vis = () => { if (!document.hidden) wake(); };
    document.addEventListener('visibilitychange', vis);
    size();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis); void running; };
  }, [ref]);
  return () => wakeRef.current();
}

/** Calls `fn` after `ms` of no user input on `el`; re-arms after each input. */
export function useIdle(el: RefObject<HTMLElement | null>, ms: number, fn: () => void, enabled = true) {
  const fnRef = useRef(fn); fnRef.current = fn;
  const idleRef = useRef(true);
  const lastInput = useRef(0);
  useEffect(() => {
    const e = el.current; if (!e || !enabled) return;
    const mark = () => { lastInput.current = performance.now(); idleRef.current = false; };
    e.addEventListener('pointerdown', mark); e.addEventListener('pointermove', mark);
    const iv = setInterval(() => { if (performance.now() - lastInput.current > ms) { idleRef.current = true; fnRef.current(); } }, 250);
    return () => { e.removeEventListener('pointerdown', mark); e.removeEventListener('pointermove', mark); clearInterval(iv); };
  }, [el, ms, enabled]);
  return idleRef;
}
