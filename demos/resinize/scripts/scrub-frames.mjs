// Builds the hero-scrub demo frames: the same garage going from bare concrete (ba-before) to a poured,
// glossy floor (ba-after) behind a liquid pour front. Run once; outputs are committed.
// node scripts/scrub-frames.mjs  →  public/demo/scrub/pour-00-v1.webp … pour-31-v1.webp
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const W = 800, H = 356, N = 32, out = 'public/demo/scrub';
mkdirSync(out, { recursive: true });
const load = (f) => sharp(`public/demo/${f}`).resize(W, H, { fit: 'cover' }).removeAlpha().raw().toBuffer();
const [A, B] = await Promise.all([load('ba-before-v1.webp'), load('ba-after-v1.webp')]);
// value noise for an organic pour front
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
const fbm = (x, y) => vn(x, y) * 0.55 + vn(x * 2.1, y * 2.1) * 0.3 + vn(x * 4.3, y * 4.3) * 0.15;
// pour starts at the doorway (bottom centre) and spreads; distance field with noise
const field = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const dx = (x - W * 0.5) / W, dy = (y - H * 1.05) / H;
  field[y * W + x] = Math.hypot(dx * 1.1, dy * 1.6) + (fbm(x / 70, y / 70) - 0.5) * 0.22;
}
let max = 0; for (const f of field) max = Math.max(max, f);
for (let i = 0; i < N; i++) {
  const p = i / (N - 1), r = p * (max + 0.05) - 0.02;
  const buf = Buffer.alloc(W * H * 3);
  for (let k = 0; k < W * H; k++) {
    const e = (r - field[k]) / 0.018; // signed distance to the front
    const m = Math.min(1, Math.max(0, e));
    const wet = Math.max(0, 1 - Math.abs(e - 0.5) / 2.2) * (p < 1 ? 1 : 0); // bright wet lip at the front
    for (let c = 0; c < 3; c++) {
      const v = A[k * 3 + c] * (1 - m) + B[k * 3 + c] * m + wet * 70;
      buf[k * 3 + c] = Math.min(255, v);
    }
  }
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 62 }).toFile(`${out}/pour-${String(i).padStart(2, '0')}-v1.webp`);
}
console.log('frames:', N);
