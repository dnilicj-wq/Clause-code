// Bakes the porcelain-slab hero textures from CC0 Poly Haven scans in research/tex/:
// granite_tile_04 (slab face, joints painted out, cooled to porcelain grey) and
// concrete_floor_damaged_01 (old ground, with the crack + moss maps from prep-tex.mjs baked in).
import sharp from 'sharp';
const T = 'research/tex/', O = 'public/tex/';
const N = 2048;
const COLS = [[186, 205], [595, 615], [1004, 1023], [1414, 1434], [1823, 1844]];
const ROWS = [[2038, 2057], [400, 419], [809, 828], [1216, 1239], [1628, 1648]];
const rgb = async (f) => (await sharp(T + f).removeAlpha().resize(N, N).raw().toBuffer());
const w = (i) => ((i % N) + N) % N;
function inpaint(buf, bands, axis) {
  for (const [a, b] of bands) {
    for (let k = a; k <= b; k++) {
      const t = (k - a + 1) / (b - a + 2);
      const lo = a - 1 - (k - a) - 2, hi = b + 1 + (b - k) + 2; // mirror from just outside the joint
      for (let j = 0; j < N; j++) {
        const [x, y, xl, yl, xh, yh] = axis === 'x' ? [w(k), j, w(lo), j, w(hi), j] : [j, w(k), j, w(lo), j, w(hi)];
        for (let c = 0; c < 3; c++) buf[(y * N + x) * 3 + c] = buf[(yl * N + xl) * 3 + c] * (1 - t) + buf[(yh * N + xh) * 3 + c] * t;
      }
    }
  }
  return buf;
}
const fix = (buf) => inpaint(inpaint(buf, COLS, 'x'), ROWS, 'y');
const out = (buf, n = N) => sharp(buf, { raw: { width: n, height: n, channels: 3 } });

