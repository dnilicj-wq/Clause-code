// Procedural, tileable resin-bound map for the hero's type switcher (block paving and stone are laid as real pieces in slabs.ts).
// Drawn on canvas at runtime: no downloads. Each returns a colour map + a normal map built from a height map.
import * as THREE from 'three';

export type SurfaceKind = 'porcelain' | 'resin' | 'block' | 'stone';
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

// resin-bound aggregate: 2–6 mm stones in clear resin, colours from the chosen blend. Tile = 0.5 m.
function resin(aniso: number, b: { c1: string; c2: string; c3: string }, small: boolean): Maps {
  const N = small ? 512 : 1024, M = 0.5, px = N / M;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#2a241d'; g.fillRect(0, 0, N, N); hg.fillStyle = '#000'; hg.fillRect(0, 0, N, N);
  const cols = [b.c1, b.c1, b.c2, b.c2, b.c3];
  for (let i = 0, n = small ? 6500 : 26000; i < n; i++) {
    const r = (0.0022 + rnd() * 0.0032) * px, x = rnd() * N, y = rnd() * N, rot = rnd() * Math.PI, e = 0.6 + rnd() * 0.4;
    const col = cols[Math.floor(rnd() * cols.length)];
    for (const [dx, dy] of [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N]]) {
      if (x + dx < -r || x + dx > N + r || y + dy < -r || y + dy > N + r) continue;
      g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); g.fill();
      const gr = hg.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#333');
      hg.fillStyle = gr; hg.beginPath(); hg.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); hg.fill();
      // small highlight on each stone
      g.fillStyle = 'rgba(255,255,255,.10)'; g.beginPath(); g.ellipse(x + dx - r * 0.25, y + dy - r * 0.25, r * 0.4, r * 0.3 * e, rot, 0, Math.PI * 2); g.fill();
    }
  }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 2.4), false, aniso), tile: M, rough: 0.5, clear: 0.45, tint: '#a39a8c' };
}

export function makeSurface(_kind: 'resin', aniso: number, blend: { c1: string; c2: string; c3: string }, small = false) {
  seed = 23;
  return resin(aniso, blend, small);
}
