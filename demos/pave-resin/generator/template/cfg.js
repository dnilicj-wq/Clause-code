// Configurator: "Design your drive" (top-down plan) and "Choose your finish" (room view).
// Loaded lazily by app.js when the section nears the viewport. All textures are generated here on canvas.
(() => {
  const root = document.querySelector('.cfg');
  if (!root) return;
  const C = JSON.parse(root.dataset.cfg);
  const stage = root.querySelector('.cfg-stage'), cv = stage.querySelector('canvas'), ui = root.querySelector('.cfg-ui');
  const ctx = cv.getContext('2d');
  let load = stage.querySelector('.cfg-load');

  // ---------- helpers ----------
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
  const rgb = (c, k = 1, d = 0) => `rgb(${clamp(c[0] * k + d) | 0},${clamp(c[1] * k + d) | 0},${clamp(c[2] * k + d) | 0})`;
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const avg = (pal) => [0, 1, 2].map((i) => pal.reduce((s, c) => s + c[i], 0) / pal.length);
  const lumi = (c) => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
  const mk = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const cache = new Map();
  const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

  // periodic value noise (seamless at size T)
  function fbm(T, oct = 5, seed = 1, base = 4) {
    const out = new Float32Array(T * T);
    let amp = 1, tot = 0;
    for (let o = 0; o < oct; o++) {
      const g = base << o, r = mulberry(seed * 977 + o * 131), lat = new Float32Array(g * g);
      for (let i = 0; i < g * g; i++) lat[i] = r();
      const cell = T / g;
      for (let y = 0; y < T; y++) {
        const gy = y / cell, y0 = Math.floor(gy) % g, y1 = (y0 + 1) % g, fy = gy - Math.floor(gy), sy = fy * fy * (3 - 2 * fy);
        for (let x = 0; x < T; x++) {
          const gx = x / cell, x0 = Math.floor(gx) % g, x1 = (x0 + 1) % g, fx = gx - Math.floor(gx), sx = fx * fx * (3 - 2 * fx);
          const a = lat[y0 * g + x0], b = lat[y0 * g + x1], c = lat[y1 * g + x0], d = lat[y1 * g + x1];
          out[y * T + x] += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy);
        }
      }
      tot += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= tot;
    return out;
  }
  const grain = () => memo('grain', () => {
    const T = 256, c = mk(T), g = c.getContext('2d'), im = g.createImageData(T, T), n = fbm(T, 3, 7, 32), r = mulberry(5);
    for (let i = 0; i < T * T; i++) { const v = 128 + (n[i] - 0.5) * 70 + (r() - 0.5) * 46; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); return c;
  });

  // ---------- palettes ----------
  const PAL = {
    block: { Charcoal: [[64, 64, 66], [78, 77, 78], [55, 55, 58], [90, 88, 88]], Brindle: [[146, 72, 52], [112, 62, 48], [84, 72, 68], [166, 100, 68], [128, 86, 66]], Red: [[158, 60, 45], [140, 52, 42], [172, 72, 54], [128, 48, 40]], Buff: [[206, 176, 128], [192, 160, 112], [220, 192, 146], [180, 150, 108]], 'Silver Grey': [[170, 170, 166], [154, 154, 152], [184, 182, 178], [142, 142, 142]], Silver: [[178, 180, 182], [160, 162, 165], [196, 197, 198], [146, 148, 151]] },
    resin: { 'Golden Buff': [[205, 165, 105], [180, 135, 85], [232, 205, 155], [140, 105, 70], [246, 236, 214]], 'Silver Grey': [[178, 178, 175], [136, 136, 139], [216, 215, 211], [96, 97, 101], [242, 242, 240]], 'Autumn Brown': [[162, 112, 72], [122, 82, 56], [198, 152, 106], [86, 66, 52], [226, 202, 172]], Charcoal: [[72, 72, 74], [96, 96, 99], [50, 50, 52], [132, 132, 134], [196, 196, 196]], Silver: [[196, 198, 200], [160, 163, 167], [226, 227, 228], [118, 121, 126], [246, 246, 245]], Grey: [[140, 142, 145], [108, 110, 114], [176, 177, 179], [80, 82, 86], [214, 214, 212]], Buff: [[214, 190, 148], [190, 162, 118], [234, 214, 178], [156, 128, 92], [246, 238, 222]], Bronze: [[150, 104, 64], [118, 80, 50], [186, 140, 92], [84, 60, 42], [214, 180, 140]] },
    tarmac: { Black: [[48, 48, 50]], Red: [[124, 50, 43]] },
    gravel: { Golden: [[208, 172, 112], [182, 142, 92], [228, 202, 152], [160, 126, 86]], Grey: [[152, 152, 150], [116, 116, 119], [192, 192, 188], [96, 96, 99]], White: [[234, 231, 224], [212, 208, 200], [246, 244, 239], [192, 188, 182]] },
    sandstone: { Buff: [[214, 184, 136], [198, 168, 124], [228, 206, 166], [186, 156, 116], [206, 172, 140]], Grey: [[166, 165, 154], [142, 144, 138], [184, 180, 168], [152, 148, 142]], 'Brown Mix': [[178, 126, 86], [148, 106, 76], [200, 156, 112], [126, 100, 84], [188, 142, 102]] },
    porcelain: { 'Light Grey': [[200, 200, 196]], Charcoal: [[84, 84, 86]], Sand: [[216, 202, 176]] },
  };
  const SURF = { block: 'Block paving', resin: 'Resin bound', tarmac: 'Tarmac', gravel: 'Gravel', sandstone: 'Indian sandstone', porcelain: 'Porcelain' };
  const pal = (s, c) => PAL[s][c] || Object.values(PAL[s])[0];

  // ---------- tileable surface textures (device px, T = 256) ----------
  const T = 256;
  function resinTile(name) {
    return memo('resin' + name, () => {
      const P = pal('resin', name), c = mk(T), g = c.getContext('2d'), r = mulberry(11);
      g.fillStyle = rgb(avg(P), 0.62); g.fillRect(0, 0, T, T);
      const W = [0.34, 0.24, 0.18, 0.14, 0.1];
      for (let i = 0; i < 9000; i++) {
        let q = r(), k = 0; while (k < W.length - 1 && q > W[k]) { q -= W[k]; k++; }
        const col = P[k % P.length], x = r() * T, y = r() * T, rx = 1.3 + r() * 1.5, ry = rx * (0.6 + r() * 0.4), a = r() * Math.PI;
        g.fillStyle = rgb(col, 0.9 + r() * 0.22);
        for (const ox of [0, -T, T]) for (const oy of [0, -T, T]) { if (x + ox < -4 || x + ox > T + 4 || y + oy < -4 || y + oy > T + 4) continue; g.beginPath(); g.ellipse(x + ox, y + oy, rx, ry, a, 0, 6.283); g.fill(); }
      }
      for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(r() * T, r() * T, 1, 1); }
      return c;
    });
  }
  function tarmacTile(name, col) {
    return memo('tar' + name + col, () => {
      const base = col || pal('tarmac', name)[0], c = mk(T), g = c.getContext('2d'), im = g.createImageData(T, T), n = fbm(T, 4, 3, 8), r = mulberry(3);
      for (let i = 0; i < T * T; i++) {
        const sp = r() < 0.035 ? 26 + r() * 30 : 0, v = (n[i] - 0.5) * 22 + (r() - 0.5) * 26 + sp;
        im.data[i * 4] = clamp(base[0] + v); im.data[i * 4 + 1] = clamp(base[1] + v); im.data[i * 4 + 2] = clamp(base[2] + v); im.data[i * 4 + 3] = 255;
      }
      g.putImageData(im, 0, 0); return c;
    });
  }
  function gravelTile(name) {
    return memo('grv' + name, () => {
      const P = pal('gravel', name), c = mk(T), g = c.getContext('2d'), r = mulberry(17);
      g.fillStyle = rgb(avg(P), 0.42); g.fillRect(0, 0, T, T);
      for (let i = 0; i < 2600; i++) {
        const col = P[(r() * P.length) | 0], x = r() * T, y = r() * T, rad = 2.4 + r() * 2.6, a = r() * 3.14, e = 0.65 + r() * 0.35;
        for (const ox of [0, -T, T]) for (const oy of [0, -T, T]) {
          const X = x + ox, Y = y + oy; if (X < -8 || X > T + 8 || Y < -8 || Y > T + 8) continue;
          g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(X + 0.9, Y + 1.1, rad, rad * e, a, 0, 6.283); g.fill();
          const gr = g.createRadialGradient(X - rad * 0.35, Y - rad * 0.4, rad * 0.1, X, Y, rad * 1.05);
          gr.addColorStop(0, rgb(col, 1.18, 8)); gr.addColorStop(0.7, rgb(col)); gr.addColorStop(1, rgb(col, 0.7));
          g.fillStyle = gr; g.beginPath(); g.ellipse(X, Y, rad, rad * e, a, 0, 6.283); g.fill();
        }
      }
      return c;
    });
  }
  function lawnTile() {
    return memo('lawn', () => {
      const c = mk(T), g = c.getContext('2d'), im = g.createImageData(T, T), n = fbm(T, 4, 21, 4), r = mulberry(21);
      for (let i = 0; i < T * T; i++) { const v = (n[i] - 0.5) * 36 + (r() - 0.5) * 30; im.data[i * 4] = clamp(84 + v * 0.6); im.data[i * 4 + 1] = clamp(134 + v); im.data[i * 4 + 2] = clamp(58 + v * 0.4); im.data[i * 4 + 3] = 255; }
      g.putImageData(im, 0, 0);
      for (let i = 0; i < 1800; i++) { const x = r() * T, y = r() * T, a = -1.2 + r() * 0.5; g.strokeStyle = r() < 0.5 ? 'rgba(160,200,100,.35)' : 'rgba(40,80,30,.3)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3); g.stroke(); }
      return c;
    });
  }
  function noiseOverlay(g, alpha = 0.35, mode = 'overlay') {
    g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = mode; g.fillStyle = g.createPattern(grain(), 'repeat'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  }

  // ---------- paving drawn per unit (device px) ----------
  function brick(g, x, y, w, h, P, seed, joint) {
    const k = hash(Math.round(x * 3), Math.round(y * 3), seed), col = P[(k * P.length) | 0], f = 0.9 + hash(Math.round(y * 5), Math.round(x * 5), seed + 1) * 0.2;
    g.fillStyle = rgb(col, f);
    g.fillRect(x + joint, y + joint, w - joint * 2, h - joint * 2);
    if (w > 10) { g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + joint, y + joint, w - joint * 2, Math.max(1, joint)); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + joint, y + h - joint * 2, w - joint * 2, Math.max(1, joint)); }
  }
  function blockPaving(g, R, P, pattern, u) {
    const j = Math.max(0.7, u * 0.07);
    g.fillStyle = rgb(avg(P), 0.5); g.fillRect(R.x, R.y, R.w, R.h);
    if (pattern === 'Herringbone') {
      const cx = R.x + R.w / 2, cy = R.y + R.h / 2, rad = Math.hypot(R.w, R.h) / 2 + 3 * u;
      g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4);
      const K = Math.ceil(rad / u) + 2;
      for (let i = -K; i <= K; i++) for (let jj = -Math.ceil(K / 2) - 1; jj <= Math.ceil(K / 2) + 1; jj++) {
        const ox = i * u + jj * 2 * u, oy = i * u - jj * 2 * u;
        if (Math.abs(ox) > rad + 3 * u || Math.abs(oy) > rad + 3 * u) continue;
        brick(g, ox, oy, 2 * u, u, P, 3, j);
        brick(g, ox + 2 * u, oy - u, u, 2 * u, P, 3, j);
      }
      g.restore();
    } else if (pattern === 'Basketweave') {
      for (let y = R.y, a = 0; y < R.y + R.h; y += 2 * u, a++) for (let x = R.x, b = 0; x < R.x + R.w; x += 2 * u, b++) {
        if ((a + b) % 2) { brick(g, x, y, 2 * u, u, P, 5, j); brick(g, x, y + u, 2 * u, u, P, 5, j); }
        else { brick(g, x, y, u, 2 * u, P, 5, j); brick(g, x + u, y, u, 2 * u, P, 5, j); }
      }
    } else {
      for (let y = R.y, a = 0; y < R.y + R.h; y += u, a++) for (let x = R.x - (a % 2 ? u : 0); x < R.x + R.w; x += 2 * u) brick(g, x, y, 2 * u, u, P, 7, j);
    }
  }
  function soldier(g, R, P, u, edges) {
    const j = Math.max(0.7, u * 0.07), d = 2 * u;
    g.save(); g.fillStyle = rgb(avg(P), 0.5);
    if (edges.includes('b')) { g.fillRect(R.x, R.y + R.h - d, R.w, d); for (let x = R.x; x < R.x + R.w; x += u) brick(g, x, R.y + R.h - d, u, d, P, 9, j); }
    if (edges.includes('t')) { g.fillRect(R.x, R.y, R.w, d); for (let x = R.x; x < R.x + R.w; x += u) brick(g, x, R.y, u, d, P, 9, j); }
    if (edges.includes('l')) { g.fillRect(R.x, R.y, d, R.h); for (let y = R.y; y < R.y + R.h; y += u) brick(g, R.x, y, d, u, P, 11, j); }
    if (edges.includes('r')) { g.fillRect(R.x + R.w - d, R.y, d, R.h); for (let y = R.y; y < R.y + R.h; y += u) brick(g, R.x + R.w - d, y, d, u, P, 11, j); }
    g.restore();
  }
  function flags(g, R, P, S, kind) {
    const r = mulberry(kind === 'porcelain' ? 41 : 43), jt = Math.max(1, S * (kind === 'porcelain' ? 0.004 : 0.01));
    g.fillStyle = kind === 'porcelain' ? rgb(P[0], 0.72) : 'rgb(150,144,134)'; g.fillRect(R.x, R.y, R.w, R.h);
    const rows = kind === 'porcelain' ? [0.6] : [0.6, 0.6, 0.3, 0.6, 0.9];
    const lens = kind === 'porcelain' ? [0.9] : [0.6, 0.9, 0.3, 0.6, 0.9, 0.6];
    let y = R.y, ri = 0;
    while (y < R.y + R.h) {
      const rh = rows[ri % rows.length] * S; let x = R.x - (kind === 'porcelain' ? (ri % 2 ? 0.45 * S : 0) : r() * 0.3 * S);
      while (x < R.x + R.w) {
        const lw = lens[(r() * lens.length) | 0] * S, col = P[(r() * P.length) | 0];
        const sx = x + jt / 2, sy = y + jt / 2, sw = lw - jt, sh = rh - jt;
        g.fillStyle = rgb(col, kind === 'porcelain' ? 0.97 + r() * 0.05 : 0.92 + r() * 0.14); g.fillRect(sx, sy, sw, sh);
        if (kind === 'sandstone') {
          g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
          for (let b = 0; b < 3; b++) { const c2 = P[(r() * P.length) | 0], px = sx + r() * sw, py = sy + r() * sh, rr = (0.2 + r() * 0.4) * S; const gr = g.createRadialGradient(px, py, 0, px, py, rr); gr.addColorStop(0, rgba(c2, 0.55)); gr.addColorStop(1, rgba(c2, 0)); g.fillStyle = gr; g.fillRect(sx, sy, sw, sh); }
          g.restore();
        } else {
          const gr = g.createLinearGradient(sx, sy, sx + sw, sy + sh); gr.addColorStop(0, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(0,0,0,.05)'); g.fillStyle = gr; g.fillRect(sx, sy, sw, sh);
        }
        x += lw;
      }
      y += rh; ri++;
    }
  }

  // paint one surface spec into rect R (device px). S = px per metre.
  function paintSurface(g, R, spec, S, edges) {
    g.save(); g.beginPath(); g.rect(R.x, R.y, R.w, R.h); g.clip();
    const u = 0.1 * S;
    const P = pal(spec.surface, spec.colour);
    if (spec.surface === 'block') { blockPaving(g, R, P, spec.pattern, u); noiseOverlay(g, 0.28); }
    else if (spec.surface === 'resin') { g.fillStyle = g.createPattern(resinTile(spec.colour), 'repeat'); g.fillRect(R.x, R.y, R.w, R.h); const sh = g.createLinearGradient(R.x, R.y, R.x + R.w, R.y + R.h); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.45, 'rgba(255,255,255,.16)'); sh.addColorStop(.55, 'rgba(255,255,255,.04)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(R.x, R.y, R.w, R.h); }
    else if (spec.surface === 'tarmac') { g.fillStyle = g.createPattern(tarmacTile(spec.colour), 'repeat'); g.fillRect(R.x, R.y, R.w, R.h); }
    else if (spec.surface === 'gravel') { g.fillStyle = g.createPattern(gravelTile(spec.colour), 'repeat'); g.fillRect(R.x, R.y, R.w, R.h); }
    else { flags(g, R, P, S, spec.surface); noiseOverlay(g, spec.surface === 'sandstone' ? 0.45 : 0.14); }
    if (spec.border && spec.border !== 'None' && !['sandstone', 'porcelain'].includes(spec.surface)) {
      const BP = PAL.block[spec.border] ? PAL.block[spec.border] : lumi(avg(P)) < 0.4 ? PAL.block['Silver Grey'] : PAL.block.Brindle;
      soldier(g, R, BP, u, edges || 'lbr'); noiseOverlay(g, 0.2);
    }
    g.restore();
  }

  // ---------- scene: top-down plot ----------
  function roof(g, R, S, col) {
    g.save();
    g.shadowColor = 'rgba(0,0,0,.42)'; g.shadowBlur = 0.5 * S; g.shadowOffsetX = 0.25 * S; g.shadowOffsetY = 0.3 * S;
    g.fillStyle = rgb(col); g.fillRect(R.x, R.y, R.w, R.h); g.restore();
    g.save(); g.beginPath(); g.rect(R.x, R.y, R.w, R.h); g.clip();
    const mid = R.y + R.h / 2, step = 0.32 * S;
    for (let y = R.y; y < R.y + R.h; y += step) { g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(R.x, y, R.w, Math.max(1, S * 0.02)); for (let x = R.x + ((y - R.y) / step % 2 ? step / 2 : 0); x < R.x + R.w; x += step * 0.9) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y, Math.max(1, S * 0.012), step); } }
    const lg = g.createLinearGradient(0, R.y, 0, R.y + R.h); lg.addColorStop(0, 'rgba(255,255,255,.14)'); lg.addColorStop(0.5, 'rgba(255,255,255,.05)'); lg.addColorStop(0.5, 'rgba(0,0,0,.12)'); lg.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = lg; g.fillRect(R.x, R.y, R.w, R.h);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(1.5, S * 0.06);
    const hip = R.h / 2; g.beginPath(); g.moveTo(R.x, R.y); g.lineTo(R.x + hip, mid); g.lineTo(R.x + R.w - hip, mid); g.lineTo(R.x + R.w, R.y); g.moveTo(R.x, R.y + R.h); g.lineTo(R.x + hip, mid); g.moveTo(R.x + R.w - hip, mid); g.lineTo(R.x + R.w, R.y + R.h); g.stroke();
    noiseOverlay(g, 0.3);
    g.restore();
  }
  function shrub(g, x, y, r, S, seed) {
    const rr = mulberry(seed);
    g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = r * 0.6; g.shadowOffsetX = r * 0.25; g.shadowOffsetY = r * 0.3;
    for (let i = 0; i < 6; i++) { const a = rr() * 6.28, d = rr() * r * 0.45, cr = r * (0.45 + rr() * 0.3), X = x + Math.cos(a) * d, Y = y + Math.sin(a) * d; const gr = g.createRadialGradient(X - cr * 0.3, Y - cr * 0.3, cr * 0.1, X, Y, cr); gr.addColorStop(0, 'rgb(118,160,72)'); gr.addColorStop(1, 'rgb(46,92,40)'); g.fillStyle = gr; g.beginPath(); g.arc(X, Y, cr, 0, 6.283); g.fill(); }
    g.restore();
  }
  const M = (S, x, y, w, h) => ({ x: x * S, y: y * S, w: w * S, h: h * S });
  function lawn(g, R, S) {
    g.save(); g.fillStyle = g.createPattern(lawnTile(), 'repeat'); g.fillRect(R.x, R.y, R.w, R.h);
    g.beginPath(); g.rect(R.x, R.y, R.w, R.h); g.clip();
    for (let x = R.x, i = 0; x < R.x + R.w; x += 0.9 * S, i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)'; g.fillRect(x, R.y, 0.9 * S, R.h); }
    g.restore();
  }
  function pavement(g, R, S) {
    g.fillStyle = 'rgb(176,176,172)'; g.fillRect(R.x, R.y, R.w, R.h);
    const s = 0.6 * S; g.fillStyle = 'rgba(0,0,0,.18)';
    for (let x = R.x; x < R.x + R.w; x += s) g.fillRect(x, R.y, Math.max(1, S * 0.01), R.h);
    for (let y = R.y; y < R.y + R.h; y += s) g.fillRect(R.x, y, R.w, Math.max(1, S * 0.01));
  }
  function brickWall(g, R, S, col) {
    g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 0.25 * S; g.shadowOffsetY = 0.12 * S;
    g.fillStyle = rgb(col); g.fillRect(R.x, R.y, R.w, R.h); g.restore();
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(R.x, R.y, R.w, Math.max(1, 0.05 * S));
    g.fillStyle = 'rgba(0,0,0,.22)'; for (let x = R.x; x < R.x + R.w; x += 0.32 * S) g.fillRect(x, R.y, Math.max(1, 0.02 * S), R.h);
  }
  function frontScene(g, W, H, S, spec, variant) {
    if (variant === 'semi') {
      // Manchester red-brick semi: pair of semis under one hipped roof, low red-brick front wall with brick piers either side of the drive
      g.fillStyle = 'rgb(150,148,142)'; g.fillRect(0, 0, W, H);
      lawn(g, M(S, 7.4, 3.3, 4.6, 3.8), S);
      g.fillStyle = g.createPattern(tarmacTile('road', [62, 64, 68]), 'repeat'); g.fillRect(0, 8.3 * S, W, H);
      g.fillStyle = 'rgb(205,205,200)'; g.fillRect(0, 8.2 * S, W, 0.12 * S);
      pavement(g, M(S, 0, 7.15, 12, 1.05), S);
      g.fillStyle = 'rgba(255,255,255,.7)'; for (let x = 0.6; x < 12; x += 2.4) g.fillRect(x * S, 8.95 * S, 1.2 * S, 0.1 * S);
      paintSurface(g, M(S, 0.35, 3.3, 7.0, 3.85), spec, S, 'lr');
      brickWall(g, M(S, 7.35, 6.92, 4.65, 0.26), S, [142, 59, 46]); brickWall(g, M(S, 0, 3.3, 0.26, 3.85), S, [142, 59, 46]);
      for (const x of [7.15, 0.05]) { brickWall(g, M(S, x, 6.78, 0.5, 0.5), S, [150, 64, 50]); g.fillStyle = 'rgb(214,210,202)'; g.fillRect((x + 0.04) * S, 6.82 * S, 0.42 * S, 0.42 * S); }
      roof(g, M(S, 0.2, -0.7, 5.8, 4.0), S, [74, 66, 64]); roof(g, M(S, 6.0, -0.7, 5.8, 4.0), S, [74, 66, 64]);
      g.fillStyle = 'rgb(142,59,46)'; g.fillRect(5.85 * S, 0.2 * S, 0.3 * S, 0.7 * S); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(5.98 * S, -0.7 * S, 0.04 * S, 4 * S);
      g.fillStyle = 'rgb(232,230,224)'; g.fillRect(2.2 * S, 3.15 * S, 1.6 * S, 0.2 * S); g.fillRect(8.4 * S, 3.15 * S, 1.6 * S, 0.2 * S);
      shrub(g, 11.2 * S, 4.4 * S, 0.6 * S, S, 13); shrub(g, 8.0 * S, 6.2 * S, 0.45 * S, S, 14); shrub(g, 10.4 * S, 6.3 * S, 0.5 * S, S, 15);
      return;
    }
    if (variant === 'london') {
      // London terrace: three houses side by side, small front gardens, low brick walls and a gate gap
      g.fillStyle = 'rgb(150,148,142)'; g.fillRect(0, 0, W, H);
      lawn(g, M(S, 0, 3.2, 12, 4.0), S);
      g.fillStyle = g.createPattern(tarmacTile('road', [70, 72, 78]), 'repeat'); g.fillRect(0, 8.35 * S, W, H);
      g.fillStyle = 'rgb(205,205,200)'; g.fillRect(0, 8.25 * S, W, 0.12 * S);
      pavement(g, M(S, 0, 7.15, 12, 1.1), S);
      g.fillStyle = 'rgba(255,255,255,.75)'; for (let x = 0.8; x < 12; x += 2.4) g.fillRect(x * S, 8.9 * S, 1.2 * S, 0.1 * S);
      paintSurface(g, M(S, 2.2, 3.2, 7.6, 3.95), spec, S, 'lr');
      brickWall(g, M(S, 0, 6.95, 2.2, 0.24), S, [120, 62, 46]); brickWall(g, M(S, 9.8, 6.95, 2.2, 0.24), S, [120, 62, 46]);
      for (const x of [0, 4, 8]) roof(g, M(S, x + 0.05, -0.4, 3.9, 3.6), S, [64, 66, 72]);
      g.fillStyle = 'rgba(0,0,0,.35)'; for (const x of [4, 8]) g.fillRect(x * S - 0.06 * S, 0, 0.12 * S, 3.2 * S);
      g.fillStyle = 'rgb(232,230,224)'; for (const x of [1.4, 5.4, 9.4]) g.fillRect(x * S, 3.05 * S, 1.2 * S, 0.22 * S);
      shrub(g, 0.9 * S, 4.6 * S, 0.6 * S, S, 11); shrub(g, 1.3 * S, 6.0 * S, 0.45 * S, S, 12); shrub(g, 11.0 * S, 4.4 * S, 0.55 * S, S, 13); shrub(g, 10.6 * S, 6.1 * S, 0.4 * S, S, 14);
      shrub(g, 3.2 * S, 7.7 * S, 0.62 * S, S, 15); shrub(g, 9.4 * S, 7.75 * S, 0.66 * S, S, 16);
      return;
    }
    if (variant === 'country') {
      // Detached country house: wide gravel-edged plot, hedges, stone gate piers, slate roof
      lawn(g, M(S, 0, 0, 12, 9), S);
      g.fillStyle = g.createPattern(tarmacTile('road', [84, 86, 82]), 'repeat'); g.fillRect(0, 8.2 * S, W, H);
      g.fillStyle = 'rgb(196,190,176)'; g.fillRect(0, 8.1 * S, W, 0.12 * S);
      paintSurface(g, M(S, 1.6, 3.1, 7.2, 5.0), spec, S, 'lr');
      g.fillStyle = 'rgb(170,160,140)'; g.fillRect(1.4 * S, 3.1 * S, 0.2 * S, 5 * S); g.fillRect(8.8 * S, 3.1 * S, 0.2 * S, 5 * S);
      for (let x = 0.2; x < 1.4; x += 0.42) shrub(g, x * S, 7.7 * S, 0.34 * S, S, 20 + x * 10);
      for (let x = 9.3; x < 12; x += 0.42) shrub(g, x * S, 7.7 * S, 0.34 * S, S, 40 + x * 10);
      brickWall(g, M(S, 1.2, 7.75, 0.42, 0.42), S, [176, 166, 146]); brickWall(g, M(S, 8.85, 7.75, 0.42, 0.42), S, [176, 166, 146]);
      roof(g, M(S, 0.9, -0.5, 10.2, 3.6), S, [62, 68, 70]);
      g.fillStyle = 'rgb(150,140,124)'; g.fillRect(2.4 * S, 0.2 * S, 0.5 * S, 0.5 * S); g.fillRect(9.1 * S, 0.2 * S, 0.5 * S, 0.5 * S);
      shrub(g, 10.6 * S, 4.6 * S, 1.05 * S, S, 31); shrub(g, 0.6 * S, 4.2 * S, 0.8 * S, S, 32); shrub(g, 11.2 * S, 6.2 * S, 0.5 * S, S, 33);
      return;
    }

    lawn(g, M(S, 0, 0, 12, 9), S);
    g.fillStyle = g.createPattern(tarmacTile('road', [88, 90, 94]), 'repeat'); g.fillRect(0, 8.05 * S, W, H);
    g.fillStyle = 'rgb(205,205,200)'; g.fillRect(0, 7.95 * S, W, 0.12 * S);
    pavement(g, M(S, 0, 7.1, 12, 0.85), S);
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let x = 0.4; x < 12; x += 2.4) g.fillRect(x * S, 8.6 * S, 1.2 * S, 0.1 * S);
    paintSurface(g, M(S, 0.9, 3.3, 6.1, 4.65), spec, S, 'lr');
    paintSurface(g, M(S, 7.0, 3.55, 1.5, 0.95), spec, S, 'tb');
    g.fillStyle = 'rgb(214,212,206)'; g.fillRect(7.9 * S, 3.3 * S, 1.1 * S, 0.3 * S);
    roof(g, M(S, 0.4, -0.6, 11.2, 3.9), S, [92, 86, 84]);
    g.fillStyle = 'rgb(94,64,46)'; g.fillRect(0.0, 0, 0.15 * S, 7.1 * S); g.fillRect(11.85 * S, 3.3 * S, 0.15 * S, 3.8 * S);
    shrub(g, 10.2 * S, 5.0 * S, 0.75 * S, S, 1); shrub(g, 11.1 * S, 6.3 * S, 0.55 * S, S, 2); shrub(g, 9.3 * S, 6.4 * S, 0.45 * S, S, 3); shrub(g, 8.9 * S, 4.6 * S, 0.35 * S, S, 4);
  }
  function backScene(g, W, H, S, spec) {
    lawn(g, M(S, 0, 0, 12, 9), S);
    g.fillStyle = 'rgb(120,86,58)'; g.fillRect(0, 0, 0.18 * S, 6 * S); g.fillRect(11.82 * S, 0, 0.18 * S, 6 * S); g.fillRect(0, 0, W, 0.16 * S);
    for (let y = 0.4; y < 6; y += 0.6) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y * S, 0.18 * S, 0.04 * S); g.fillRect(11.82 * S, y * S, 0.18 * S, 0.04 * S); }
    g.fillStyle = 'rgb(98,72,50)'; g.fillRect(0.18 * S, 0.16 * S, 1.2 * S, 5.6 * S); g.fillRect(10.62 * S, 0.16 * S, 1.2 * S, 5.6 * S);
    shrub(g, 0.8 * S, 1.2 * S, 0.6 * S, S, 7); shrub(g, 0.8 * S, 3.4 * S, 0.5 * S, S, 8); shrub(g, 11.2 * S, 1.8 * S, 0.65 * S, S, 9); shrub(g, 11.2 * S, 4.4 * S, 0.45 * S, S, 10);
    paintSurface(g, M(S, 1.4, 2.4, 9.2, 3.5), spec, S, 'lrt');
    paintSurface(g, M(S, 5.3, 0.3, 1.4, 2.1), { ...spec }, S, 'lr');
    g.fillStyle = 'rgba(30,30,30,.55)'; g.fillRect(5.0 * S, 5.9 * S, 2.0 * S, 0.12 * S);
    roof(g, M(S, 0.4, 6.0, 11.2, 3.6), S, [104, 88, 80]);
    // garden table + chairs for scale
    const tx = 3.9 * S, ty = 4.2 * S; g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 0.2 * S; g.shadowOffsetX = 0.08 * S; g.shadowOffsetY = 0.1 * S;
    g.fillStyle = 'rgb(232,232,228)'; g.beginPath(); g.arc(tx, ty, 0.55 * S, 0, 6.283); g.fill();
    g.fillStyle = 'rgb(60,62,66)'; for (const [dx, dy] of [[-0.95, 0], [0.95, 0], [0, -0.95], [0, 0.95]]) g.fillRect(tx + dx * S - 0.22 * S, ty + dy * S - 0.22 * S, 0.44 * S, 0.44 * S);
    g.restore();
  }

  // ---------- room view (floor + wall) ----------
  const SHADE = { 'Light grey': [200, 199, 195], 'Warm grey': [178, 168, 154], Graphite: [94, 95, 98], Sand: [212, 195, 165], White: [236, 234, 228] };
  const SHEEN = { Matt: 0, Satin: 0.17, 'High polish': 0.42 };
  function finishTile(finish, shade) {
    return memo('fin' + finish + shade, () => {
      const N = 512, c = mk(N), g = c.getContext('2d'), im = g.createImageData(N, N), base = SHADE[shade] || SHADE['Light grey'];
      const n = fbm(N, 6, finish === 'Microcement' ? 31 : 37, 3), dark = lumi(base) < 0.45, r = mulberry(9);
      const con = finish === 'Microcement' ? 0.2 : 0.15;
      for (let i = 0; i < N * N; i++) { const k = 1 + (n[i] - 0.5) * con * (dark ? 1.6 : 1) + (r() - 0.5) * 0.025; im.data[i * 4] = clamp(base[0] * k); im.data[i * 4 + 1] = clamp(base[1] * k); im.data[i * 4 + 2] = clamp(base[2] * k); im.data[i * 4 + 3] = 255; }
      g.putImageData(im, 0, 0);
      const wrap = (fn) => { for (const ox of [0, -N, N]) for (const oy of [0, -N, N]) { g.save(); g.translate(ox, oy); fn(); g.restore(); } };
      if (finish === 'Microcement') {
        g.lineCap = 'round';
        for (let i = 0; i < 340; i++) {
          const x = r() * N, y = r() * N, rad = 40 + r() * 150, a0 = r() * 6.28, al = 0.4 + r() * 0.9, w = 5 + r() * 16, light = r() < 0.5;
          wrap(() => { g.strokeStyle = light ? `rgba(255,255,255,${0.035 + r() * 0.04})` : `rgba(0,0,0,${0.025 + r() * 0.035})`; g.lineWidth = w; g.beginPath(); g.arc(x, y, rad, a0, a0 + al); g.stroke(); });
        }
      } else {
        for (let i = 0; i < 1400; i++) { const x = r() * N, y = r() * N, rr = 0.4 + r() * 0.8; g.fillStyle = r() < 0.5 ? `rgba(0,0,0,${0.04 + r() * 0.06})` : `rgba(255,255,255,${0.05 + r() * 0.07})`; g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill(); }
        g.lineCap = 'round';
        for (let i = 0; i < 60; i++) { const x = r() * N, y = r() * N, rad = 120 + r() * 300, a0 = r() * 6.28, w = 14 + r() * 30; wrap(() => { g.strokeStyle = `rgba(255,255,255,${0.025 + r() * 0.03})`; g.lineWidth = w; g.beginPath(); g.arc(x, y, rad, a0, a0 + 0.5 + r()); g.stroke(); }); }
      }
      return c;
    });
  }
  function roomScene(g, W, H, st) {
    const vx = 0.5 * W, vy = 0.4 * H, BL = [0.15 * W, 0.6 * H], BR = [0.85 * W, 0.6 * H], TL = [0.15 * W, 0.05 * H], TR = [0.85 * W, 0.05 * H];
    const ext = (p, x) => [x, vy + (p[1] - vy) * ((x - vx) / (p[0] - vx))];
    const tile = finishTile(st.finish, st.shade), shade = SHADE[st.shade], sheen = SHEEN[st.sheen];
    // ceiling
    g.fillStyle = 'rgb(246,245,242)'; g.fillRect(0, 0, W, H);
    // floor rows in perspective
    const pat = g.createPattern(tile, 'repeat'), fy0 = Math.floor(BL[1]);
    g.fillStyle = pat;
    for (let y = fy0; y < H; y++) {
      const ts = ((y + 0.5 - vy) / (H - vy)) * 1.25 * (W / 900), v = (380 * (H - vy)) / (y + 0.5 - vy);
      pat.setTransform(new DOMMatrix([ts, 0, 0, 1, vx, y - v * 1.0]));
      g.fillRect(0, y, W, 1);
    }
    // floor light falloff + sheen
    let gr = g.createLinearGradient(0, BL[1], 0, H); gr.addColorStop(0, 'rgba(0,0,0,.18)'); gr.addColorStop(0.25, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; g.fillRect(0, BL[1], W, H - BL[1]);
    // walls
    const paint = [242, 240, 235];
    const wallFill = (poly, k, textured) => {
      g.save(); g.beginPath(); poly.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
      if (textured) { const p2 = g.createPattern(tile, 'repeat'); p2.setTransform(new DOMMatrix([W / 1400, 0, 0, W / 1400, 0, 0])); g.fillStyle = p2; } else g.fillStyle = rgb(paint);
      g.fillRect(0, 0, W, H); g.fillStyle = k > 0 ? `rgba(255,255,255,${k})` : `rgba(0,0,0,${-k})`; g.fillRect(0, 0, W, H);
      if (!textured) noiseOverlay(g, 0.06, 'multiply');
      g.restore();
    };
    const micro = st.finish === 'Microcement';
    const L0 = ext(TL, 0), L1 = ext(BL, 0), R0 = ext(TR, W), R1 = ext(BR, W);
    wallFill([L0, TL, BL, L1], -0.1, micro);
    wallFill([TR, R0, R1, BR], -0.16, micro);
    wallFill([TL, TR, BR, BL], 0, micro);
    // window on back wall
    const wx = 0.5 * W, wy = 0.11 * H, ww = 0.26 * W, wh = 0.42 * H;
    gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, 'rgb(170,205,236)'); gr.addColorStop(0.75, 'rgb(222,236,246)'); gr.addColorStop(1, 'rgb(150,182,140)');
    g.fillStyle = 'rgb(46,48,52)'; g.fillRect(wx - 0.006 * W, wy - 0.006 * W, ww + 0.012 * W, wh + 0.012 * W);
    g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
    g.fillStyle = 'rgb(46,48,52)'; g.fillRect(wx + ww / 2 - 0.003 * W, wy, 0.006 * W, wh);
    // light pool from window on floor (soft, fading)
    { const o = mk(W, H), q = o.getContext('2d'); q.fillStyle = 'rgba(255,250,235,1)'; q.beginPath(); q.moveTo(wx, BL[1]); q.lineTo(wx + ww, BL[1]); q.lineTo(wx + ww * 1.6, H); q.lineTo(wx - ww * 0.15, H); q.closePath(); q.fill();
      q.globalCompositeOperation = 'destination-in'; const fg = q.createLinearGradient(0, BL[1], 0, H); fg.addColorStop(0, 'rgba(0,0,0,.5)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = fg; q.fillRect(0, 0, W, H);
      g.save(); g.globalCompositeOperation = 'soft-light'; if ('filter' in g) g.filter = `blur(${W / 70}px)`; g.drawImage(o, 0, 0); g.restore(); }
    // sideboard + plant for scale
    const sx = 0.21 * W, sy = 0.47 * H, sw = 0.22 * W, sh = 0.13 * H;
    g.fillStyle = 'rgb(122,92,64)'; g.fillRect(sx, sy, sw, sh); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(sx, sy, sw, 0.012 * H); g.fillStyle = 'rgb(40,40,42)'; g.fillRect(sx + 0.01 * W, sy + sh, 0.008 * W, 0.006 * H); g.fillRect(sx + sw - 0.018 * W, sy + sh, 0.008 * W, 0.006 * H);
    g.fillStyle = 'rgb(232,226,214)'; g.fillRect(sx + 0.03 * W, sy - 0.06 * H, 0.03 * W, 0.06 * H);
    const px = 0.8 * W, py = 0.66 * H;
    // reflections (sheen): mirror window + sideboard into floor
    if (sheen > 0) {
      const o = mk(W, H), q = o.getContext('2d');
      q.translate(0, 2 * BL[1]); q.scale(1, -1);
      q.fillStyle = 'rgb(46,48,52)'; q.fillRect(wx - 0.006 * W, wy - 0.006 * W, ww + 0.012 * W, wh + 0.012 * W);
      q.fillStyle = gr; q.fillRect(wx, wy, ww, wh); q.fillStyle = 'rgb(122,92,64)'; q.fillRect(sx, sy, sw, sh);
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'destination-in';
      const fg = q.createLinearGradient(0, BL[1], 0, BL[1] + 0.32 * H); fg.addColorStop(0, 'rgba(0,0,0,1)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = fg; q.fillRect(0, 0, W, H);
      g.save(); g.beginPath(); g.rect(0, BL[1], W, H - BL[1]); g.clip();
      g.globalAlpha = sheen; if ('filter' in g) g.filter = `blur(${st.sheen === 'High polish' ? Math.max(1, W / 400) : W / 80}px)`;
      g.drawImage(o, 0, 0); g.restore();
      gr = g.createRadialGradient(wx + ww / 2, BL[1] + 0.12 * H, 0, wx + ww / 2, BL[1] + 0.12 * H, 0.5 * W); gr.addColorStop(0, `rgba(255,255,255,${sheen * 0.4})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, BL[1], W, H - BL[1]);
    }
    // contact shadow at wall/floor junction
    gr = g.createLinearGradient(0, BL[1], 0, BL[1] + 0.04 * H); gr.addColorStop(0, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(BL[0], BL[1], BR[0] - BL[0], 0.04 * H);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(sx + sw / 2, sy + sh + 0.008 * H, sw * 0.55, 0.012 * H, 0, 0, 6.283); g.fill();
    // plant in front right
    g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(px, py + 0.11 * H, 0.06 * W, 0.016 * H, 0, 0, 6.283); g.fill();
    g.fillStyle = 'rgb(58,58,60)'; g.beginPath(); g.moveTo(px - 0.04 * W, py); g.lineTo(px + 0.04 * W, py); g.lineTo(px + 0.032 * W, py + 0.11 * H); g.lineTo(px - 0.032 * W, py + 0.11 * H); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) { const a = -1.57 + (i - 4) * 0.28; g.strokeStyle = i % 2 ? 'rgb(52,104,58)' : 'rgb(76,132,70)'; g.lineWidth = 0.012 * W; g.lineCap = 'round'; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.cos(a) * 0.05 * W, py + Math.sin(a) * 0.14 * H, px + Math.cos(a) * 0.09 * W, py + Math.sin(a) * 0.2 * H); g.stroke(); }
    // vignette
    gr = g.createRadialGradient(W / 2, H * 0.55, W * 0.3, W / 2, H * 0.55, W * 0.8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }

  // ---------- scene: photo-real drive (client's own photo, surface re-laid in perspective) ----------
  // C.photo = { src, w, h, crop:[x,y,w,h], poly:[[x,y]...] (drive + border strip, photo px),
  //             plane:[[u,v]x4] metres, img:[[x,y]x4] photo px (homography), extent:[u0,u1,v0,v1], shadeK }
  const PH = C.photo || null;
  function solveH(src, dst) {
    // 8x8 system: dst = H * src (homogeneous)
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [X, Y] = dst[i];
      A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
      A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
    }
    for (let c = 0; c < 8; c++) {
      let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
      for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
    }
    return [...b.map((v, i) => v / A[i][i]), 1];
  }
  const photo = PH ? { img: null, ready: null, cache: {} } : null;
  if (PH) photo.ready = new Promise((res) => { const im = new Image(); im.decoding = 'async'; im.onload = () => { photo.img = im; res(); }; im.src = PH.src; });
  // plane texture: one canvas covering the drive in metres, T px per metre, front (v0) at the bottom
  const TPM = 100;
  function resinField(g, w, h, P, seed) {
    const im = g.createImageData(w, h), d = im.data, r = mulberry(seed), base = P.slice(0, 4), hi = P[4] || [240, 240, 240];
    for (let i = 0; i < w * h; i++) {
      const k = r(), c = k < 0.035 ? hi : base[(r() * base.length) | 0], f = 0.88 + r() * 0.24;
      d[i * 4] = clamp(c[0] * f); d[i * 4 + 1] = clamp(c[1] * f); d[i * 4 + 2] = clamp(c[2] * f); d[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }
  function planeTexture(spec) {
    const key = JSON.stringify(spec);
    if (photo.cache[key]) return photo.cache[key];
    const [u0, u1, v0, v1] = PH.extent, w = Math.round((u1 - u0) * TPM), h = Math.round((v1 - v0) * TPM);
    const c = mk(w, h), g = c.getContext('2d'), P = pal(spec.surface, spec.colour);
    if (spec.surface === 'resin') resinField(g, w, h, P, 17);
    else paintSurface(g, { x: 0, y: 0, w, h }, { ...spec, border: 'None' }, TPM, '');
    // border: soldier course along the front edge strip (v0 .. 0)
    const sh = Math.round(-v0 * TPM);
    if (spec.border && spec.border !== 'None') {
      const BP = PAL.block[spec.border] || PAL.block.Charcoal;
      g.save(); g.fillStyle = rgb(avg(BP), 0.55); g.fillRect(0, h - sh, w, sh);
      for (let x = 0; x < w; x += 0.1 * TPM) brick(g, x, h - sh, 0.1 * TPM, sh, BP, 9, 0.9);
      g.restore();
    } else if (spec.surface === 'resin') { /* resin runs to the edge */ }
    // mip chain
    const mips = []; let src = c;
    for (let L = 0; L < 5; L++) {
      const cw = src.width, ch = src.height;
      mips.push({ w: cw, h: ch, d: src.getContext('2d').getImageData(0, 0, cw, ch).data });
      if (cw < 64) break;
      const n = mk(Math.max(1, cw >> 1), Math.max(1, ch >> 1)), ng = n.getContext('2d'); ng.imageSmoothingQuality = 'high'; ng.drawImage(src, 0, 0, n.width, n.height); src = n;
    }
    return (photo.cache[key] = mips);
  }
  let PW = 0, PHh = 0, prep = null;
  function preparePhoto(W, Hh) {
    const [cx, cy, cw] = PH.crop, s = W / cw;
    const base = mk(W, Hh), bg = base.getContext('2d'); bg.imageSmoothingQuality = 'high';
    bg.drawImage(photo.img, cx, cy, cw, PH.crop[3], 0, 0, W, Hh);
    const lum = mk(W, Hh), lg = lum.getContext('2d'); if ('filter' in lg) lg.filter = `blur(${Math.max(1.5, 4 * s)}px)`; lg.drawImage(base, 0, 0);
    const mask = mk(W, Hh), mg = mask.getContext('2d'); if ('filter' in mg) mg.filter = `blur(${Math.max(0.6, 1.4 * s)}px)`;
    mg.fillStyle = '#fff'; mg.beginPath(); PH.poly.forEach(([x, y], i) => mg[i ? 'lineTo' : 'moveTo']((x - cx) * s, (y - cy) * s)); mg.closePath(); mg.fill();
    const bd = bg.getImageData(0, 0, W, Hh).data, ld = lg.getImageData(0, 0, W, Hh).data, md = mg.getImageData(0, 0, W, Hh).data;
    // inverse homography: canvas px -> plane metres
    const Hm = solveH(PH.img.map(([x, y]) => [(x - cx) * s, (y - cy) * s]), PH.plane);
    let x0 = W, x1 = 0, y0 = Hh, y1 = 0, sum = 0, n = 0;
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (md[i] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    // reference brightness of the original drive (front strip excluded)
    for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const i = (y * W + x) * 4; if (md[i] > 250) { const ww = Hm[6] * x + Hm[7] * y + 1, v = (Hm[3] * x + Hm[4] * y + Hm[5]) / ww; if (v > 0.2) { sum += ld[i] * 0.3 + ld[i + 1] * 0.59 + ld[i + 2] * 0.11; n++; } } }
    return { W, Hh, bd, ld, md, Hm, box: [x0, x1, y0, y1], ref: sum / Math.max(1, n) };
  }
  function sample(m, tx, ty, out) {
    const w = m.w, h = m.h; tx = Math.min(w - 1.001, Math.max(0, tx)); ty = Math.min(h - 1.001, Math.max(0, ty));
    const x = tx | 0, y = ty | 0, fx = tx - x, fy = ty - y, d = m.d, i = (y * w + x) * 4, j = i + w * 4;
    for (let k = 0; k < 3; k++) out[k] = (d[i + k] * (1 - fx) + d[i + 4 + k] * fx) * (1 - fy) + (d[j + k] * (1 - fx) + d[j + 4 + k] * fx) * fy;
  }
  function photoScene(g, W, Hh, spec) {
    if (!prep || prep.W !== W || prep.Hh !== Hh) prep = preparePhoto(W, Hh);
    const { bd, ld, md, Hm, box: [x0, x1, y0, y1], ref } = prep, mips = planeTexture(spec);
    const [u0, , , v1] = PH.extent, K = PH.shadeK || 0.85, resin = spec.surface === 'resin';
    const out = g.createImageData(W, Hh), od = out.data; od.set(bd);
    const c = [0, 0, 0];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4, a = md[i] / 255; if (a <= 0) continue;
      const w = Hm[6] * x + Hm[7] * y + 1, u = (Hm[0] * x + Hm[1] * y + Hm[2]) / w, v = (Hm[3] * x + Hm[4] * y + Hm[5]) / w;
      const w2 = Hm[6] * (x + 1) + Hm[7] * y + 1, du = (Hm[0] * (x + 1) + Hm[1] * y + Hm[2]) / w2 - u;
      const w3 = Hm[6] * x + Hm[7] * (y + 1) + 1, dv = (Hm[3] * x + Hm[4] * (y + 1) + Hm[5]) / w3 - v;
      const fp = Math.max(Math.abs(du), Math.abs(dv)) * TPM; let L = fp > 1 ? Math.min(mips.length - 1, Math.round(Math.log2(fp))) : 0;
      const m = mips[L], sc = 1 / (1 << L);
      sample(m, (u - u0) * TPM * sc, (v1 - v) * TPM * sc, c);
      let sh = 1;
      if (v > 0.03) { const l = ld[i] * 0.3 + ld[i + 1] * 0.59 + ld[i + 2] * 0.11; sh = Math.pow(Math.max(0.05, l / ref), K); sh = sh < 0.42 ? 0.42 : sh > 1.35 ? 1.35 : sh; if (v < (PH.frontFlat || 0)) sh = Math.max(sh, 0.92 + 0.08 * Math.min(1, v / PH.frontFlat)); }
      // gentle distance haze + resin sheen
      const haze = Math.min(0.12, Math.max(0, (v - 2) * 0.02));
      let r = c[0] * sh, gg = c[1] * sh, b = c[2] * sh;
      if (resin) { const sp = Math.max(0, 1 - Math.abs((x / W) - 0.62 + (y / Hh) * 0.35) * 5) * 14; r += sp; gg += sp; b += sp; }
      r = r * (1 - haze) + 200 * haze; gg = gg * (1 - haze) + 202 * haze; b = b * (1 - haze) + 206 * haze;
      od[i] = clamp(bd[i] * (1 - a) + r * a); od[i + 1] = clamp(bd[i + 1] * (1 - a) + gg * a); od[i + 2] = clamp(bd[i + 2] * (1 - a) + b * a);
    }
    g.putImageData(out, 0, 0);
  }

  // ---------- state + UI ----------
  const isRoom = C.type === 'room';
  const areas = C.areas || [];
  const st = isRoom ? { finish: C.finishes[0], shade: C.shades[0], sheen: 'Satin' } : { area: areas[0].key, by: {} };
  if (!isRoom) areas.forEach((a) => { st.by[a.key] = { surface: a.surfaces[0], colour: Object.keys(PAL[a.surfaces[0]]).find((n) => (a.colours?.[a.surfaces[0]] || []).includes(n)) || (a.colours?.[a.surfaces[0]] || Object.keys(PAL[a.surfaces[0]]))[0], pattern: 'Herringbone', border: a.border === false ? 'None' : 'Charcoal' }; });
  const cur = () => st.by[st.area];
  const areaCfg = () => areas.find((a) => a.key === st.area);
  const colours = (a, s) => (a.colours && a.colours[s]) || Object.keys(PAL[s]);

  let W = 0, H = 0, raf = 0;
  let frame = null, ov = null, sweepEl = null, drawn = false, busy = false, again = false;
  if (PH) {
    root.classList.add('cfg-photo');
    frame = document.createElement('div'); frame.className = 'cfg-frame';
    cv.replaceWith(frame); ov = mk(2, 2); ov.className = 'cfg-ov'; ov.setAttribute('aria-hidden', 'true');
    sweepEl = document.createElement('i'); sweepEl.className = 'cfg-sweep'; sweepEl.setAttribute('aria-hidden', 'true');
    const vg = document.createElement('i'); vg.className = 'cfg-vig'; vg.setAttribute('aria-hidden', 'true');
    frame.append(cv, ov, vg, sweepEl);
    if (matchMedia('(pointer:fine) and (min-width:900px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5; frame.style.transform = `perspective(1100px) rotateX(${(-dy * 6).toFixed(2)}deg) rotateY(${(dx * 8).toFixed(2)}deg)`; });
      stage.addEventListener('pointerleave', () => { frame.style.transform = ''; });
    }
  }
  async function photoRender() {
    if (busy) { again = true; return; }
    busy = true; await photo.ready;
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.min(1280, Math.round(r.width * dpr)), h = Math.round((w * PH.crop[3]) / PH.crop[2]);
    if (w > 10) {
      if (drawn && cv.width === w) { ov.width = w; ov.height = h; ov.getContext('2d').drawImage(cv, 0, 0); ov.style.transition = 'none'; ov.style.opacity = '1'; }
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      photoScene(ctx, w, h, cur());
      if (drawn) { void ov.offsetWidth; ov.style.transition = 'opacity .25s ease'; ov.style.opacity = '0'; sweepEl.classList.remove('go'); void sweepEl.offsetWidth; sweepEl.classList.add('go'); }
      drawn = true; if (load) { const l = load; load = null; l.style.transition = 'opacity .4s ease'; l.style.opacity = '0'; setTimeout(() => l.remove(), 450); }
    }
    busy = false; if (again) { again = false; photoRender(); }
  }
  function render() {
    if (PH) { raf = 0; photoRender(); return; }
    raf = 0;
    const r = stage.getBoundingClientRect(), dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (!w || !h) return;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    W = w; H = h;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    if (isRoom) roomScene(ctx, W, H, st);
    else { const S = W / 12; (st.area === 'patio' ? backScene : frontScene)(ctx, W, H, S, cur(), C.scene); }
    if (load) load.remove();
  }
  const draw = () => { if (!raf) raf = requestAnimationFrame(render); };
  new ResizeObserver(draw).observe(stage);

  const btn = (label, on, cls = '') => `<button type="button" aria-pressed="${on}"${cls ? ` class="${cls}"` : ''} data-v="${label}">${label}</button>`;
  function swatch(kind, name) {
    const c = mk(72), g = c.getContext('2d');
    if (isRoom) { g.fillStyle = g.createPattern(finishTile(kind, name), 'repeat'); g.fillRect(0, 0, 72, 72); }
    else paintSurface(g, { x: 0, y: 0, w: 72, h: 72 }, { surface: kind, colour: name, pattern: 'Herringbone', border: 'None' }, 110);
    return c.toDataURL('image/png');
  }
  const swCache = {};
  const sw = (kind, name) => (swCache[kind + name] ||= swatch(kind, name));
  function summary() {
    if (isRoom) return `${st.finish}, ${st.shade}, ${st.sheen.toLowerCase()} finish`;
    return [areaCfg()].map((a) => { const s = st.by[a.key]; return `${areas.length > 1 ? a.label + ': ' : ''}${SURF[s.surface]}, ${s.colour}${s.surface === 'block' ? ', ' + s.pattern.toLowerCase() : ''}${s.border !== 'None' && !['sandstone', 'porcelain'].includes(s.surface) ? ', ' + s.border.toLowerCase() + ' border' : ''}`; }).join(' · ');
  }
  function build() {
    let h = '';
    if (isRoom) {
      h += `<div class="grp"><div class="lab">Finish</div><div class="chips" data-k="finish">${C.finishes.map((f) => btn(f, st.finish === f)).join('')}</div></div>`;
      h += `<div class="grp"><div class="lab">Shade <span>${st.shade}</span></div><div class="sws" data-k="shade">${C.shades.map((s) => `<button type="button" aria-pressed="${st.shade === s}" data-v="${s}"><i style="background-image:url(${sw(st.finish, s)})"></i>${s}</button>`).join('')}</div></div>`;
      h += `<div class="grp"><div class="lab">Sheen</div><div class="chips" data-k="sheen">${Object.keys(SHEEN).map((s) => btn(s, st.sheen === s)).join('')}</div></div>`;
    } else {
      const a = areaCfg(), s = cur();
      if (areas.length > 1) h += `<div class="grp"><div class="lab">Area</div><div class="chips" data-k="area">${areas.map((x) => `<button type="button" aria-pressed="${st.area === x.key}" data-v="${x.key}">${x.label}</button>`).join('')}</div></div>`;
      h += `<div class="grp"><div class="lab">Surface</div><div class="chips" data-k="surface">${a.surfaces.map((x) => `<button type="button" aria-pressed="${s.surface === x}" data-v="${x}">${SURF[x]}</button>`).join('')}</div></div>`;
      h += `<div class="grp"><div class="lab">Colour <span>${s.colour}</span></div><div class="sws" data-k="colour">${colours(a, s.surface).map((n) => `<button type="button" aria-pressed="${s.colour === n}" data-v="${n}"><i style="background-image:url(${sw(s.surface, n)})"></i>${n}</button>`).join('')}</div></div>`;
      if (s.surface === 'block') h += `<div class="grp"><div class="lab">Pattern</div><div class="chips" data-k="pattern">${['Herringbone', 'Basketweave', 'Stretcher'].map((p) => btn(p, s.pattern === p)).join('')}</div></div>`;
      if (!['sandstone', 'porcelain'].includes(s.surface)) h += `<div class="grp"><div class="lab">Border</div><div class="chips" data-k="border">${(C.borders || ['None', 'Charcoal', 'Contrast']).map((p) => btn(p, s.border === p)).join('')}</div></div>`;
    }
    h += `<div class="sum">${summary()}</div><button type="button" class="btn wide cfg-go">${C.cta || (isRoom ? 'Get a quote for this finish' : 'Get a quote for this design')} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`;
    ui.innerHTML = h;
  }
  ui.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('cfg-go')) {
      let tile;
      if (isRoom) tile = st.finish === 'Microcement' ? C.tileFor.Microcement : C.tileFor['Polished concrete'];
      else { const s = cur(); tile = st.area === 'patio' ? C.tileFor.patio : (C.tileFor[s.surface] || C.tileFor.drive); }
      if (window.cgQuote) window.cgQuote(tile, summary());
      return;
    }
    const k = b.parentElement.dataset.k, v = b.dataset.v;
    if (!k) return;
    if (isRoom) st[k] = v;
    else if (k === 'area') st.area = v;
    else {
      const s = cur(); s[k] = v;
      if (k === 'surface') { const list = colours(areaCfg(), v); if (!list.includes(s.colour)) s.colour = list[0]; }
    }
    build(); draw();
  });
  build(); draw();
  // hero "see it on a real drive" link preselects the surface here
  window.cgCfgSet = (sf) => { if (isRoom) return; const a = areaCfg(); if (!a || !a.surfaces.includes(sf)) return; const s = cur(); s.surface = sf; const list = colours(a, sf); if (!list.includes(s.colour)) s.colour = list[0]; build(); draw(); };
  if (window.__cfgPre) window.cgCfgSet(window.__cfgPre);
})();
