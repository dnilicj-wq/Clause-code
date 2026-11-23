// Ported from 21st.dev/@bundui/components/fluid-particles-background. Source: library-inbox/fluid-particles-background.tsx.
// Same Perlin flow field + trail fade. Changes: sized to its container (not the window), DPR capped,
// particle colours from preset tokens (reads as flakes suspended in resin), count scales with area,
// noise built once, pauses offscreen, one still frame with reduced motion.
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/src/lib/cn';
import { cssVar, fitCanvas, rgba, runLoop, toRGB, prefersReduced } from '../_shared/loop';

function createNoise() {
  const perm = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  const p = new Array(512);
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = perm[i];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15, u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return lerp(w,
      lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
      lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
  };
}
const noise3 = createNoise();

type P = { x: number; y: number; size: number; life: number; maxLife: number; c: number };

export function FluidParticlesBackground({ children, density = 1, noiseIntensity = 0.003, particleSize = { min: 0.5, max: 2.2 }, className }: {
  children?: ReactNode; density?: number; noiseIntensity?: number; particleSize?: { min: number; max: number }; className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!; const ctx = canvas.getContext('2d', { alpha: false })!;
    let W = 1, H = 1;
    const cols: [number, number, number][] = [];
    let bg: [number, number, number] = [0, 0, 0];
    let parts: P[] = [];
    const seed = () => {
      ({ w: W, h: H } = fitCanvas(canvas, ctx));
      bg = toRGB(cssVar(canvas, '--bg', '#000'));
      cols.length = 0; cols.push(toRGB(cssVar(canvas, '--accent2')), toRGB(cssVar(canvas, '--accent')), toRGB(cssVar(canvas, '--ink')), toRGB(cssVar(canvas, '--muted')));
      // original: 2000 particles on a full window; keep the same density per pixel, capped for phones
      const n = Math.min(2000, Math.round((W * H) / 1000 * density));
      parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min, life: Math.random() * 100, maxLife: 100 + Math.random() * 50, c: (Math.random() * cols.length) | 0 }));
      ctx.fillStyle = rgba(bg, 1); ctx.fillRect(0, 0, W, H);
    };
    seed();
    const ro = new ResizeObserver(seed); ro.observe(canvas.parentElement!);
    const draw = (_dt: number, t: number) => {
      ctx.fillStyle = rgba(bg, 0.12); ctx.fillRect(0, 0, W, H);
      const z = t * 0.1; // original: Date.now() * 0.0001 → seconds * 0.1
      for (const q of parts) {
        q.life += 1;
        if (q.life > q.maxLife) { q.life = 0; q.x = Math.random() * W; q.y = Math.random() * H; }
        const op = Math.sin((q.life / q.maxLife) * Math.PI) * 0.55; // original 0.15 on white/black; flakes need more body on colour
        const a = noise3(q.x * noiseIntensity, q.y * noiseIntensity, z) * Math.PI * 4;
        q.x += Math.cos(a) * 2; q.y += Math.sin(a) * 2;
        if (q.x < 0) q.x = W; if (q.x > W) q.x = 0; if (q.y < 0) q.y = H; if (q.y > H) q.y = 0;
        ctx.fillStyle = rgba(cols[q.c], op);
        ctx.beginPath(); ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2); ctx.fill();
      }
    };
    if (prefersReduced()) for (let i = 0; i < 40; i++) draw(0.016, i * 0.016);
    const stop = runLoop(canvas, draw);
    return () => { stop(); ro.disconnect(); };
  }, [density, noiseIntensity, particleSize.min, particleSize.max]);
  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)} style={{ background: 'var(--bg)' }}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      {children && <div className="relative z-10 flex h-full w-full items-center justify-center">{children}</div>}
    </div>
  );
}
