import { useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasLoop, useIdle, prefersReduced, lowPower, cssVar, hexToRgb, mix, rgb } from '../_shared/canvas';
import { Chip, Tag, Ghost } from '../_shared/ui';

// Flake broadcast: tap or click to throw a handful of flakes. They tumble, scatter and settle into the
// wet base coat; the visitor picks the blend. Idle → it broadcasts itself. Reduced motion → flakes land instantly.
export type Blend = { key: string; name: string; base: string; flakes: string[]; weights?: number[] };

export const defaultBlends: Blend[] = [
  { key: 'graphite', name: 'Graphite', base: '#2B2C2E', flakes: ['#121314', '#5F6266', '#BFC3C7', '#ECEBE7'], weights: [0.34, 0.3, 0.24, 0.12] },
  { key: 'domino', name: 'Domino', base: '#3A3B3D', flakes: ['#0D0D0E', '#F3F2EF', '#8A8C8F'], weights: [0.45, 0.35, 0.2] },
  { key: 'sandstone', name: 'Sandstone', base: '#8A7C6A', flakes: ['#4E3F31', '#C7B497', '#EEE5D4', '#2A231D'], weights: [0.3, 0.32, 0.26, 0.12] },
  { key: 'brand', name: 'Brand colours', base: 'var(--metal0)', flakes: ['var(--metal0)', 'var(--metal1)', 'var(--metal2)', 'var(--accent)'], weights: [0.25, 0.35, 0.25, 0.15] },
];

type Flake = { x: number; y: number; z: number; vx: number; vy: number; vz: number; rot: number; vr: number; spin: number; vs: number; shape: number[]; col: string; lit: string };

