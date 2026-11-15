import { useMemo, useRef, useState } from 'react';
import { useCanvasLoop, useIdle, prefersReduced, loadImage, hexToRgb, rgb } from '../_shared/canvas';
import { Chip, Tag, Ghost } from '../_shared/ui';

// Spill test (illustration): one tap spills on both halves at once. On bare concrete the liquid spreads,
// soaks in and leaves a stain; on the sealed resin it sits up in beads and a cloth wipes it clean.
export type Liquid = { key: string; name: string; colour: string; alpha: number; bleach?: boolean };
export const liquids: Liquid[] = [
  { key: 'oil', name: 'Engine oil', colour: '#2B1A0B', alpha: 0.9 },
  { key: 'brake', name: 'Brake fluid', colour: '#B98A2E', alpha: 0.7 },
  { key: 'bleach', name: 'Bleach', colour: '#EAF3F5', alpha: 0.35, bleach: true },
];

type Bare = { x: number; y: number; R: number; t: number; shape: number[]; l: Liquid };
type Bead = { dx: number; dy: number; r: number; gone: boolean };
type Coat = { x: number; y: number; R: number; t: number; beads: Bead[]; l: Liquid; wipe: number };

const RESIN = '#5F6469';
// smooth organic outline: a few low-frequency waves around the circle (no spikes)
const blob = (n: number) => {
  const p = [0, 0, 0, 0].map(() => Math.random() * 6.28);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return 1 + 0.16 * Math.sin(2 * a + p[0]) + 0.1 * Math.sin(3 * a + p[1]) + 0.06 * Math.sin(5 * a + p[2]) + 0.035 * Math.sin(8 * a + p[3]);
  });
};

