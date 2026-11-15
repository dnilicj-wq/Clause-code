// Ported from 21st.dev/@larsen66/components/blueprint-gradient-mesh. Source: library-inbox/blueprint-gradient-mesh.tsx.
// Same layers: spotlight, drifting blueprint grid with vignette, glowing hover cell, film grain, bottom fade.
// Changes: one shared loop instead of four rAF loops; container-sized (was `fixed inset-0 z-50`);
// grain drawn at 256px and scaled (the original refilled a 1024x1024 buffer every 2 frames);
// navy/blue swapped for preset tokens (defaults to --bg + --accent2 lines); pauses offscreen.
import { useEffect, useRef, type ReactNode } from 'react';
import { cssVar, fitCanvas, rgba, runLoop, toRGB } from '../_shared/loop';

type Direction = 'right' | 'left' | 'up' | 'down' | 'diagonal';

export function BlueprintGradientMesh({ direction = 'diagonal', speed = 0.2, squareSize = 44, vignette = true, grain = true, children, className = '' }: {
  direction?: Direction; speed?: number; squareSize?: number; vignette?: boolean; grain?: boolean; children?: ReactNode; className?: string;
}) {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const noiseRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = gridRef.current!; const ctx = canvas.getContext('2d')!;
    const nc = noiseRef.current; const nctx = nc?.getContext('2d');
    let W = 1, H = 1, line: [number, number, number] = [180, 205, 255], hi = line;
    const off = { x: 0, y: 0 };
    let hover: { x: number; y: number } | null = null;
    const setup = () => {
      ({ w: W, h: H } = fitCanvas(canvas, ctx));
      line = toRGB(cssVar(canvas, '--accent2')); hi = toRGB(cssVar(canvas, '--accent'));
    };
    setup();
    const ro = new ResizeObserver(setup); ro.observe(canvas.parentElement!);
    if (nc) { nc.width = nc.height = 256; }
    const origin = () => ({ x: -((off.x % squareSize) + squareSize) % squareSize, y: -((off.y % squareSize) + squareSize) % squareSize });
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
      if (mx < 0 || my < 0 || mx > r.width || my > r.height) { hover = null; return; }
      const o = origin(); hover = { x: Math.floor((mx - o.x) / squareSize), y: Math.floor((my - o.y) / squareSize) };
    };
    const leave = () => { hover = null; };
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', leave);
    let f = 0, idleT = 0;
    const draw = (dt: number, t: number) => {
      const v = Math.max(speed, 0.1) * (dt * 60), s = squareSize;
      if (direction === 'right' || direction === 'diagonal') off.x = (off.x - v + s) % s;
      if (direction === 'left') off.x = (off.x + v + s) % s;
      if (direction === 'up') off.y = (off.y + v + s) % s;
      if (direction === 'down' || direction === 'diagonal') off.y = (off.y - v + s) % s;
      ctx.clearRect(0, 0, W, H);
      const o = origin();
      ctx.strokeStyle = rgba(line, 0.28); ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = o.x; x < W + s; x += s) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
      for (let y = o.y; y < H + s; y += s) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
      ctx.stroke();
      if (vignette) {
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.40)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      // hover cell (when idle, a cell "walks" so the effect is visible on touch / in screenshots)
      let cell = hover;
      if (!cell) { idleT += dt; const k = Math.floor(idleT / 0.9); const cols = Math.ceil(W / s), rows = Math.ceil(H / s); cell = { x: (k * 7 + 3) % Math.max(1, cols), y: (k * 3 + 1) % Math.max(1, rows) }; }
      const cx = o.x + cell.x * s, cy = o.y + cell.y * s;
      ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = rgba(hi, 0.3); ctx.fillStyle = rgba(hi, 0.18); ctx.fillRect(cx, cy, s, s); ctx.restore();
      ctx.lineWidth = 1; ctx.strokeStyle = rgba(line, 0.7); ctx.strokeRect(cx + 0.5, cy + 0.5, s - 1, s - 1);
      const lg = ctx.createLinearGradient(cx, cy, cx, cy + s); lg.addColorStop(0, 'rgba(255,255,255,0.08)'); lg.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = lg; ctx.fillRect(cx, cy, s, s);
      if (nctx && f++ % 3 === 0) {
        const img = nctx.createImageData(256, 256), d = img.data;
        for (let i = 0; i < d.length; i += 4) { const n = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = n; d[i + 3] = 12; }
        nctx.putImageData(img, 0, 0);
      }
      void t;
    };
    const stop = runLoop(canvas, draw);
    return () => { stop(); ro.disconnect(); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); };
  }, [direction, speed, squareSize, vignette]);
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle 720px at 50% 30%, color-mix(in srgb, var(--accent2) 18%, transparent), transparent 70%)' }} />
      <div className="absolute inset-0"><canvas ref={gridRef} className="block" style={{ cursor: 'crosshair' }} /></div>
      {grain && <canvas ref={noiseRef} className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--bg) 92%, transparent))' }} />
      {children && <div className="pointer-events-none relative z-10 h-full">{children}</div>}
    </div>
  );
}
