import { useMemo, useRef } from 'react';
import { useCanvasLoop, useIdle, prefersReduced, lowPower } from '../_shared/canvas';
import { Tag, Ghost } from '../_shared/ui';

// Hot-tyre test (illustration): park a hot tyre on two floors side by side, then drive it off.
// Floor paint lifts and sticks to the tread; the resin system stays put. Idle → it runs itself.
// Labelled "Illustration" on screen: it shows a known failure mode, not a measured test.
type Mark = { x: number; shape: number[]; flakes: { dx: number; dy: number; r: number; rot: number }[]; age: number };
type Gleam = { x: number; t: number };

const PAINT = '#5E666E', PAINT_HI = '#7D868F', CONCRETE = '#A9A49B', RESIN = '#3C4046';

function blob(n: number, jag: number) {
  const pts: number[] = [];
  for (let i = 0; i < n; i++) pts.push(1 - Math.random() * jag);
  return pts;
}

export function HotTyreTest({ className = '' }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const reduced = useMemo(prefersReduced, []);
  const lite = useMemo(lowPower, []);
  const coarse = useMemo(() => typeof matchMedia !== 'undefined' && matchMedia('(pointer:coarse)').matches, []);
  const st = useRef({
    w: 0, h: 0, x: 0, v: 0, target: 0, rot: 0, drag: false, dragOff: 0,
    dwell: 0, parkX: 0, parkSide: 0 as -1 | 0 | 1, heat: 0,
    marks: [] as Mark[], gleams: [] as Gleam[], stuck: [] as { a: number; r: number }[],
    auto: false, autoStep: 0, autoT: 0, init: false,
  });

  // The resin side uses the real flake texture so it reads as a finished resin floor, not a darker grey.
  const tex = useMemo(() => { if (typeof Image === 'undefined') return null; const i = new Image(); i.src = '/demo/tex-flake-v1.webp'; return i; }, []);
  const R = () => Math.min(st.current.w * (st.current.w < 520 ? 0.15 : 0.105), st.current.h * 0.17);
  const contactY = () => st.current.h * 0.74;
  const sideOf = (x: number) => (x < st.current.w * 0.47 ? -1 : x > st.current.w * 0.53 ? 1 : 0) as -1 | 0 | 1;

  const reset = () => { const s = st.current; s.marks = []; s.stuck = []; s.gleams = []; s.dwell = 0; s.heat = 0; wake(); };

  // auto script: onto paint → wait → off → onto resin → wait → off …
  const AUTO = [
    { to: 0.25, wait: 1.8 }, { to: 0.5, wait: 0.9 }, { to: 0.75, wait: 1.8 }, { to: 0.5, wait: 1.6 },
  ];

  const wake = useCanvasLoop(cv, ({ ctx, w, h, dt, t }) => {
    const s = st.current; if (!w) return;
    const r = R(), cy = contactY();
    if (!s.init) { s.init = true; s.x = s.target = w * 0.5; }

    // auto pilot
    if (s.auto && !s.drag) {
      s.autoT += dt;
      const step = AUTO[s.autoStep % AUTO.length];
      s.target = w * step.to;
      if (Math.abs(s.x - s.target) < 2 && s.autoT > step.wait + 0.8) {
        s.autoStep++; s.autoT = 0;
        if (s.autoStep % (AUTO.length * 2) === 0) { s.marks = []; s.stuck = []; } // keep the demo fresh
      }
    }
    // spring toward target (critically damped)
    const k = reduced ? 400 : 60, c = 2 * Math.sqrt(k);
    const a = k * (s.target - s.x) - c * s.v;
    s.v += a * dt; s.x += s.v * dt;
    s.x = Math.max(r * 1.05, Math.min(w - r * 1.05, s.x));
    s.rot += (s.v * dt) / r;

    // parking: heat builds while stationary on a floor
    const side = sideOf(s.x);
    const still = Math.abs(s.v) < 12;
    if (still && side !== 0) {
      if (s.parkSide !== side || Math.abs(s.parkX - s.x) > r * 0.5) { s.parkSide = side; s.parkX = s.x; s.dwell = 0; }
      s.dwell += dt;
    }
    s.heat += ((still && side !== 0 ? Math.min(1, s.dwell / 1.2) : 0) - s.heat) * Math.min(1, dt * (still ? 2 : 5));
    // driving off after a proper dwell leaves the result
    if (s.parkSide !== 0 && Math.abs(s.x - s.parkX) > r * 0.7) {
      if (s.dwell > 0.7) {
        if (s.parkSide === -1) {
          const n = 5 + ((Math.random() * 4) | 0);
          s.marks.push({ x: s.parkX, shape: blob(18, 0.35), age: 0, flakes: Array.from({ length: n }, () => ({ dx: (Math.random() - 0.5) * 1.6, dy: (Math.random() - 0.5) * 0.5, r: 0.06 + Math.random() * 0.08, rot: Math.random() * 6 })) });
          for (let i = 0; i < 5; i++) s.stuck.push({ a: Math.PI / 2 - s.rot + (Math.random() - 0.5) * 0.9, r: 0.1 + Math.random() * 0.12 });
          if (s.stuck.length > 18) s.stuck.splice(0, s.stuck.length - 18);
        } else s.gleams.push({ x: s.parkX, t: 0 });
      }
      s.parkSide = 0; s.dwell = 0;
    }

    // ---------- draw ----------
    const hz = h * 0.3; // horizon
    // wall
    const wall = ctx.createLinearGradient(0, 0, 0, hz);
    wall.addColorStop(0, '#0E0F11'); wall.addColorStop(1, '#1D1F22');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, w, hz);
    // a soft workshop light washing the wall
    const lw = ctx.createRadialGradient(w * 0.5, -hz * 0.2, 0, w * 0.5, -hz * 0.2, w * 0.6);
    lw.addColorStop(0, 'rgba(255,240,220,.10)'); lw.addColorStop(1, 'rgba(255,240,220,0)');
    ctx.fillStyle = lw; ctx.fillRect(0, 0, w, hz);
    ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = 1;
    for (let xx = w / 8; xx < w; xx += w / 8) { ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx, hz); ctx.stroke(); }
    // floors
    const mid = w / 2;
    const floor = (x0: number, x1: number, col: string, gloss: number, img?: HTMLImageElement | null) => {
      ctx.fillStyle = col; ctx.fillRect(x0, hz, x1 - x0, h - hz);
      if (img && img.complete && img.naturalWidth) {
        // fine, tiled flake broadcast, squashed vertically so it lies on the floor plane; toned down under a
        // dark resin glaze so it reads as a sealed flake floor, not a loud camouflage pattern
        const pat = ctx.createPattern(img, 'repeat');
        if (pat) {
          const k = Math.max(0.16, Math.min(0.3, (x1 - x0) / img.naturalWidth * 0.55));
          pat.setTransform(new DOMMatrix([k, 0, 0, k * 0.6, x0, hz]));
          ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = pat; ctx.fillRect(x0, hz, x1 - x0, h - hz); ctx.restore();
          ctx.fillStyle = 'rgba(28,30,34,.35)'; ctx.fillRect(x0, hz, x1 - x0, h - hz);
        }
      }
      const g = ctx.createLinearGradient(0, hz, 0, h);
      g.addColorStop(0, `rgba(255,255,255,${0.1 * gloss + 0.04})`); g.addColorStop(0.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
      ctx.fillStyle = g; ctx.fillRect(x0, hz, x1 - x0, h - hz);
      // window reflection streak on the floor
      const rx = (x0 + x1) / 2, rg = ctx.createLinearGradient(rx - (x1 - x0) * 0.2, 0, rx + (x1 - x0) * 0.2, 0);
      rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(0.5, `rgba(255,255,255,${0.11 * gloss})`); rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg; ctx.fillRect(x0, hz, x1 - x0, h - hz);
    };
    floor(0, mid, PAINT, 0.35);
    floor(mid, w, RESIN, 1, tex);
    // paint gets a faint roller texture so it reads as a coat of paint
    ctx.strokeStyle = 'rgba(255,255,255,.018)'; ctx.lineWidth = 1;
    for (let yy = hz + 6; yy < h; yy += 7) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(mid, yy + 2); ctx.stroke(); }
    // joint between the two floors
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(mid - 1.5, hz, 3, h - hz);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(mid + 1.5, hz, 1, h - hz);
    // skirting shadow
    const sk = ctx.createLinearGradient(0, hz, 0, hz + 18); sk.addColorStop(0, 'rgba(0,0,0,.5)'); sk.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sk; ctx.fillRect(0, hz, w, 18);

    // lifted paint marks
    for (const m of s.marks) {
      m.age += dt;
      const rx = r * 0.85, ry = r * 0.22;
      const path = () => {
        ctx.beginPath();
        m.shape.forEach((q, i) => { const an = (i / m.shape.length) * Math.PI * 2; const px = m.x + Math.cos(an) * rx * q, py = cy + Math.sin(an) * ry * q; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
        ctx.closePath();
      };
      // bare concrete where the paint came away
      path(); ctx.fillStyle = CONCRETE; ctx.fill();
      ctx.save(); path(); ctx.clip();
      for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.15)'; ctx.fillRect(m.x + (((i * 37) % 100) / 50 - 1) * rx, cy + (((i * 53) % 100) / 50 - 1) * ry, 1.5, 1.5); }
      const sh = ctx.createLinearGradient(0, cy - ry, 0, cy + ry); sh.addColorStop(0, 'rgba(0,0,0,.35)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh; ctx.fillRect(m.x - rx, cy - ry, rx * 2, ry * 2);
      ctx.restore();
      // torn paint edge catching the light
      path(); ctx.strokeStyle = PAINT_HI; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(0, -1.5); path(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      // curled flakes of paint lying around the mark
      for (const f of m.flakes) {
        ctx.save(); ctx.translate(m.x + f.dx * rx, cy + f.dy * ry * 2.2); ctx.rotate(f.rot);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-f.r * r * 0.5 + 1, -f.r * r * 0.2 + 1.5, f.r * r, f.r * r * 0.4);
        ctx.fillStyle = PAINT_HI; ctx.fillRect(-f.r * r * 0.5, -f.r * r * 0.2, f.r * r, f.r * r * 0.4);
        ctx.restore();
      }
    }
    // resin: a clean gleam where the tyre sat
    for (let i = s.gleams.length - 1; i >= 0; i--) {
      const g = s.gleams[i]; g.t += dt; if (g.t > 1.6) { s.gleams.splice(i, 1); continue; }
      const p = g.t / 1.6, gx = g.x - r + p * r * 2;
      const gr = ctx.createRadialGradient(gx, cy, 0, gx, cy, r * 0.5);
      gr.addColorStop(0, `rgba(255,255,255,${0.35 * Math.sin(p * Math.PI)})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save(); ctx.translate(gx, cy); ctx.scale(1, 0.25); ctx.translate(-gx, -cy); ctx.fillStyle = gr; ctx.fillRect(gx - r, cy - r, r * 2, r * 2); ctx.restore();
    }

    // heat glow at the contact patch
    if (s.heat > 0.02) {
      const hg = ctx.createRadialGradient(s.x, cy, 0, s.x, cy, r * 0.9);
      hg.addColorStop(0, `rgba(255,120,40,${0.55 * s.heat})`); hg.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.save(); ctx.translate(s.x, cy); ctx.scale(1, 0.28); ctx.translate(-s.x, -cy); ctx.fillStyle = hg; ctx.fillRect(s.x - r, cy - r, r * 2, r * 2); ctx.restore();
    }
    // reflection of the tyre in the floor (strong on resin, faint on paint)
    const reflA = sideOf(s.x) === 1 ? 0.22 : sideOf(s.x) === -1 ? 0.06 : 0.12;
    ctx.save(); ctx.beginPath(); ctx.rect(0, cy, w, h - cy); ctx.clip();
    ctx.globalAlpha = reflA; ctx.translate(s.x, cy); ctx.scale(1, -0.55); drawTyre(ctx, 0, -r, r, s.rot, [], 0);
    ctx.restore(); ctx.globalAlpha = 1;
    // contact shadow
    const cs = ctx.createRadialGradient(s.x, cy, 0, s.x, cy, r);
    cs.addColorStop(0, 'rgba(0,0,0,.6)'); cs.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.translate(s.x, cy); ctx.scale(1, 0.12); ctx.translate(-s.x, -cy); ctx.fillStyle = cs; ctx.fillRect(s.x - r, cy - r, r * 2, r * 2); ctx.restore();
    // the tyre
    drawTyre(ctx, s.x, cy - r, r, s.rot, s.stuck, s.heat);
    // heat shimmer above a hot tyre
    if (s.heat > 0.15 && !reduced && !lite) {
      ctx.strokeStyle = `rgba(255,170,110,${0.22 * s.heat})`; ctx.lineWidth = 1.5;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        for (let yy = 0; yy < r * 0.7; yy += 4) { const xx = s.x + (j - 1) * r * 0.35 + Math.sin(yy * 0.12 + t * 6 + j) * 4; yy ? ctx.lineTo(xx, cy - r * 2.08 - yy) : ctx.moveTo(xx, cy - r * 2.08 - yy); }
        ctx.stroke();
      }
    }
    // floor labels
    ctx.font = `600 ${Math.max(11, Math.round(w / 52))}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left'; ctx.fillText('FLOOR PAINT', 14, h - 12);
    ctx.textAlign = 'right'; ctx.fillText('RESIN SYSTEM', w - 14, h - 12);
    return true;
  }, (w, h) => { const s = st.current; const was = s.w; s.w = w; s.h = h; if (was) { s.x *= w / was; s.target *= w / was; s.marks.forEach((m) => (m.x *= w / was)); } });

  useIdle(wrap, 2600, () => { const s = st.current; if (!s.auto) { s.auto = true; s.autoT = 0; wake(); } });

  const px = (e: React.PointerEvent) => e.clientX - cv.current!.getBoundingClientRect().left;
  const onDown = (e: React.PointerEvent) => {
    const s = st.current; s.auto = false; s.drag = true;
    const x = px(e); s.dragOff = Math.abs(x - s.x) < R() * 1.2 ? s.x - x : 0; s.target = x + s.dragOff;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => { const s = st.current; if (!s.drag) return; s.target = px(e) + s.dragOff; };
  const onUp = () => { st.current.drag = false; };

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)' }}>
        <canvas ref={cv} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className="block aspect-[4/5] w-full cursor-grab select-none active:cursor-grabbing sm:aspect-[16/10]" style={{ touchAction: 'pan-y' }}
          role="img" aria-label="Illustration: a hot tyre lifts floor paint but leaves a resin system clean" />
        <div className="pointer-events-none absolute left-3 top-3 flex gap-2"><Tag>Illustration</Tag><Tag>Hot-tyre test</Tag></div>
        <div className="pointer-events-none absolute left-1/2 top-[13%] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur-md">{coarse ? 'Drag the tyre on, wait, drag it off' : 'Drag the tyre onto a floor, wait, then drive off'}</div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-[13px]" style={{ color: 'var(--muted)' }}>
        <span>Hot tyres can soften cheap floor paint and pull it off the slab. A properly bonded resin system is built to resist it.</span>
        <span className="ml-auto" /><Ghost onClick={reset}>Reset</Ghost>
      </div>
    </div>
  );
}

function drawTyre(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, stuck: { a: number; r: number }[], heat: number) {
  ctx.save(); ctx.translate(x, y);
  // tread blocks around the circumference
  ctx.save(); ctx.rotate(rot);
  ctx.fillStyle = '#121214'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  const n = 34;
  for (let i = 0; i < n; i++) {
    ctx.save(); ctx.rotate((i / n) * Math.PI * 2);
    ctx.fillStyle = '#1E1F22'; ctx.fillRect(-r * 0.045, -r * 1.0, r * 0.09, r * 0.1);
    ctx.restore();
  }
  // paint stuck to the tread
  for (const s of stuck) {
    ctx.save(); ctx.rotate(s.a);
    ctx.fillStyle = PAINT_HI; ctx.fillRect(r * 0.9, -s.r * r * 0.5, r * 0.1, s.r * r);
    ctx.restore();
  }
  // sidewall
  const sw = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 0.9);
  sw.addColorStop(0, '#3A3B3F'); sw.addColorStop(1, '#17181A');
  ctx.fillStyle = sw; ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.stroke();
  // rim
  const rim = ctx.createLinearGradient(-r * 0.6, -r * 0.6, r * 0.6, r * 0.6);
  rim.addColorStop(0, '#E9ECEF'); rim.addColorStop(0.5, '#8C939A'); rim.addColorStop(1, '#4A5057');
  ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#16181B'; ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2); ctx.fill();
  // spokes
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.rotate((i / 5) * Math.PI * 2);
    const sg = ctx.createLinearGradient(-r * 0.08, 0, r * 0.08, 0); sg.addColorStop(0, '#C9CED3'); sg.addColorStop(1, '#6C737A');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-r * 0.07, -r * 0.12); ctx.lineTo(-r * 0.04, -r * 0.53); ctx.lineTo(r * 0.04, -r * 0.53); ctx.lineTo(r * 0.07, -r * 0.12); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#B9BFC5'; ctx.beginPath(); ctx.arc(0, 0, r * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2A2D31'; ctx.beginPath(); ctx.arc(0, 0, r * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // fixed lighting over the rotating wheel
  const lg = ctx.createLinearGradient(0, -r, 0, r);
  lg.addColorStop(0, 'rgba(255,255,255,.10)'); lg.addColorStop(0.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,0,.25)');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  if (heat > 0.02) {
    const hg = ctx.createLinearGradient(0, r * 0.4, 0, r);
    hg.addColorStop(0, 'rgba(255,90,30,0)'); hg.addColorStop(1, `rgba(255,110,40,${0.45 * heat})`);
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
export default HotTyreTest;