// slab face
{
  const d = fix(await rgb('granite_tile_04_diff_2k.jpg'));
  let sum = 0;
  for (let i = 0; i < N * N; i++) sum += 0.3 * d[i * 3] + 0.59 * d[i * 3 + 1] + 0.11 * d[i * 3 + 2];
  const mean = sum / (N * N), k = 128 / mean;
  for (let i = 0; i < N * N; i++) {
    const r = d[i * 3], g = d[i * 3 + 1], b = d[i * 3 + 2], L = (0.3 * r + 0.59 * g + 0.11 * b) * k;
    const v = 128 + (L - 128) * 0.8;
    d[i * 3] = Math.min(255, v * 0.975); d[i * 3 + 1] = Math.min(255, v * 0.99); d[i * 3 + 2] = Math.min(255, v * 1.02);
  }
  // soften the granite speckle, then add slow riven waves like real porcelain paving
  const soft = await out(d).resize(1024, 1024).blur(0.9).raw().toBuffer();
  const R = 1024, wv = Buffer.alloc(16 * 16);
  for (let i = 0; i < wv.length; i++) wv[i] = Math.random() * 255;
  const wave = await sharp(wv, { raw: { width: 16, height: 16, channels: 1 } }).resize(R, R, { kernel: 'cubic' }).blur(24).extractChannel(0).raw().toBuffer();
  for (let y = 0; y < R; y++) for (let x = 0; x < R; x++) {
    const i = y * R + x, ripple = Math.sin(x * 0.021 + Math.sin(y * 0.013) * 2.4) * 0.03;
    const f = 0.9 + (wave[i] / 255) * 0.18 + ripple;
    for (let c = 0; c < 3; c++) soft[i * 3 + c] = Math.min(255, soft[i * 3 + c] * f);
  }
  await out(soft, R).webp({ quality: 80 }).toFile(`${O}slab-v1.webp`);
  const n = fix(await rgb('granite_tile_04_nor_gl_2k.jpg'));
  await out(n).resize(1024, 1024).jpeg({ quality: 82 }).toFile(`${O}slab-n-v1.jpg`);
}
// old cracked concrete: 2048 tile ~ 6 m. Cracks are drawn as branching random walks (SVG), wrapped so the tile repeats cleanly.
{
  const S = 2048;
  let seed = 11; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const paths = [], moss = [];
  const walk = (x, y, a, len, w, depth) => {
    const pts = []; const a0 = a;
    for (let i = 0; i < len; i++) {
      a += (r() - 0.5) * 0.32 + (a0 - a) * 0.04;          // mostly straight, slow drift, small zig-zags
      x += Math.cos(a) * 8; y += Math.sin(a) * 8;
      const j = (r() - 0.5) * 3.2;
      pts.push([x - Math.sin(a) * j, y + Math.cos(a) * j]);
      if (depth < 2 && r() < 0.012) walk(x, y, a + (r() < 0.5 ? 1 : -1) * (0.7 + r() * 0.5), Math.floor(len * 0.3), w * 0.55, depth + 1);
    }
    const D = (pp) => 'M' + pp.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L');
    const d = D(pts);
    const chunks = [];
    for (let k = 0; k < pts.length - 12; k += 12) if (r() < 0.32) chunks.push(D(pts.slice(k, k + 10 + Math.floor(r() * 14))));
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      paths.push(`<path d="${d}" transform="translate(${ox} ${oy})" stroke-width="${w.toFixed(1)}"/>`);
      if (depth === 0) for (const c of chunks) moss.push(`<path d="${c}" transform="translate(${ox} ${oy})" stroke-width="${(w * 2.4).toFixed(1)}"/>`);
    }
  };
  for (let i = 0; i < 7; i++) walk(r() * S, r() * S, r() * Math.PI * 2, 120 + Math.floor(r() * 140), 2.6 + r() * 3.2, 0);
  const svg = (inner, extra = '') => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="100%" height="100%" fill="#000"/><g fill="none" stroke="#fff" stroke-linejoin="round" stroke-linecap="round" ${extra}>${inner}</g></svg>`);
  const cr = await sharp(svg(paths.join(''))).extractChannel(0).raw().toBuffer();
  const halo = await sharp(svg(paths.join(''))).blur(5).extractChannel(0).raw().toBuffer();
  const mm = await sharp(svg(moss.join(''))).blur(2.5).extractChannel(0).raw().toBuffer();
  const d = await sharp(T + 'concrete_floor_damaged_01_diff_2k.jpg').removeAlpha().resize(S, S).raw().toBuffer();
  const ms = await sharp(O + 'moss-v1.webp').resize(S, S).removeAlpha().raw().toBuffer();
  for (let i = 0; i < S * S; i++) {
    const c = cr[i] / 255, h = halo[i] / 255, m = Math.min(1, (mm[i] / 255) * 1.2);
    const grey = 0.3 * d[i * 3] + 0.59 * d[i * 3 + 1] + 0.11 * d[i * 3 + 2];
    for (let ch = 0; ch < 3; ch++) {
      let v = (grey * 0.65 + d[i * 3 + ch] * 0.35) * 1.15 * (1 - 0.35 * h);
      v *= 1 - 0.88 * c * (1 - 0.55 * m);
      v = v * (1 - m * 0.6) + [62, 70, 38][ch] * (0.7 + 0.6 * (ms[i * 3 + 1] / 255)) * m * 0.6;
      d[i * 3 + ch] = Math.max(0, Math.min(255, v));
    }
  }
  await sharp(d, { raw: { width: S, height: S, channels: 3 } }).webp({ quality: 78 }).toFile(`${O}ground-v2.webp`);
  // normal: base scan plus a groove along each crack
  const n = await sharp(T + 'concrete_floor_damaged_01_nor_gl_2k.jpg').removeAlpha().resize(S, S).raw().toBuffer();
  const hb = await sharp(svg(paths.join(''))).blur(2.5).extractChannel(0).raw().toBuffer();
  for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
    const i = y * S + x, gx = (hb[i + 1] - hb[i - 1]) * 0.5, gy = (hb[i + S] - hb[i - S]) * 0.5;
    n[i * 3] = Math.max(0, Math.min(255, n[i * 3] + gx * 0.9)); n[i * 3 + 1] = Math.max(0, Math.min(255, n[i * 3 + 1] - gy * 0.9));
  }
  await sharp(n, { raw: { width: S, height: S, channels: 3 } }).jpeg({ quality: 76 }).toFile(`${O}ground-n-v2.jpg`);
}
console.log('baked slab + ground');
