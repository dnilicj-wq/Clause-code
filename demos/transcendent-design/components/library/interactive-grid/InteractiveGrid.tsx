// Ported from 21st.dev/@designali-in/components/interactive-grid (Ali Imam). Source: library-inbox/interactive-grid.tsx.
// Same dot field + proximity lines to the pointer. Changes: the original restarted a new rAF loop on every
// mouse move (loops stacked up) and drew in React state; now one loop with refs. Sized to its container,
// DPR capped, rainbow hue swapped for the preset accent (brightness still falls off with distance),
// works with touch, pauses offscreen. When the pointer is away, a slow "sweep" point keeps it alive.
import { useEffect, useRef } from 'react';
import { cssVar, fitCanvas, rgba, runLoop, toRGB } from '../_shared/loop';

export function InteractiveGrid({ dotDistance = 30, dotRadius = 2, minProximity = 160, idleSweep = true, className = '' }: {
  dotDistance?: number; dotRadius?: number; minProximity?: number; idleSweep?: boolean; className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!; const ctx = canvas.getContext('2d')!;
    let W = 1, H = 1, acc: [number, number, number] = [200, 140, 90], hi: [number, number, number] = [255, 230, 200], dim: [number, number, number] = [80, 80, 80];
    const mouse = { x: -9999, y: -9999, active: false, lastMove: 0 };
    const setup = () => {
      ({ w: W, h: H } = fitCanvas(canvas, ctx));
      acc = toRGB(cssVar(canvas, '--accent')); hi = toRGB(cssVar(canvas, '--accent2')); dim = toRGB(cssVar(canvas, '--muted'));
    };
    setup();
    const ro = new ResizeObserver(setup); ro.observe(canvas.parentElement!);
    const prox2 = minProximity * minProximity;
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      mouse.active = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (mouse.active) { mouse.x = x; mouse.y = y; mouse.lastMove = performance.now(); }
    };
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', move, { passive: true });
    const draw = (_dt: number, t: number) => {
      ctx.clearRect(0, 0, W, H);
      let mx = mouse.x, my = mouse.y;
      if (idleSweep && (!mouse.active || performance.now() - mouse.lastMove > 2500)) {
        mx = W * (0.5 + 0.38 * Math.sin(t * 0.45)); my = H * (0.5 + 0.3 * Math.sin(t * 0.7 + 1));
      }
      for (let x = 0; x < W; x += dotDistance) for (let y = 0; y < H; y += dotDistance) {
        const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (d2 <= prox2) {
          const k = 1 - d2 / prox2; // original: brightness 50% → 10% with distance
          const c: [number, number, number] = [acc[0] + (hi[0] - acc[0]) * k, acc[1] + (hi[1] - acc[1]) * k, acc[2] + (hi[2] - acc[2]) * k];
          ctx.fillStyle = rgba(c, 0.35 + 0.65 * k); ctx.strokeStyle = rgba(c, 0.15 + 0.6 * k);
          ctx.beginPath(); ctx.arc(x, y, dotRadius, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mx, my); ctx.stroke();
        } else {
          ctx.fillStyle = rgba(dim, 0.35);
          ctx.beginPath(); ctx.arc(x, y, dotRadius, 0, Math.PI * 2); ctx.fill();
        }
      }
    };
    const stop = runLoop(canvas, draw);
    return () => { stop(); ro.disconnect(); removeEventListener('pointermove', move); removeEventListener('pointerdown', move); };
  }, [dotDistance, dotRadius, minProximity, idleSweep]);
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <canvas ref={ref} className="absolute inset-0 block" />
    </div>
  );
}
