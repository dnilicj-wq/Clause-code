// Rebuilt; original source (21st.dev/@bidyut10/components/honey-ember-background) not reachable for free.
// Faithful in spirit: a slow amber glow field with rising, flickering embers. Base layer is the Paper
// mesh gradient in the preset metal ramp; embers are a light 2D canvas (≤90 sparks).
// For the amber-resin look use with obsidian-copper / a warm preset; it reads the preset either way.
import { useEffect, useRef, type ReactNode } from 'react';
import { meshGradientFragmentShader } from '@paper-design/shaders';
import { PaperShader } from '../_shared/PaperShader';
import { cssVar, fitCanvas, rgba, runLoop, toRGB } from '../_shared/loop';

type E = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; seed: number };

function Embers({ count = 70 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!;
    let W = 1, H = 1, hot: [number, number, number] = [255, 200, 120], warm = hot, light = false;
    const es: E[] = [];
    const spawn = (e?: E, anywhere = false): E => {
      const n = e ?? ({} as E);
      n.x = Math.random() * W; n.y = anywhere ? Math.random() * H : H + 10;
      n.vx = (Math.random() - 0.5) * 12; n.vy = -(18 + Math.random() * 40);
      n.r = 0.6 + Math.random() * 1.8; n.life = 0; n.max = 3 + Math.random() * 5; n.seed = Math.random() * 100;
      return n;
    };
    const setup = () => {
      ({ w: W, h: H } = fitCanvas(c, ctx));
      hot = toRGB(cssVar(c, '--accent2')); warm = toRGB(cssVar(c, '--accent'));
      const bg = toRGB(cssVar(c, '--bg')); light = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) / 255 > 0.6;
      const n = Math.round(count * Math.min(1, (W * H) / (900 * 500)) + 18);
      es.length = 0; for (let i = 0; i < n; i++) { const e = spawn(undefined, true); e.life = Math.random() * e.max; es.push(e); }
    };
    setup();
    const ro = new ResizeObserver(setup); ro.observe(c.parentElement!);
    const draw = (dt: number, t: number) => {
      ctx.clearRect(0, 0, W, H);
      // Dark presets: additive glow (the original look). Light presets: additive light vanishes into the
      // background and soft halos read as blobs, so draw crisp sparks with a short trail instead.
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
      for (const e of es) {
        e.life += dt;
        if (e.life > e.max || e.y < -10) spawn(e);
        const px = e.x, py = e.y;
        e.x += (e.vx + Math.sin(t * 1.3 + e.seed) * 10) * dt; e.y += e.vy * dt;
        const k = e.life / e.max, fade = Math.sin(Math.PI * Math.min(1, k)) * (0.6 + 0.4 * Math.sin(t * 9 + e.seed * 7));
        if (light) {
          const tx = e.x - (e.x - px) * 9, ty = e.y - (e.y - py) * 9;
          const lg = ctx.createLinearGradient(e.x, e.y, tx, ty);
          lg.addColorStop(0, rgba(warm, 0.85 * fade)); lg.addColorStop(1, rgba(warm, 0));
          ctx.strokeStyle = lg; ctx.lineWidth = e.r * 1.1; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.fillStyle = rgba(warm, 0.95 * fade); ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 0.9, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        g.addColorStop(0, rgba(hot, 0.9 * fade)); g.addColorStop(0.35, rgba(warm, 0.35 * fade)); g.addColorStop(1, rgba(warm, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    const stop = runLoop(c, draw);
    return () => { stop(); ro.disconnect(); };
  }, [count]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0" />;
}

export function HoneyEmberBackground({ children, embers = 70, className = '' }: { children?: ReactNode; embers?: number; className?: string }) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} style={{ background: 'var(--bg)' }}>
      <PaperShader shader={meshGradientFragmentShader} speed={0.25} uniforms={{
        u_colors: ['var(--bg)', 'var(--metal0)', 'var(--accent)', 'var(--bg)', 'var(--metal1)'], u_colorsCount: 5,
        u_distortion: 0.8, u_swirl: 0.35, u_grainMixer: 0, u_grainOverlay: 0,
      }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 110%, transparent 30%, color-mix(in srgb, var(--bg) 70%, transparent) 100%)' }} />
      <Embers count={embers} />
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}
