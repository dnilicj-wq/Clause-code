// Procedural paving surfaces, rendered per pixel (no tiles, so nothing repeats).
// Shared by the hero surface picker (runs in a Web Worker) and the build (Node, for the services resin card).
// genSurface(kind, W, H, mPerW, opts) -> Uint8ClampedArray RGBA, W x H.
//   The texture covers mPerW metres across; y = 0 is the far edge, y = H the front edge (nearest the viewer).
//   kind: 'resin' | 'block' | 'tarmac' | 'porcelain'.  opts.edge: draw the front border/kerb (default true).
function genSurface(kind, W, H, mPerW, opts) {
  opts = opts || {};
  const out = new Uint8ClampedArray(W * H * 4);
  const mmpp = (mPerW * 1000) / W; // millimetres per pixel
  const seed = opts.seed || 7;
  const hash = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + (s || seed) * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const sm = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
  // smooth value noise for cloudiness
  const vnoise = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const put = (i, r, g, b) => { out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255; };
  const aa = Math.max(0.35, mmpp * 0.75); // edge softening width in mm

  // Worley stones: returns [d1, d2, id, vx, vy] for a point in cell units
  const wor = new Float64Array(5);
  function worley(px, py, s, jit) {
    const cx = Math.floor(px), cy = Math.floor(py); let d1 = 9, d2 = 9, id = 0, vx = 0, vy = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const gx = cx + i, gy = cy + j, ox = gx + 0.5 + (hash(gx, gy, s) - 0.5) * jit, oy = gy + 0.5 + (hash(gx, gy, s + 31) - 0.5) * jit;
      // slightly elongated, randomly rotated stones
      const a = hash(gx, gy, s + 7) * Math.PI, ca = Math.cos(a), sa = Math.sin(a), dx = px - ox, dy = py - oy;
      const ex = (dx * ca + dy * sa), ey = (-dx * sa + dy * ca) * (1.15 + hash(gx, gy, s + 9) * 0.35);
      const sc = 0.75 + hash(gx, gy, s + 13) * 0.55; // stone size spread (2–6 mm)
      const d = Math.sqrt(ex * ex + ey * ey) / sc;
      if (d < d1) { d2 = d1; d1 = d; id = gx * 7919 + gy * 104729; vx = dx / sc; vy = dy / sc; } else if (d < d2) d2 = d;
    }
    wor[0] = d1; wor[1] = d2; wor[2] = id; wor[3] = vx; wor[4] = vy; return wor;
  }

  if (kind === 'resin') {
    const tones = (opts.tones || ['#d9dadb', '#b9bbbe', '#9a9da1', '#7d8085']).map(hex), binder = hex('#3a3c3f');
    const cell = 3.4; // mm, stones touch: 2–6 mm
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = (x * mmpp) / cell, Y = ((H - y) * mmpp) / cell;
      const w = worley(X, Y, 3, 0.85), gap = (w[1] - w[0]) * cell; // mm to the stone boundary
      const t = tones[Math.floor(hash(w[2], 9, 5) * 4)], jit = 0.86 + hash(w[2], 1, 5) * 0.22;
      // dome shading, lit from the top-left; small specular glint
      const r2 = w[3] * w[3] + w[4] * w[4], dome = 1.0 - 0.45 * Math.min(1, r2 * 1.6), lit = Math.max(0, (-w[3] + w[4]) * 0.5) * 0.3;
      const spec = Math.max(0, 1 - Math.hypot(w[3] + 0.18, w[4] - 0.18) * 4.5) * 70;
      const body = sm(0.12, 0.12 + aa, gap); // 0 in the crevice, 1 on the stone
      const k = jit * (dome + lit), i = (y * W + x) * 4;
      put(i, binder[0] + (t[0] * k + spec - binder[0]) * body, binder[1] + (t[1] * k + spec - binder[1]) * body, binder[2] + (t[2] * k + spec - binder[2]) * body);
    }
    return out;
  }

  if (kind === 'block') {
    const char = ['#3c3d40', '#47484c', '#333437', '#525357'].map(hex), silv = ['#8e9093', '#7d7f83', '#a0a2a5'].map(hex), joint = hex('#24221f'), sold = ['#2e2f32', '#38393c'].map(hex);
    const U = 100, J = 5, c45 = Math.SQRT1_2, border = opts.edge === false ? 0 : 220;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = x * mmpp, Y = (H - y) * mmpp, i = (y * W + x) * 4;
      let col, ex, id, lu, lv, bw, bh;
      if (Y < border) { // soldier course along the front edge: 100 x 200 mm blocks standing end-on
        const bx = Math.floor(X / U); lu = X - bx * U; lv = Y - 10; bw = U; bh = 200; id = bx * 31 + 999; col = sold[hash(bx, 3, 17) < 0.5 ? 0 : 1];
        if (Y < 10) { const n = 0.85 + vnoise(X / 6, Y / 6, 4) * 0.2; put(i, 70 * n, 68 * n, 64 * n); continue; }
      } else {
        // 45° herringbone, 200 x 100 mm blocks (units of 100 mm)
        const u = (X * c45 + Y * c45) / U, v = (-X * c45 + Y * c45) / U;
        let s = Math.floor((u - v + 3) / 4), found = false;
        for (let t = 0; t < 2 && !found; t++, s--) {
          const pu = u - 2 * s, pv = v + 2 * s, k = Math.floor(pv);
          if (pu >= k && pu < k + 2 && pv >= k && pv < k + 1) { lu = (pu - k) * U; lv = (pv - k) * U; bw = 2 * U; bh = U; id = (k * 2) * 7919 + s * 104729; found = true; break; }
          const k2 = Math.floor(pu);
          if (pv >= k2 + 1 && pv < k2 + 3) { lu = (pu - k2) * U; lv = (pv - k2 - 1) * U; bw = U; bh = 2 * U; id = (k2 * 2 + 1) * 7919 + s * 104729; found = true; break; }
        }
        if (!found) { put(i, joint[0], joint[1], joint[2]); continue; }
        const r = hash(id, 1, 11); col = r < 0.3 ? silv[Math.floor(hash(id, 2, 11) * 3)] : char[Math.floor(hash(id, 3, 11) * 4)];
      }
      ex = Math.min(lu, bw - lu, lv, bh - lv); // mm to the block edge
      const body = sm(J / 2, J / 2 + aa, ex);
      // chamfer: lit far/left edges, shaded near/right edges
      const ch = ex < J / 2 + 4 ? ((lu < 6 || bh - lv < 6) ? 1.18 : 0.8) : 1;
      const n = (0.9 + vnoise(X / 9, Y / 9, id & 255) * 0.14 + (hash(x, y, 2) - 0.5) * 0.1) * (0.93 + hash(id, 4, 11) * 0.14) * ch;
      put(i, joint[0] + (col[0] * n - joint[0]) * body, joint[1] + (col[1] * n - joint[1]) * body, joint[2] + (col[2] * n - joint[2]) * body);
    }
    return out;
  }

  if (kind === 'tarmac') {
    const kerbH = opts.edge === false ? 0 : 160, kerbL = 914;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = x * mmpp, Y = (H - y) * mmpp, i = (y * W + x) * 4;
      if (Y < kerbH) { // concrete edging kerb with joints, bevelled top edge
        const jx = X % kerbL, jn = Math.min(jx, kerbL - jx), body = sm(1.5, 1.5 + aa, jn);
        const bev = Y > kerbH - 18 ? 1.12 : Y < 12 ? 0.8 : 1;
        const n = (0.86 + vnoise(X / 14, Y / 14, 8) * 0.16 + (hash(x, y, 4) - 0.5) * 0.12) * bev;
        const c = 168 * n; put(i, 60 + (c - 60) * body, 60 + (c * 0.985 - 60) * body, 60 + (c * 0.96 - 60) * body);
        continue;
      }
      const w = worley(X / 1.6, Y / 1.6, 21, 0.9), gap = (w[1] - w[0]) * 1.6;
      const lightStone = hash(w[2], 3, 9) < 0.06;
      const base = lightStone ? 125 : 52 + hash(w[2], 5, 9) * 40;
      const dome = 1.1 - 0.3 * Math.min(1, w[3] * w[3] + w[4] * w[4]);
      const body = sm(0.08, 0.08 + aa * 0.7, gap);
      const shade = Y < kerbH + 30 ? 0.82 + (Y - kerbH) / 30 * 0.18 : 1; // shadow line beside the kerb
      const v = (18 + (base * dome - 18) * body) * shade * (0.94 + vnoise(X / 40, Y / 40, 6) * 0.12);
      put(i, v, v * 1.01, v * 1.05);
    }
    return out;
  }

  // porcelain: 900 x 600 mm light-grey slabs, half-bond, crisp 4 mm joints
  const SW = 900, SH = 600, J = 4, grout = hex('#45474a');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = x * mmpp, Y = (H - y) * mmpp, i = (y * W + x) * 4;
    const row = Math.floor(Y / SH), off = (row & 1) * SW / 2, col = Math.floor((X + off) / SW);
    const lu = X + off - col * SW, lv = Y - row * SH, ex = Math.min(lu, SW - lu, lv, SH - lv), id = row * 977 + col;
    const body = sm(J / 2, J / 2 + aa, ex);
    const tone = 196 + (hash(id, 1, 3) - 0.5) * 14;
    const cloud = 0.95 + vnoise(X / 120 + id, Y / 120, 12) * 0.07 + vnoise(X / 22, Y / 22, 13) * 0.03;
    const speck = hash(x, y, 7) < 0.02 ? 0.88 : 1;
    const bev = ex < J / 2 + 3 ? (lv > SH - 5 || lu < 5 ? 1.05 : 0.93) : 1;
    const v = tone * cloud * speck * bev;
    put(i, grout[0] + (v - grout[0]) * body, grout[1] + (v * 1.004 - grout[1]) * body, grout[2] + (v * 1.012 - grout[2]) * body);
  }
  return out;
}
if (typeof module !== 'undefined') module.exports = { genSurface };
