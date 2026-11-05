// Shared helpers for canvas / WebGL backgrounds: preset colours, offscreen pause, reduced motion, DPR cap.
export const DPR_CAP = 1.5;
export const dpr = () => Math.min(window.devicePixelRatio || 1, DPR_CAP);
export const prefersReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Read a preset CSS variable from the nearest element (presets are scoped per card on /presets). */
export function cssVar(el: Element, name: string, fallback = '#888'): string {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

/** '#rrggbb' | 'rgb(..)' → [r,g,b] 0..255 */
export function toRGB(c: string): [number, number, number] {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = '#000'; ctx.fillStyle = c;
  const s = ctx.fillStyle as string;
  if (s.startsWith('#')) return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
  const m = s.match(/[\d.]+/g) || ['0', '0', '0'];
  return [+m[0], +m[1], +m[2]];
}
export const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;

/**
 * Runs `frame(dt, t)` on rAF only while `el` is on screen and the tab is visible.
 * With reduced motion it draws one frame and stops. Returns a cleanup.
 */
export function runLoop(el: Element, frame: (dt: number, t: number) => void, opts: { still?: boolean } = {}): () => void {
  let raf = 0, last = 0, t = 0, onScreen = false, alive = true;
  const reduced = opts.still ?? prefersReduced();
  const tick = (now: number) => {
    raf = 0;
    if (!alive) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now; t += dt;
    frame(dt, t);
    if (!reduced && onScreen && document.visibilityState !== 'hidden') raf = requestAnimationFrame(tick);
  };
  const wake = () => { if (!raf && alive) { last = 0; raf = requestAnimationFrame(tick); } };
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) wake(); }, { rootMargin: '100px' });
  io.observe(el);
  const vis = () => document.visibilityState === 'visible' && onScreen && wake();
  document.addEventListener('visibilitychange', vis);
  return () => { alive = false; cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', vis); };
}

/** Size a canvas to its parent at capped DPR; returns css width/height. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx?: CanvasRenderingContext2D | null) {
  const p = canvas.parentElement!;
  const w = Math.max(1, p.clientWidth), h = Math.max(1, p.clientHeight), r = dpr();
  canvas.width = Math.round(w * r); canvas.height = Math.round(h * r);
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx?.setTransform(r, 0, 0, r, 0, 0);
  return { w, h, r };
}
