// Procedural, tileable resin-bound map for the hero's type switcher (block paving and stone are laid as real pieces in slabs.ts).
// Drawn on canvas at runtime: no downloads. Each returns a colour map + a normal map built from a height map.
import * as THREE from 'three';

export type SurfaceKind = 'porcelain' | 'resin' | 'block' | 'stone' | 'tarmac' | 'gravel';
export type Poured = 'resin' | 'tarmac' | 'gravel';
type Maps = { map: THREE.Texture; normal: THREE.Texture; tile: number; rough: number; clear: number; tint: string };

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const mk = (n: number) => { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d', { willReadFrequently: true })!] as const; };

// height (greyscale canvas) -> tangent-space normal map
function normalFrom(h: HTMLCanvasElement, strength: number) {
  const n = h.width, src = h.getContext('2d')!.getImageData(0, 0, n, n).data;
  const [c, g] = mk(n); const out = g.createImageData(n, n), d = out.data;
  const H = (x: number, y: number) => src[(((y + n) % n) * n + ((x + n) % n)) * 4] / 255;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * strength, dy = (H(x, y + 1) - H(x, y - 1)) * strength;
    const l = Math.hypot(dx, dy, 1), i = (y * n + x) * 4;
    d[i] = (-dx / l * 0.5 + 0.5) * 255; d[i + 1] = (dy / l * 0.5 + 0.5) * 255; d[i + 2] = (1 / l * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  g.putImageData(out, 0, 0); return c;
}
const tex = (c: HTMLCanvasElement, srgb: boolean, aniso: number) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
};

// aggregate surfaces drawn as stones on a binder: resin (2-6 mm in clear resin), tarmac (fine dark chippings in bitumen),
// gravel (loose 10-20 mm stones, their site's driveway size). Tile = 0.5 m.
type Agg = { base: string; cols: string[]; n: number; rMin: number; rSpan: number; shine: number; rough: number; clear: number; tint: string; bump: number };
function aggregate(aniso: number, a: Agg, small: boolean): Maps {
  const N = small ? 512 : 1024, M = 0.5, px = N / M;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = a.base; g.fillRect(0, 0, N, N); hg.fillStyle = '#000'; hg.fillRect(0, 0, N, N);
  for (let i = 0, n = small ? Math.round(a.n / 4) : a.n; i < n; i++) {
    const r = (a.rMin + rnd() * a.rSpan) * px * (small ? 1.6 : 1), x = rnd() * N, y = rnd() * N, rot = rnd() * Math.PI, e = 0.6 + rnd() * 0.4;
    const col = a.cols[Math.floor(rnd() * a.cols.length)];
    for (const [dx, dy] of [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N]]) {
      if (x + dx < -r || x + dx > N + r || y + dy < -r || y + dy > N + r) continue;
      g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); g.fill();
      const gr = hg.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#333');
      hg.fillStyle = gr; hg.beginPath(); hg.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); hg.fill();
      if (a.shine) { g.fillStyle = `rgba(255,255,255,${a.shine})`; g.beginPath(); g.ellipse(x + dx - r * 0.25, y + dy - r * 0.25, r * 0.4, r * 0.3 * e, rot, 0, Math.PI * 2); g.fill(); }
    }
  }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, a.bump), false, aniso), tile: M, rough: a.rough, clear: a.clear, tint: a.tint };
}

export function makeSurface(kind: Poured, aniso: number, blend: { c1: string; c2: string; c3: string }, small = false) {
  seed = kind === 'resin' ? 23 : kind === 'tarmac' ? 31 : 47;
  if (kind === 'tarmac') return aggregate(aniso, { base: '#101113', cols: ['#2c2e33', '#3a3c42', '#1d1e21', '#4c4f56', '#5e6168', '#25272b'], n: 70000, rMin: 0.0009, rSpan: 0.0019, shine: 0.07, rough: 0.68, clear: 0.15, tint: '#9aa3b8', bump: 2.8 }, small);
  if (kind === 'gravel') return aggregate(aniso, { base: '#1e1b17', cols: ['#d9d3c7', '#b9b2a5', '#8e8a83', '#c9b48d', '#6f6b65', '#e8e4dc', '#a59a86'], n: 4200, rMin: 0.0065, rSpan: 0.0065, shine: 0.14, rough: 0.9, clear: 0, tint: '#c2beb6', bump: 4.2 }, small);
  return aggregate(aniso, { base: '#2a241d', cols: [blend.c1, blend.c1, blend.c2, blend.c2, blend.c3], n: 26000, rMin: 0.0022, rSpan: 0.0032, shine: 0.10, rough: 0.5, clear: 0.45, tint: '#a39a8c', bump: 2.4 }, small);
}
