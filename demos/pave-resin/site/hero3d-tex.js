// Seamless (tileable) versions of the current hero's resin and tarmac renderers in surface-gen.js.
// Same stone shapes, tones, binder and lighting maths, so the 3D hero shows exactly the colours that were live;
// only the cell lattice wraps, so the texture repeats with no seam. Runs in a Web Worker (hero3d-tex.js).
// genTile(kind, N, P) -> { alb: Uint8ClampedArray RGBA, nrm: Uint8ClampedArray RGBA }, N x N px covering P cells.
function genTile(kind, N, P, seed) {
  seed = seed || 7;
  const hash = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + (s || seed) * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d); h = Math.imul(h ^ (h >>> 12), 0x297a2d39); h ^= h >>> 15; return (h >>> 0) / 4294967296; };
  const sm = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const cellmm = kind === 'resin' ? 3.4 : 1.6, tile = P * cellmm, mmpp = tile / N, aa = Math.max(0.35, mmpp * 0.75);
  const wrap = (g, p) => ((g % p) + p) % p;
  // periodic value noise (period Q lattice cells)
  const vnoise = (x, y, s, Q) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const X0 = wrap(xi, Q), X1 = wrap(xi + 1, Q), Y0 = wrap(yi, Q), Y1 = wrap(yi + 1, Q);
    const a = hash(X0, Y0, s), b = hash(X1, Y0, s), c = hash(X0, Y1, s), d = hash(X1, Y1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const wor = new Float64Array(5);
  const R = kind === 'resin' ? 2 : 1; // resin stones are rotated/stretched: search 5x5 so no cell-edge seams
  function worley(px, py, s, jit) {
    const cx = Math.floor(px), cy = Math.floor(py); let d1 = 9, d2 = 9, id = 0, vx = 0, vy = 0;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
      const gx = cx + i, gy = cy + j, hx = wrap(gx, P), hy = wrap(gy, P);
      const ox = gx + 0.5 + (hash(hx, hy, s) - 0.5) * jit, oy = gy + 0.5 + (hash(hx, hy, s + 31) - 0.5) * jit;
      const a = hash(hx, hy, s + 7) * Math.PI, ca = Math.cos(a), sa = Math.sin(a), dx = px - ox, dy = py - oy;
      const ex = (dx * ca + dy * sa), ey = (-dx * sa + dy * ca) * (1.15 + hash(hx, hy, s + 9) * 0.35);
      const sc = 0.75 + hash(hx, hy, s + 13) * 0.55;
      const d = Math.sqrt(ex * ex + ey * ey) / sc;
      if (d < d1) { d2 = d1; d1 = d; id = hx * 7919 + hy * 104729; vx = dx / sc; vy = dy / sc; } else if (d < d2) d2 = d;
    }
    wor[0] = d1; wor[1] = d2; wor[2] = id; wor[3] = vx; wor[4] = vy; return wor;
  }
  const alb = new Uint8ClampedArray(N * N * 4), hgt = new Float32Array(N * N);
  if (kind === 'resin') {
    const tones = ['#d9dadb', '#b9bbbe', '#9a9da1', '#7d8085'].map(hex), binder = hex('#3a3c3f');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const X = (x * mmpp) / cellmm, Y = ((N - y) * mmpp) / cellmm;
      const w = worley(X, Y, 3, 0.85), gap = (w[1] - w[0]) * cellmm;
      const t = tones[Math.floor(hash(w[2], 9, 5) * 4)], jit = 0.86 + hash(w[2], 1, 5) * 0.22;
      const r2 = w[3] * w[3] + w[4] * w[4], dome = 1.0 - 0.45 * Math.min(1, r2 * 1.6), lit = Math.max(0, (-w[3] + w[4]) * 0.5) * 0.3;
      const spec = Math.max(0, 1 - Math.hypot(w[3] + 0.18, w[4] - 0.18) * 4.5) * 70;
      const body = sm(0.12, 0.12 + aa, gap), k = jit * (dome + lit), i = (y * N + x) * 4;
      alb[i] = binder[0] + (t[0] * k + spec - binder[0]) * body; alb[i + 1] = binder[1] + (t[1] * k + spec - binder[1]) * body; alb[i + 2] = binder[2] + (t[2] * k + spec - binder[2]) * body; alb[i + 3] = 255;
      hgt[y * N + x] = body * (0.45 + 0.55 * Math.sqrt(Math.max(0, 1 - Math.min(1, r2 * 1.4))));
    }
  } else {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const X = x * mmpp, Y = (N - y) * mmpp;
      const w = worley(X / 1.6, Y / 1.6, 21, 0.9), gap = (w[1] - w[0]) * 1.6;
      const light = hash(w[2], 3, 9) < 0.06, base = light ? 125 : 52 + hash(w[2], 5, 9) * 40;
      const r2 = w[3] * w[3] + w[4] * w[4], dome = 1.1 - 0.3 * Math.min(1, r2);
      const body = sm(0.08, 0.08 + aa * 0.7, gap);
      const v = (18 + (base * dome - 18) * body) * (0.97 + vnoise(X / 20, Y / 20, 8, tile / 20) * 0.05), i = (y * N + x) * 4;
      alb[i] = v; alb[i + 1] = v * 1.01; alb[i + 2] = v * 1.05; alb[i + 3] = 255;
      hgt[y * N + x] = body * (0.5 + 0.5 * Math.sqrt(Math.max(0, 1 - Math.min(1, r2))));
    }
  }
  // tangent-space normal map from the height field (wrapping, so it tiles too)
  const nrm = new Uint8ClampedArray(N * N * 4), st = kind === 'resin' ? 2.2 : 1.6;
  const H = (x, y) => hgt[wrap(y, N) * N + wrap(x, N)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * st, dy = (H(x, y + 1) - H(x, y - 1)) * st, l = Math.hypot(dx, dy, 1), i = (y * N + x) * 4;
    nrm[i] = (-dx / l * 0.5 + 0.5) * 255; nrm[i + 1] = (dy / l * 0.5 + 0.5) * 255; nrm[i + 2] = (1 / l * 0.5 + 0.5) * 255; nrm[i + 3] = 255;
  }
  return { alb, nrm, tile: tile / 1000 };
}

onmessage = (e) => { const { id, kind, N, P } = e.data; const d = genTile(kind, N, P); postMessage({ id, alb: d.alb, nrm: d.nrm, tile: d.tile }, [d.alb.buffer, d.nrm.buffer]); };
