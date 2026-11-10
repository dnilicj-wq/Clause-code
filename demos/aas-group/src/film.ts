// Scroll-scrubbed hero film: pre-extracted frames drawn to a canvas, forward and back with the scroll.
// The poster (the finished garden) is a CSS background, so first paint never waits for this.
export type Film = { setProgress: (f: number) => void; destroy: () => void };

export function initFilm(canvas: HTMLCanvasElement, host: HTMLElement, opts: { base: string; count: number; onReady?: () => void }): Film {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const imgs: (HTMLImageElement | null)[] = new Array(opts.count).fill(null);
  const url = (i: number) => `${opts.base}/f${String(i + 1).padStart(3, '0')}.webp`;
  let want = opts.count - 1, drawn = -1, raf = 0, ready = false, dead = false;

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(host.clientWidth * dpr); canvas.height = Math.round(host.clientHeight * dpr); drawn = -1; queue();
  };
  // nearest frame that has loaded, so fast scrolling never shows a blank
  const nearest = (i: number) => { for (let d = 0; d < opts.count; d++) { if (imgs[i - d]) return i - d; if (imgs[i + d]) return i + d; } return -1; };
  const draw = () => {
    raf = 0; const i = nearest(want); if (i < 0 || i === drawn) return;
    const im = imgs[i]!, cw = canvas.width, ch = canvas.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h); drawn = i;
    if (!ready) { ready = true; opts.onReady?.(); }
  };
  const queue = () => { if (!raf && !dead) raf = requestAnimationFrame(draw); };
  const load = (i: number) => new Promise<void>((res) => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { imgs[i] = im; if (Math.abs(i - want) <= Math.abs(drawn - want) || drawn < 0) { drawn = -1; queue(); } res(); };
    im.onerror = () => res(); im.src = url(i);
  });

  // load order: last frame (matches the poster), first frame, then coarse-to-fine so any scroll position has a near frame early
  const order: number[] = [opts.count - 1, 0]; const seen = new Set(order);
  for (let step = 16; step >= 1; step = step >> 1) for (let i = 0; i < opts.count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  (async () => { let k = 0; const worker = async () => { while (k < order.length && !dead) await load(order[k++]); }; await Promise.all([worker(), worker(), worker(), worker()]); })();

  const ro = new ResizeObserver(size); ro.observe(host); size();
  return {
    setProgress(f) { want = Math.max(0, Math.min(opts.count - 1, Math.round(f * (opts.count - 1)))); queue(); },
    destroy() { dead = true; ro.disconnect(); cancelAnimationFrame(raf); },
  };
}