function shapeFor(r: number) {
  const n = 5 + ((Math.random() * 3) | 0), pts: number[] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.random() * 0.6; const rr = r * (0.55 + Math.random() * 0.6); pts.push(Math.cos(a) * rr, Math.sin(a) * rr * (0.7 + Math.random() * 0.5)); }
  return pts;
}
function poly(ctx: CanvasRenderingContext2D, s: number[], sx = 1, sy = 1) {
  ctx.beginPath(); ctx.moveTo(s[0] * sx, s[1] * sy);
  for (let i = 2; i < s.length; i += 2) ctx.lineTo(s[i] * sx, s[i + 1] * sy);
  ctx.closePath();
}
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export function FlakeBroadcast({ blends = defaultBlends, className = '' }: { blends?: Blend[]; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [blendKey, setBlendKey] = useState(blends[0].key);
  const blend = blends.find((b) => b.key === blendKey) || blends[0];
  const reduced = useMemo(prefersReduced, []);
  const lite = useMemo(lowPower, []);
  const coarse = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(pointer:coarse)').matches, []);

  const st = useRef({
    w: 0, h: 0, dpr: 1, base: null as HTMLCanvasElement | null, set: null as HTMLCanvasElement | null, fade: null as HTMLCanvasElement | null, fadeA: 0,
    air: [] as Flake[], ripples: [] as { x: number; y: number; t: number }[], settled: 0, palette: [] as { c: string; lit: string; w: number }[], baseCol: '#333', autoT: 0, seeded: false,
  });

  // Resolve colours (CSS vars allowed) whenever the blend or preset changes.
  const resolve = () => {
    const el = wrap.current; if (!el) return;
    const get = (c: string) => (c.startsWith('var(') ? cssVar(el, c.slice(4, -1)) : c);
    const s = st.current;
    const ws = blend.weights || blend.flakes.map(() => 1 / blend.flakes.length);
    s.palette = blend.flakes.map((c, i) => { const r = hexToRgb(get(c)); return { c: rgb(r), lit: rgb(mix(r, [255, 255, 255], 0.35)), w: ws[i] }; });
    s.baseCol = get(blend.base);
  };

  const pickCol = () => {
    const p = st.current.palette; let r = Math.random(), acc = 0;
    for (const x of p) { acc += x.w; if (r <= acc) return x; }
    return p[p.length - 1];
  };

  const paintBase = () => {
    const s = st.current; if (!s.w) return;
    const mk = () => { const c = document.createElement('canvas'); c.width = Math.round(s.w * s.dpr); c.height = Math.round(s.h * s.dpr); return c; };
    const b = mk(), g = b.getContext('2d')!; g.scale(s.dpr, s.dpr);
    const base = hexToRgb(s.baseCol);
    g.fillStyle = rgb(base); g.fillRect(0, 0, s.w, s.h);
    // gentle mottling so the wet coat never reads as a flat fill
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * s.w, y = Math.random() * s.h, r = 40 + Math.random() * 160;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      const tone = Math.random() < 0.5 ? mix(base, [0, 0, 0], 0.18) : mix(base, [255, 255, 255], 0.07);
      gr.addColorStop(0, rgb(tone, 0.35)); gr.addColorStop(1, rgb(tone, 0));
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // vignette = depth
    const v = g.createRadialGradient(s.w * 0.5, s.h * 0.45, Math.min(s.w, s.h) * 0.2, s.w * 0.5, s.h * 0.5, Math.max(s.w, s.h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
    g.fillStyle = v; g.fillRect(0, 0, s.w, s.h);
    s.base = b;
    s.set = mk(); s.set.getContext('2d')!.scale(s.dpr, s.dpr);
    s.settled = 0;
  };

  const settle = (f: Flake) => {
    const s = st.current; const g = s.set?.getContext('2d'); if (!g) return;
    g.save(); g.translate(f.x, f.y); g.rotate(f.rot);
    g.fillStyle = 'rgba(0,0,0,.28)'; poly(g, f.shape, 1.08, 1.08); g.fill(); // tiny sink shadow
    g.fillStyle = f.col; poly(g, f.shape); g.fill();
    g.restore();
    s.settled++;
  };

  const throwAt = (x: number, y: number, instant = false) => {
    const s = st.current; if (!s.w) return;
    const n = Math.round((lite ? 90 : 190) * Math.min(1.4, Math.max(0.7, s.w / 640)));
    const k = Math.min(s.w, s.h);
    const rBase = Math.max(3, k / 92);
    for (let i = 0; i < n; i++) {
      const pc = pickCol();
      const a = Math.random() * Math.PI * 2, sp = (0.15 + Math.abs(gauss())) * k * 0.9;
      const f: Flake = {
        x: x + gauss() * 6, y: y + gauss() * 6, z: k * (0.12 + Math.random() * 0.12),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8, vz: k * (0.25 + Math.random() * 0.5),
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 14, spin: Math.random() * 6.28, vs: 8 + Math.random() * 16,
        shape: shapeFor(rBase * (0.7 + Math.random() * 0.9)), col: pc.c, lit: pc.lit,
      };
      if (instant || reduced) {
        const T = 0.5 + Math.random() * 0.3; // where it would have landed
        f.x += f.vx * T * 0.55; f.y += f.vy * T * 0.55; settle(f);
      } else s.air.push(f);
    }
    if (!instant && !reduced) s.ripples.push({ x, y, t: 0 });
  };

  const seedHalf = (w: number, h: number) => {
    const k = Math.min(w, h), rBase = Math.max(3, k / 92);
    const area = Math.PI * (rBase * 0.75) ** 2;
    const n = Math.min(lite ? 2600 : 7000, Math.round((1.5 * w * h * 0.5) / area));
    for (let i = 0; i < n; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const edge = w * (0.46 + 0.06 * Math.sin((y / h) * 5.2)) + gauss() * w * 0.06;
      if (x > edge) continue;
      const pc = pickCol();
      settle({ x, y, z: 0, vx: 0, vy: 0, vz: 0, rot: Math.random() * 6.28, vr: 0, spin: 0, vs: 0, shape: shapeFor(rBase * (0.7 + Math.random() * 0.9)), col: pc.c, lit: pc.lit });
    }
  };

  const repour = (seed = false) => {
    const s = st.current; if (!s.w) return;
    // keep a snapshot of the old floor and fade it out over the fresh base
    const snap = document.createElement('canvas'); snap.width = cv.current!.width; snap.height = cv.current!.height;
    snap.getContext('2d')!.drawImage(cv.current!, 0, 0);
    s.fade = snap; s.fadeA = reduced ? 0 : 1; s.air = [];
    resolve(); paintBase(); if (seed) s.seeded = false;
    wake();
  };

  const wake = useCanvasLoop(cv, ({ ctx, w, h, t, dt }) => {
    const s = st.current;
    if (!s.base) return;
    if (!s.seeded) {
      s.seeded = true;
      // half the floor already broadcast to refusal, the other half still wet: the card is never empty
      seedHalf(w, h);
    }
    ctx.drawImage(s.base, 0, 0, w, h);
    if (s.set) ctx.drawImage(s.set, 0, 0, w, h);
    // airborne flakes
    const g = 1.6 * Math.min(w, h);
    const drag = Math.exp(-2.4 * dt);
    for (let i = s.air.length - 1; i >= 0; i--) {
      const f = s.air[i];
      f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= drag; f.vy *= drag;
      f.vz -= g * dt; f.z += f.vz * dt; f.rot += f.vr * dt; f.spin += f.vs * dt;
      if (f.z <= 0) { settle(f); s.air.splice(i, 1); continue; }
      const lift = f.z * 0.55, sc = 1 + f.z / (Math.min(w, h) * 0.9);
      // shadow on the floor
      ctx.save(); ctx.translate(f.x + lift * 0.25, f.y + lift * 0.1); ctx.rotate(f.rot);
      ctx.fillStyle = `rgba(0,0,0,${Math.max(0.05, 0.35 - f.z / 300)})`; poly(ctx, f.shape, 1, Math.abs(Math.cos(f.spin)) * 0.9 + 0.1); ctx.fill();
      ctx.restore();
      // the flake, tumbling
      ctx.save(); ctx.translate(f.x, f.y - lift); ctx.rotate(f.rot);
      const flip = Math.cos(f.spin);
      ctx.fillStyle = flip > 0 ? f.col : f.lit; poly(ctx, f.shape, sc, sc * (Math.abs(flip) * 0.9 + 0.1)); ctx.fill();
      ctx.restore();
    }
    // throw ripples in the wet coat
    for (let i = s.ripples.length - 1; i >= 0; i--) {
      const r = s.ripples[i]; r.t += dt; if (r.t > 0.9) { s.ripples.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(255,255,255,${0.22 * (1 - r.t / 0.9)})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, 10 + r.t * 90, (10 + r.t * 90) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // old floor fading out after a re-pour
    if (s.fade && s.fadeA > 0) {
      s.fadeA -= dt * 1.8;
      ctx.globalAlpha = Math.max(0, s.fadeA); ctx.drawImage(s.fade, 0, 0, w, h); ctx.globalAlpha = 1;
      if (s.fadeA <= 0) s.fade = null;
    }
    // wet gloss: a soft reflection band drifting across the coat
    if (!reduced) {
      const p = ((t * 0.07) % 1.6) - 0.3;
      const gx = p * w;
      const gr = ctx.createLinearGradient(gx - w * 0.3, 0, gx + w * 0.3, h * 0.6);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.075)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    }
    const sx = w * (0.62 + 0.04 * Math.sin(t * 0.3)), sy = h * 0.22;
    const sp = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.28);
    sp.addColorStop(0, 'rgba(255,255,255,.16)'); sp.addColorStop(0.4, 'rgba(255,255,255,.05)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save(); ctx.translate(sx, sy); ctx.scale(1.8, 0.45); ctx.translate(-sx, -sy); ctx.fillStyle = sp; ctx.fillRect(sx - w * 0.3, sy - w * 0.3, w * 0.6, w * 0.6); ctx.restore();
    const top = ctx.createLinearGradient(0, 0, 0, h);
    top.addColorStop(0, 'rgba(255,255,255,.07)'); top.addColorStop(0.35, 'rgba(255,255,255,0)');
    ctx.fillStyle = top; ctx.fillRect(0, 0, w, h);
    return !reduced || s.air.length > 0 || s.fadeA > 0;
  }, (w, h, dpr) => {
    const s = st.current; s.w = w; s.h = h; s.dpr = dpr; resolve(); paintBase(); s.seeded = false;
  });

  // blend change → re-pour
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } repour(true); }, [blendKey]); // eslint-disable-line

  // idle → it broadcasts itself; floor gets re-poured once it is well covered
  useIdle(wrap, 2400, () => {
    const s = st.current; if (!s.w || reduced) return;
    s.autoT++;
    if (s.autoT % 4 !== 0) return; // ~1 throw per second
    if (s.autoT > 4 * 14) { s.autoT = 0; repour(); return; } // ~14 throws, then a fresh pour
    throwAt(s.w * (0.15 + Math.random() * 0.7), s.h * (0.2 + Math.random() * 0.6));
    wake();
  });

  const onDown = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    throwAt(e.clientX - r.left, e.clientY - r.top);
    wake();
  };

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)' }}>
        <canvas ref={cv} onPointerDown={onDown} className="block aspect-[4/5] w-full cursor-crosshair touch-manipulation select-none sm:aspect-[16/10]" aria-label="Flake broadcast: tap the floor to throw flakes" role="img" />
        <div className="pointer-events-none absolute left-3 top-3 flex gap-2"><Tag>Flake broadcast</Tag></div>
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur-md">{coarse ? 'Tap the wet floor to throw flakes' : 'Click the wet floor to throw flakes'}</div>
      </div>
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {blends.map((b) => <Chip key={b.key} on={b.key === blendKey} onClick={() => setBlendKey(b.key)} swatch={b.flakes[2] || b.flakes[0]}>{b.name}</Chip>)}
        <span className="ml-auto" />
        <Ghost onClick={() => repour()}>Re-pour</Ghost>
      </div>
    </div>
  );
}
export default FlakeBroadcast;