export function SpillTest({ className = '' }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [liq, setLiq] = useState(liquids[0].key);
  const liqRef = useRef(liq); liqRef.current = liq;
  const reduced = useMemo(prefersReduced, []);
  const coarse = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(pointer:coarse)').matches, []);
  const st = useRef({
    w: 0, h: 0, dpr: 1, tex: null as HTMLImageElement | null, stains: null as HTMLCanvasElement | null,
    bare: [] as Bare[], coat: [] as Coat[], count: 0, auto: 0, fresh: 0,
  });

  // concrete texture (falls back to a drawn slab until it loads)
  useMemo(() => { loadImage('/demo/tex-slab-v1.webp').then((i) => { st.current.tex = i; wake(); }).catch(() => {}); }, []); // eslint-disable-line

  const newStains = () => {
    const s = st.current; const c = document.createElement('canvas');
    c.width = Math.round(s.w * s.dpr); c.height = Math.round(s.h * s.dpr); c.getContext('2d')!.scale(s.dpr, s.dpr);
    s.stains = c;
  };

  const spill = (fx: number, fy: number) => {
    const s = st.current; if (!s.w) return;
    const l = liquids.find((x) => x.key === liqRef.current)!;
    const half = s.w / 2, R = Math.min(half * 0.32, s.h * 0.17) * (0.9 + Math.random() * 0.2);
    const rx = Math.max(R * 1.1, Math.min(half - R * 1.1, fx * half)), y = Math.max(R * 1.2, Math.min(s.h - R * 1.6, fy * s.h));
    s.bare.push({ x: rx, y, R, t: 0, shape: blob(48), l });
    const n = 10 + ((Math.random() * 8) | 0);
    const beads: Bead[] = Array.from({ length: n }, (_, i) => {
      const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * R * 0.62;
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.85, r: R * (i < 2 ? 0.2 + Math.random() * 0.08 : 0.05 + Math.random() * 0.12), gone: false };
    });
    s.coat.push({ x: half + rx, y, R, t: 0, beads, l, wipe: -1 });
    s.count++;
    wake();
  };

  const wake = useCanvasLoop(cv, ({ ctx, w, h, dt }) => {
    const s = st.current; if (!w) return;
    if (!s.stains) newStains();
    const half = w / 2;
    const k = reduced ? 50 : 1;

    // ---- bare concrete (left) ----
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, half, h); ctx.clip();
    if (s.tex) {
      const iw = s.tex.width, ih = s.tex.height, sc = Math.max(half / iw, h / ih) * 1.15;
      ctx.drawImage(s.tex, (half - iw * sc) / 2, (h - ih * sc) / 2, iw * sc, ih * sc);
    } else { ctx.fillStyle = '#9C978F'; ctx.fillRect(0, 0, half, h); }
    const dull = ctx.createLinearGradient(0, 0, 0, h); dull.addColorStop(0, 'rgba(255,255,255,.04)'); dull.addColorStop(1, 'rgba(0,0,0,.22)');
    ctx.fillStyle = dull; ctx.fillRect(0, 0, half, h);
    if (s.stains) ctx.drawImage(s.stains, 0, 0, w, h);
    // spills spreading + soaking in
    for (let i = s.bare.length - 1; i >= 0; i--) {
      const b = s.bare[i]; b.t += dt * k;
      const spread = 1 - Math.pow(1 - Math.min(1, b.t / 0.9), 3);
      const soak = Math.max(0, Math.min(1, (b.t - 1.0) / 1.6));
      const r = b.R * (0.25 + 0.95 * spread);
      drawStain(ctx, b, r, soak);
      if (soak < 1) drawPuddle(ctx, b, r, 1 - soak);
      if (soak >= 1) { const g = s.stains!.getContext('2d')!; drawStain(g, b, r, 1); s.bare.splice(i, 1); }
    }
    ctx.restore();

    // ---- resin coated (right) ----
    ctx.save(); ctx.beginPath(); ctx.rect(half, 0, half, h); ctx.clip();
    ctx.fillStyle = RESIN; ctx.fillRect(half, 0, half, h);
    const gl = ctx.createLinearGradient(half, 0, w, h);
    gl.addColorStop(0, 'rgba(255,255,255,.16)'); gl.addColorStop(0.35, 'rgba(255,255,255,.02)'); gl.addColorStop(0.6, 'rgba(255,255,255,.08)'); gl.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = gl; ctx.fillRect(half, 0, half, h);
    // soft reflection of a strip light
    const lx = half + half * 0.62, rl = ctx.createLinearGradient(lx - half * 0.12, 0, lx + half * 0.12, 0);
    rl.addColorStop(0, 'rgba(255,255,255,0)'); rl.addColorStop(0.5, 'rgba(255,255,255,.13)'); rl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rl; ctx.fillRect(half, 0, half, h);
    for (let i = s.coat.length - 1; i >= 0; i--) {
      const c = s.coat[i]; c.t += dt * k;
      const pop = Math.min(1, c.t / 0.35);
      if (c.t > 1.5 && c.wipe < 0) c.wipe = 0;
      if (c.wipe >= 0) c.wipe += dt * k / 0.9;
      const clothX = half - c.R * 1.4 + c.wipe * (half + c.R * 2.8);
      for (const b of c.beads) {
        if (c.wipe >= 0 && c.x + b.dx < clothX + c.R * 0.5) b.gone = true;
        if (!b.gone) drawBead(ctx, c.x + b.dx, c.y + b.dy, b.r * (0.4 + 0.6 * easeOutBack(pop)), c.l);
      }
      // clean gleam left behind the cloth
      if (c.wipe > 0) {
        const ga = 0.22 * Math.max(0, Math.min(1, c.wipe * 2)) * Math.max(0, 1 - (c.wipe - 0.8) * 1.4);
        if (ga > 0) {
          const gx = Math.min(clothX - c.R * 0.6, c.x), gr = ctx.createRadialGradient(gx, c.y, 0, gx, c.y, c.R * 1.1);
          gr.addColorStop(0, `rgba(255,255,255,${ga})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.save(); ctx.translate(gx, c.y); ctx.scale(1.4, 0.5); ctx.translate(-gx, -c.y); ctx.fillStyle = gr; ctx.fillRect(gx - c.R * 1.2, c.y - c.R * 1.2, c.R * 2.4, c.R * 2.4); ctx.restore();
        }
      }
      if (c.wipe >= 0 && c.wipe <= 1 && !reduced) drawCloth(ctx, clothX, c.y, c.R);
      if (c.wipe > 1.5) s.coat.splice(i, 1);
    }
    ctx.restore();

    // joint + labels
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(half - 1.5, 0, 3, h);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(half + 1.5, 0, 1, h);
    ctx.font = `600 ${Math.max(11, Math.round(w / 52))}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.textAlign = 'left'; ctx.fillText('BARE CONCRETE', 15, h - 11);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillText('BARE CONCRETE', 14, h - 12);
    ctx.textAlign = 'right'; ctx.fillText('RESIN COATED', w - 14, h - 12);

    // fresh slab crossfade after many stains (auto mode)
    if (s.fresh > 0) {
      s.fresh -= dt * 1.2;
      const g = s.stains!.getContext('2d')!; g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = `rgba(0,0,0,${Math.min(1, dt * 2.5)})`; g.fillRect(0, 0, w, h); g.restore();
    }
    return true;
  }, (w, h, dpr) => { const s = st.current; s.w = w; s.h = h; s.dpr = dpr; newStains(); s.bare = []; s.coat = []; });

  // idle → it spills itself, cycling the liquids
  useIdle(wrap, 2600, () => {
    const s = st.current; if (!s.w) return;
    s.auto++;
    if (s.auto % 13 !== 1) return; // ~every 3.2 s
    const i = (liquids.findIndex((l) => l.key === liqRef.current) + (s.count ? 1 : 0)) % liquids.length;
    liqRef.current = liquids[i].key; setLiq(liquids[i].key);
    if (s.count && s.count % 6 === 0) s.fresh = 1;
    spill(0.25 + Math.random() * 0.5, 0.25 + Math.random() * 0.45);
  });

  const onDown = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const half = r.width / 2;
    spill((x < half ? x : x - half) / half, y / r.height);
  };
  const reset = () => { const s = st.current; newStains(); s.bare = []; s.coat = []; s.count = 0; wake(); };

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)' }}>
        <canvas ref={cv} onPointerDown={onDown} className="block aspect-[4/5] w-full cursor-pointer touch-manipulation select-none sm:aspect-[16/10]"
          role="img" aria-label="Illustration: spills soak into bare concrete but bead up and wipe off a resin floor" />
        <div className="pointer-events-none absolute left-3 top-3 flex gap-2"><Tag>Illustration</Tag><Tag>Spill test</Tag></div>
        <div className="pointer-events-none absolute right-3 top-3 hidden rounded-full bg-black/40 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur-md sm:block">{coarse ? 'Tap to spill' : 'Click the floor to spill'}</div>
      </div>
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {liquids.map((l) => <Chip key={l.key} on={l.key === liq} onClick={() => { setLiq(l.key); liqRef.current = l.key; spill(0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.35); }} swatch={l.colour}>{l.name}</Chip>)}
        <span className="ml-auto" /><Ghost onClick={reset}>Reset</Ghost>
      </div>
      <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>Bare concrete is porous, so spills soak in and stain. A sealed resin floor keeps them on the surface, ready to wipe up.</p>
    </div>
  );
}

