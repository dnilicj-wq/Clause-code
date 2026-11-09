import { useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasLoop, useIdle, prefersReduced, lowPower, cssVar, hexToRgb, mix, rgb } from '../_shared/canvas';
import { Chip, Tag, Ghost } from '../_shared/ui';

// Metallic swirl painter: the cursor (or a finger swipe) drags metallic pigment through a wet base,
// leaving the striated, light-catching swirls a metallic epoxy floor has. Doubles as a colour picker.
// Idle → an invisible hand keeps swirling and older swirls slowly settle back into the base.
export type Metal = { key: string; name: string; base: string; metal: string };
export const defaultMetals: Metal[] = [
  { key: 'copper', name: 'Copper', base: '#140D09', metal: '#C98A57' },
  { key: 'pearl', name: 'Pearl', base: '#B9B3AA', metal: '#F7F2EA' },
  { key: 'midnight', name: 'Midnight', base: '#06080F', metal: '#4D6FA8' },
  { key: 'brand', name: 'Brand colour', base: 'var(--metal0)', metal: 'var(--metal1)' },
];

type C3 = [number, number, number];
type Pal = { base: C3; dark: C3; mid: C3; hi: C3 };

export function MetallicSwirl({ metals = defaultMetals, className = '', onPick }: { metals?: Metal[]; className?: string; onPick?: (m: Metal) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [key, setKey] = useState(metals[0].key);
  const metal = metals.find((m) => m.key === key) || metals[0];
  const reduced = useMemo(prefersReduced, []);
  const lite = useMemo(lowPower, []);
  const coarse = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(pointer:coarse)').matches, []);

  const st = useRef({
    w: 0, h: 0, dpr: 1, paint: null as HTMLCanvasElement | null, fade: null as HTMLCanvasElement | null, fadeA: 0,
    pal: null as Pal | null, dist: 0, last: null as null | { x: number; y: number }, hand: { a: Math.random() * 10, on: false, last: null as null | { x: number; y: number } },
    seeded: false, pointer: false,
  });

  const resolve = () => {
    const el = wrap.current; if (!el) return;
    const get = (c: string) => (c.startsWith('var(') ? cssVar(el, c.slice(4, -1)) : c);
    const base = hexToRgb(get(metal.base)), m = hexToRgb(get(metal.metal));
    st.current.pal = { base, dark: mix(base, m, 0.28), mid: m, hi: mix(m, [255, 255, 255], 0.5) };
  };

  const ramp = (p: Pal, t: number): C3 => (t < 0.5 ? mix(p.dark, p.mid, t * 2) : mix(p.mid, p.hi, (t - 0.5) * 2));

  const newPaint = () => {
    const s = st.current; if (!s.w || !s.pal) return;
    const c = document.createElement('canvas'); c.width = Math.round(s.w * s.dpr); c.height = Math.round(s.h * s.dpr);
    const g = c.getContext('2d')!; g.scale(s.dpr, s.dpr);
    g.fillStyle = rgb(s.pal.base); g.fillRect(0, 0, s.w, s.h);
    s.paint = c;
  };

  // The brush SMUDGES the wet coat (drags existing pigment along, like a roller or a gloved hand
  // through metallic epoxy) and feeds a little fresh pigment in the chosen colour into the pull.
  const brush = useRef<HTMLCanvasElement | null>(null);
  const smudgeStep = (a: { x: number; y: number }, b: { x: number; y: number }, R: number) => {
    const s = st.current; const P = s.paint; if (!P) return;
    const d = s.dpr, size = Math.ceil(R * 2 * d);
    let B = brush.current; if (!B || B.width !== size) { B = document.createElement('canvas'); B.width = B.height = size; brush.current = B; }
    const bg = B.getContext('2d')!;
    bg.globalCompositeOperation = 'copy';
    bg.drawImage(P, (a.x - R) * d, (a.y - R) * d, size, size, 0, 0, size, size);
    bg.globalCompositeOperation = 'destination-in';
    const m = bg.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.55, 'rgba(0,0,0,.7)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    bg.fillStyle = m; bg.fillRect(0, 0, size, size);
    const g = P.getContext('2d')!;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.9;
    g.drawImage(B, (b.x - R) * d, (b.y - R) * d); g.restore();
  };
  const stroke = (a: { x: number; y: number }, b: { x: number; y: number }, pressure = 1, pigment = true) => {
    const s = st.current; const g = s.paint?.getContext('2d'); const p = s.pal; if (!g || !p) return;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy); if (len < 0.5) return;
    const k = Math.min(s.w, s.h);
    const R = k * 0.085 * pressure;
    const steps = Math.max(1, Math.ceil(len / (R * 0.14)));
    for (let i = 1; i <= steps; i++) {
      const t0 = (i - 1) / steps, t1 = i / steps;
      smudgeStep({ x: a.x + dx * t0, y: a.y + dy * t0 }, { x: a.x + dx * t1, y: a.y + dy * t1 }, R);
    }
    if (pigment) {
      const nx = -dy / len, ny = dx / len, N = lite ? 4 : 7;
      g.lineCap = 'round';
      for (let i = 0; i < N; i++) {
        const f = (i / (N - 1) - 0.5) * 1.3 + Math.sin(s.dist * 0.03 + i * 1.9) * 0.25;
        const o = f * R * 0.8;
        const tone = 0.5 + 0.5 * Math.sin(i * 2.31 + s.dist * 0.01);
        g.strokeStyle = rgb(ramp(p, tone), 0.05 + 0.1 * tone);
        g.lineWidth = 1 + (i % 3) * 0.8;
        g.beginPath(); g.moveTo(a.x + nx * o, a.y + ny * o); g.lineTo(b.x + nx * o, b.y + ny * o); g.stroke();
      }
    }
    s.dist += len;
  };

  // Pigment field: soft light/dark clouds plus fine bright "lacing" veins, then a few swirls dragged through it.
  const field = (count = 1) => {
    const s = st.current; const g = s.paint?.getContext('2d'); const p = s.pal; if (!g || !p) return;
    const k = Math.min(s.w, s.h);
    for (let i = 0; i < 46 * count; i++) {
      const x = Math.random() * s.w, y = Math.random() * s.h, r = k * (0.06 + Math.random() * 0.22);
      const c = ramp(p, Math.random() < 0.5 ? Math.random() * 0.25 : 0.45 + Math.random() * 0.55);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, rgb(c, 0.25 + Math.random() * 0.35)); gr.addColorStop(1, rgb(c, 0));
      // stretched, rotated clouds read as flowing pigment rather than bubbles
      g.save(); g.translate(x, y); g.rotate(Math.random() * 3.14); g.scale(1.8 + Math.random() * 1.6, 0.45 + Math.random() * 0.3);
      g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2); g.restore();
    }
    g.lineCap = 'round';
    for (let i = 0; i < 16 * count; i++) {
      let x = Math.random() * s.w, y = Math.random() * s.h, a = Math.random() * 6.28, va = (Math.random() - 0.5) * 0.12;
      g.strokeStyle = rgb(Math.random() < 0.75 ? p.hi : p.dark, 0.18 + Math.random() * 0.22); g.lineWidth = 0.5 + Math.random() * 0.9;
      g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 40; j++) { va += (Math.random() - 0.5) * 0.03; a += va; x += Math.cos(a) * k * 0.018; y += Math.sin(a) * k * 0.018; g.lineTo(x, y); }
      g.stroke();
    }
  };
  const seed = () => {
    const s = st.current; if (!s.w) return;
    field();
    for (let j = 0; j < 5; j++) {
      let prev: { x: number; y: number } | null = null;
      const ph = Math.random() * 6, cx = s.w * (0.15 + Math.random() * 0.7), cy = s.h * (0.2 + Math.random() * 0.6);
      for (let t = 0; t < 6.2; t += 0.05) {
        const pt = { x: cx + Math.sin(t + ph) * s.w * 0.22 * (0.6 + t / 10), y: cy + Math.cos(t + ph) * s.h * 0.26 * (0.6 + t / 10) };
        if (prev) stroke(prev, pt, 0.8, false);
        prev = pt;
      }
    }
  };

  const repour = (withSeed: boolean) => {
    const s = st.current; if (!s.w || !cv.current) return;
    const snap = document.createElement('canvas'); snap.width = cv.current.width; snap.height = cv.current.height;
    snap.getContext('2d')!.drawImage(cv.current, 0, 0);
    s.fade = snap; s.fadeA = reduced ? 0 : 1;
    resolve(); newPaint(); if (withSeed) seed();
    wake();
  };

  const wake = useCanvasLoop(cv, ({ ctx, w, h, t, dt }) => {
    const s = st.current; if (!s.paint || !s.pal) return;
    if (!s.seeded) { s.seeded = true; seed(); }
    // invisible hand when idle
    if (s.hand.on && !reduced) {
      s.hand.a += dt * 0.9;
      const a = s.hand.a;
      const pt = { x: w * (0.5 + 0.36 * Math.sin(a * 0.83) + 0.08 * Math.sin(a * 2.7)), y: h * (0.5 + 0.34 * Math.sin(a * 1.21 + 1.3) + 0.06 * Math.cos(a * 3.3)) };
      if (s.hand.last) stroke(s.hand.last, pt, 0.8);
      s.hand.last = pt;
      // keep the floor lively: now and then a fresh drop of pigment lands for the hand to drag
      if (Math.random() < dt * 0.5) field(0.08);
    }
    ctx.drawImage(s.paint, 0, 0, w, h);
    if (s.fade && s.fadeA > 0) {
      s.fadeA -= dt * 1.6; ctx.globalAlpha = Math.max(0, s.fadeA); ctx.drawImage(s.fade, 0, 0, w, h); ctx.globalAlpha = 1;
      if (s.fadeA <= 0) s.fade = null;
    }
    // sheen: light sliding across the metallic pigment (overlay brightens the strands, not the base)
    const p = reduced ? 0.45 : ((t * 0.06) % 1.5) - 0.25;
    const gx = p * w;
    const gr = ctx.createLinearGradient(gx - w * 0.35, 0, gx + w * 0.35, h);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.28)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    // glossy topcoat: soft ceiling-light reflection + top falloff + vignette
    const sx = w * 0.3, sy = h * 0.18, sp = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.3);
    sp.addColorStop(0, 'rgba(255,255,255,.12)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save(); ctx.translate(sx, sy); ctx.scale(1.9, 0.4); ctx.translate(-sx, -sy); ctx.fillStyle = sp; ctx.fillRect(sx - w * 0.3, sy - w * 0.3, w * 0.6, w * 0.6); ctx.restore();
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    return !reduced || s.fadeA > 0;
  }, (w, h, dpr) => {
    const s = st.current; s.w = w; s.h = h; s.dpr = dpr; resolve(); newPaint(); s.seeded = false;
  });

  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } repour(true); onPick?.(metal); }, [key]); // eslint-disable-line

  useIdle(wrap, 1800, () => { const s = st.current; if (!s.hand.on && !reduced) { s.hand.on = true; s.hand.last = null; wake(); } });

  const at = (e: React.PointerEvent) => { const r = cv.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current; s.hand.on = false;
    if (e.pointerType !== 'mouse' && !s.pointer) return; // touch paints only while down
    const p = at(e);
    if (s.last) stroke(s.last, p, 1);
    s.last = p; wake();
  };
  const onDown = (e: React.PointerEvent) => { const s = st.current; s.pointer = true; s.hand.on = false; s.last = at(e); };
  const onUp = () => { const s = st.current; s.pointer = false; if (true) s.last = null; };

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)' }}>
        <canvas ref={cv} onPointerMove={onMove} onPointerDown={onDown} onPointerUp={onUp} onPointerLeave={onUp} onPointerCancel={onUp}
          className="block aspect-[4/5] w-full cursor-crosshair select-none sm:aspect-[16/10]" style={{ touchAction: 'pan-y' }}
          aria-label="Metallic swirl painter: move across the floor to swirl metallic pigment" role="img" />
        <div className="pointer-events-none absolute left-3 top-3"><Tag>Metallic epoxy</Tag></div>
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur-md">{coarse ? 'Swipe sideways to swirl' : 'Move across the floor to swirl'}</div>
      </div>
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {metals.map((m) => <Chip key={m.key} on={m.key === key} onClick={() => setKey(m.key)} swatch={`linear-gradient(135deg, ${m.base}, ${m.metal})`}>{m.name}</Chip>)}
        <span className="ml-auto" />
        <Ghost onClick={() => repour(false)}>Clear</Ghost>
      </div>
    </div>
  );
}
export default MetallicSwirl;
