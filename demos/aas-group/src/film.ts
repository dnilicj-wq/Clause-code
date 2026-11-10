// Scroll-scrubbed hero film: pre-extracted frames drawn to a canvas, forward and back with the scroll.
// The poster (the finished garden) is a CSS background, so first paint never waits for this.
export type Film = { setProgress: (f: number) => void; destroy: () => void };

export function initFilm(canvas: HTMLCanvasElement, host: HTMLElement, opts: { base: string; count: number; onReady?: () => void }): Film {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const imgs: (HTMLImageElement | null)[] = new Array(opts.count).fill(null);
  const url = (i: number) => `${opts.base}/f${String(i + 1).padStart(3, '0')}.webp`;
  // `target` is where the scroll wants to be (in frames); `cur` eases toward it every frame, and the two frames either
  // side of `cur` are cross-faded, so the film glides rather than stepping frame to frame.
  let target = opts.count - 1, cur = target, last = -1, drawnKey = '', raf = 0, ready = false, dead = false;

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(host.clientWidth * dpr); canvas.height = Math.round(host.clientHeight * dpr); drawnKey = ''; queue();
  };
  // nearest frame that has loaded, so fast scrolling never shows a blank
  const nearest = (i: number) => { for (let d = 0; d < opts.count; d++) { if (imgs[i - d]) return i - d; if (imgs[i + d]) return i + d; } return -1; };
  const paint = (im: HTMLImageElement, a: number) => {
    const cw = canvas.width, ch = canvas.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.globalAlpha = a; ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  };
  const tick = (now: number) => {
    raf = 0; if (dead) return;
    const dt = last < 0 ? 16 : Math.min(64, now - last); last = now;
    // frame-rate independent ease (~0.09 per 60fps frame): slow, soft follow
    cur += (target - cur) * (1 - Math.exp(-dt / 180));
    if (Math.abs(target - cur) < 0.002) cur = target;
    const lo = Math.floor(cur), hi = Math.min(opts.count - 1, lo + 1), fr = cur - lo;
    const a = nearest(lo), b = imgs[hi] ? hi : -1;
    if (a >= 0) {
      const key = a + ':' + b + ':' + fr.toFixed(3);
      if (key !== drawnKey) {
        paint(imgs[a]!, 1);
        if (b >= 0 && b !== a && fr > 0.004) paint(imgs[b]!, fr);
        ctx.globalAlpha = 1; drawnKey = key;
        if (!ready) { ready = true; opts.onReady?.(); }
      }
    }
    if (cur !== target) raf = requestAnimationFrame(tick); else last = -1;
  };
  const queue = () => { if (!raf && !dead) raf = requestAnimationFrame(tick); };
  const load = (i: number) => new Promise<void>((res) => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { imgs[i] = im; if (Math.abs(i - cur) < 2 || !ready) { drawnKey = ''; queue(); } res(); };
    im.onerror = () => res(); im.src = url(i);
  });

  // load order: last frame (matches the poster), first frame, then coarse-to-fine so any scroll position has a near frame early
  const order: number[] = [opts.count - 1, 0]; const seen = new Set(order);
  for (let step = 16; step >= 1; step = step >> 1) for (let i = 0; i < opts.count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  (async () => { let k = 0; const worker = async () => { while (k < order.length && !dead) await load(order[k++]); }; await Promise.all([worker(), worker(), worker(), worker()]); })();

  const ro = new ResizeObserver(size); ro.observe(host); size();
  return {
    setProgress(f) { target = Math.max(0, Math.min(1, f)) * (opts.count - 1); if (!ready) cur = target; queue(); },
    destroy() { dead = true; ro.disconnect(); cancelAnimationFrame(raf); },
  };
}