const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

function shapePath(ctx: CanvasRenderingContext2D, b: Bare, r: number) {
  ctx.beginPath();
  b.shape.forEach((q, i) => {
    const a = (i / b.shape.length) * Math.PI * 2, px = b.x + Math.cos(a) * r * q, py = b.y + Math.sin(a) * r * q * 0.86;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.closePath();
}
function drawStain(ctx: CanvasRenderingContext2D, b: Bare, r: number, a: number) {
  if (a <= 0) return;
  const c = hexToRgb(b.l.colour);
  ctx.save();
  ctx.filter = 'blur(1.5px)';
  if (b.l.bleach) {
    // bleach lifts the colour out of the concrete: a faint pale patch with a brighter tide line
    shapePath(ctx, b, r); ctx.fillStyle = `rgba(255,255,248,${0.14 * a})`; ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.3 * a})`; ctx.lineWidth = Math.max(1.5, r * 0.04); ctx.stroke();
  } else {
    ctx.globalCompositeOperation = 'multiply';
    shapePath(ctx, b, r); ctx.fillStyle = rgb(c, 0.42 * a); ctx.fill();
    // darker tide mark where the liquid stopped spreading
    ctx.strokeStyle = rgb(c, 0.5 * a); ctx.lineWidth = Math.max(1.5, r * 0.05); ctx.stroke();
    // uneven soak: darker where it pooled
    const g = ctx.createRadialGradient(b.x + r * 0.15, b.y + r * 0.1, 0, b.x, b.y, r * 0.8);
    g.addColorStop(0, rgb(c, 0.25 * a)); g.addColorStop(1, rgb(c, 0));
    ctx.fillStyle = g; ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2);
  }
  ctx.restore();
}
function drawPuddle(ctx: CanvasRenderingContext2D, b: Bare, r: number, a: number) {
  const c = hexToRgb(b.l.colour);
  ctx.save(); ctx.globalAlpha = a;
  shapePath(ctx, b, r); ctx.fillStyle = rgb(c, b.l.alpha); ctx.fill();
  // wet gloss on the surface of the puddle
  const hg = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, 0, b.x - r * 0.35, b.y - r * 0.35, r * 0.7);
  hg.addColorStop(0, 'rgba(255,255,255,.35)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save(); shapePath(ctx, b, r); ctx.clip(); ctx.fillStyle = hg; ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2); ctx.restore();
  shapePath(ctx, b, r); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}
function drawBead(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, l: Liquid) {
  if (r <= 0.5) return;
  const c = hexToRgb(l.colour);
  // contact shadow
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x + r * 0.22, y + r * 0.3, r * 1.04, r * 0.84, 0, 0, Math.PI * 2); ctx.fill();
  // body: domed, darker at the rim
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  if (l.bleach) { g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(0.75, 'rgba(220,235,240,.12)'); g.addColorStop(1, 'rgba(30,40,45,.45)'); }
  else { g.addColorStop(0, rgb(c.map((v) => Math.min(255, v * 1.5 + 20)) as any, l.alpha * 0.75)); g.addColorStop(0.75, rgb(c, l.alpha * 0.85)); g.addColorStop(1, rgb(c.map((v) => v * 0.5) as any, l.alpha)); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  // specular highlight + rim light
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x - r * 0.32, y - r * 0.36, r * 0.2, r * 0.11, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.42, r * 0.32, r * 0.12, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r * 0.92, 0.2, 1.6); ctx.stroke();
}
function drawCloth(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
  const cw = R * 1.3, ch = R * 1.9;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; roundRect(ctx, -cw / 2 + 6, -ch / 2 + 8, cw, ch, R * 0.25); ctx.fill();
  const g = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
  g.addColorStop(0, '#5C8FD6'); g.addColorStop(1, '#2F5FA8');
  ctx.fillStyle = g; roundRect(ctx, -cw / 2, -ch / 2, cw, ch, R * 0.25); ctx.fill();
  // microfibre weave
  ctx.save(); roundRect(ctx, -cw / 2, -ch / 2, cw, ch, R * 0.25); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
  for (let i = -ch; i < ch; i += 5) { ctx.beginPath(); ctx.moveTo(-cw, i); ctx.lineTo(cw, i + cw * 0.4); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.2; roundRect(ctx, -cw / 2 + 4, -ch / 2 + 4, cw - 8, ch - 8, R * 0.2); ctx.stroke();
  ctx.restore();
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export default SpillTest;
