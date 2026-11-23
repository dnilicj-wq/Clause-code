// Rebuilt; original source (21st.dev/@daiwiikharihar/components/perspective-tunnel-hero) not reachable for free.
// Faithful in spirit: a one-point-perspective tunnel of receding frames flying toward the viewer, with a
// headline at the vanishing point. Re-themed as a warehouse aisle: a glossy floor grid with a reflected
// light strip, wall and ceiling frames, preset accent on the bay lines. 2D canvas, pauses offscreen;
// pointer shifts the vanishing point slightly (parallax). Suits the industrial / commercial presets.
import { useEffect, useRef, type ReactNode } from 'react';
import { cssVar, fitCanvas, rgba, runLoop, toRGB } from '../_shared/loop';

export function PerspectiveTunnel({ speed = 1, className = '' }: { speed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!;
    let W = 1, H = 1, acc: [number, number, number] = [0, 0, 0], ink = acc, bg = acc, hi = acc;
    const setup = () => { ({ w: W, h: H } = fitCanvas(c, ctx)); acc = toRGB(cssVar(c, '--accent')); hi = toRGB(cssVar(c, '--accent2')); ink = toRGB(cssVar(c, '--ink')); bg = toRGB(cssVar(c, '--bg')); };
    setup();
    const ro = new ResizeObserver(setup); ro.observe(c.parentElement!);
    const par = { x: 0, y: 0, tx: 0, ty: 0 };
    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); par.tx = ((e.clientX - r.left) / r.width - 0.5); par.ty = ((e.clientY - r.top) / r.height - 0.5); };
    addEventListener('pointermove', move, { passive: true });
    const N = 18; let z0 = 0; // N frames in flight
    const draw = (dt: number, t: number) => {
      par.x += (par.tx - par.x) * 0.05; par.y += (par.ty - par.y) * 0.05;
      z0 = (z0 + dt * 0.55 * speed) % 1;
      const vx = W / 2 - par.x * W * 0.08 + Math.sin(t * 0.2) * W * 0.01, vy = H * 0.46 - par.y * H * 0.06;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgba(bg, 1)); g.addColorStop(0.46, rgba(acc.map((v, i) => bg[i] + (v - bg[i]) * 0.12) as [number, number, number], 1)); g.addColorStop(1, rgba(bg, 1));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const halfW = Math.max(W, H * 1.6) * 0.75, halfH = H * 0.62;
      // frames from far to near; depth d in (0,1], scale = 1/(d*k)
      type F = { x0: number; x1: number; y0: number; y1: number; a: number; s: number; i: number };
      const fr: F[] = [];
      for (let i = N - 1; i >= 0; i--) {
        const d = (i + 1 - z0) / N; const s = 0.08 / Math.max(0.02, d * d);
        const fw = Math.min(halfW * s, W * 4), fh = Math.min(halfH * s, H * 4);
        fr.push({ x0: vx - fw, x1: vx + fw, y0: vy - fh, y1: vy + fh * 0.85, a: Math.min(1, (1 - d) * 1.4) * Math.min(1, s * 3), s, i });
      }
      // glossy floor bays + racking beams between consecutive frames (far → near), so the aisle reads as a
      // stocked warehouse rather than empty wireframes, even on a narrow phone where the side walls dominate.
      for (let j = 0; j < fr.length - 1; j++) {
        const f = fr[j], n = fr[j + 1], a = Math.min(f.a, n.a);
        if (f.i % 2 === 0) {
          ctx.fillStyle = rgba(acc, a * 0.07);
          ctx.beginPath(); ctx.moveTo(f.x0, f.y1); ctx.lineTo(f.x1, f.y1); ctx.lineTo(n.x1, n.y1); ctx.lineTo(n.x0, n.y1); ctx.closePath(); ctx.fill();
        }
        // side walls: shade, then two beam levels per side
        ctx.fillStyle = rgba(ink, a * 0.025);
        ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(n.x0, n.y0); ctx.lineTo(n.x0, n.y1); ctx.lineTo(f.x0, f.y1); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(f.x1, f.y0); ctx.lineTo(n.x1, n.y0); ctx.lineTo(n.x1, n.y1); ctx.lineTo(f.x1, f.y1); ctx.closePath(); ctx.fill();
        ctx.lineWidth = Math.max(0.6, Math.min(2.4, n.s * 1.1));
        for (const h of [0.32, 0.62]) {
          ctx.strokeStyle = rgba(h < 0.5 ? acc : ink, a * (h < 0.5 ? 0.5 : 0.22));
          const fy = f.y0 + (f.y1 - f.y0) * h, ny = n.y0 + (n.y1 - n.y0) * h;
          ctx.beginPath(); ctx.moveTo(f.x0, fy); ctx.lineTo(n.x0, ny); ctx.moveTo(f.x1, fy); ctx.lineTo(n.x1, ny); ctx.stroke();
        }
      }
      for (const f of fr) {
        const { x0, x1, y0, y1, a, s, i } = f, fw = (x1 - x0) / 2;
        ctx.lineWidth = Math.max(0.5, Math.min(3, s * 1.2));
        ctx.strokeStyle = rgba(i % 3 === 0 ? acc : ink, a * (i % 3 === 0 ? 0.6 : 0.22));
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        // floor bay line (painted aisle marking)
        ctx.strokeStyle = rgba(hi, a * 0.5); ctx.beginPath(); ctx.moveTo(vx - fw * 0.35, y1); ctx.lineTo(vx + fw * 0.35, y1); ctx.stroke();
        // ceiling light bar and its reflection in the glossy floor
        const lw = fw * 0.22, lh = Math.max(1, s * 2.2);
        ctx.fillStyle = rgba(hi, a * 0.75); ctx.fillRect(vx - lw, y0 + lh * 2, lw * 2, lh);
        ctx.fillStyle = rgba(hi, a * 0.18); ctx.fillRect(vx - lw * 1.1, y1 - lh * 4, lw * 2.2, lh * 1.6);
      }
      // rails to the vanishing point (floor grid + ceiling strip)
      ctx.lineWidth = 1;
      for (let k = -6; k <= 6; k++) {
        ctx.strokeStyle = rgba(ink, k === 0 ? 0.0 : 0.07);
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + k * W * 0.35, H + 40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + k * W * 0.35, -40); ctx.stroke();
      }
      // glossy floor reflection of the ceiling light
      const rg = ctx.createLinearGradient(vx, vy, vx, H);
      rg.addColorStop(0, rgba(hi, 0)); rg.addColorStop(0.35, rgba(hi, 0.16)); rg.addColorStop(1, rgba(hi, 0));
      ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(vx - 2, vy); ctx.lineTo(vx + 2, vy); ctx.lineTo(vx + W * 0.09, H); ctx.lineTo(vx - W * 0.09, H); ctx.closePath(); ctx.fill();
      const cl = ctx.createLinearGradient(vx, vy, vx, 0);
      cl.addColorStop(0, rgba(ink, 0)); cl.addColorStop(1, rgba(ink, 0.08));
      ctx.fillStyle = cl; ctx.beginPath(); ctx.moveTo(vx - 1, vy); ctx.lineTo(vx + 1, vy); ctx.lineTo(vx + W * 0.03, 0); ctx.lineTo(vx - W * 0.03, 0); ctx.closePath(); ctx.fill();
      // depth fog around the vanishing point
      const fog = ctx.createRadialGradient(vx, vy, 0, vx, vy, Math.min(W, H) * 0.35);
      fog.addColorStop(0, rgba(bg, 0.9)); fog.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = fog; ctx.fillRect(0, 0, W, H);
    };
    const stop = runLoop(c, draw);
    return () => { stop(); ro.disconnect(); removeEventListener('pointermove', move); };
  }, [speed]);
  return <div className={`absolute inset-0 ${className}`}><canvas ref={ref} className="absolute inset-0 block" /></div>;
}

export function PerspectiveTunnelHero({ kicker, title, sub, children, className = '' }: { kicker?: string; title?: ReactNode; sub?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[inherit] w-full items-center justify-center overflow-hidden ${className}`} style={{ background: 'var(--bg)', containerType: 'inline-size' }}>
      <PerspectiveTunnel />
      <div className="relative z-10 px-6 text-center">
        {kicker && <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.22em]" style={{ color: 'var(--accent)' }}>{kicker}</p>}
        {title && <h1 className="font-display text-[clamp(30px,6.5cqw,104px)] font-semibold leading-[1] tracking-tight" style={{ color: 'var(--ink)' }}>{title}</h1>}
        {sub && <p className="mx-auto mt-3 max-w-lg text-[15px]" style={{ color: 'var(--muted)' }}>{sub}</p>}
        {children}
      </div>
    </div>
  );
}
