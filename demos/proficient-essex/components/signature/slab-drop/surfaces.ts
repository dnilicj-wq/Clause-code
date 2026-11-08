// Procedural, tileable surface maps for the hero's type switcher (block paving, resin-bound, natural stone).
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
const speckle = (g: CanvasRenderingContext2D, n: number, count: number, a: number) => {
  for (let i = 0; i < count; i++) { const v = rnd() > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${rnd() * a})`; g.fillRect(rnd() * n, rnd() * n, 1 + rnd() * 2, 1 + rnd() * 2); }
};

// 45° herringbone, 200 x 100 mm brindle blocks, sand-filled joints. The rotated pattern repeats every
// 0.1·√2 m one way and 0.2·√2 m the other, so a 0.8·√2 m tile wraps seamlessly.
function block(aniso: number): Maps {
  const N = 1024, M = 0.8 * Math.SQRT2, px = N / M, W = 0.1 * px, j = 0.007 * px;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#6b6258'; g.fillRect(0, 0, N, N); hg.fillStyle = '#000'; hg.fillRect(0, 0, N, N);
  const cols = ['#6a4a3c', '#735040', '#5f4337', '#7a5a47', '#55403a', '#6b5547', '#4d3f39', '#704c3d'];
  // staircase: H_i at (iW, iW) 2W x W, V_i at (iW, iW+W) W x 2W; staircases repeat every (2W, -2W)
  const R = Math.ceil(N * 1.5 / W);
  for (let k = -R; k <= R; k++) for (let i = -R; i <= R; i++) {
    const ox = i * W + k * 2 * W, oy = i * W - k * 2 * W;
    for (const [x, y, w, hh] of [[ox, oy, 2 * W, W], [ox, oy + W, W, 2 * W]]) {
      // rotate 45° about the canvas origin; skip bricks far off canvas
      const cx = x + w / 2, cy = y + hh / 2, rx = (cx - cy) * Math.SQRT1_2, ry = (cx + cy) * Math.SQRT1_2;
      if (rx < -2 * W || rx > N + 2 * W || ry < -2 * W || ry > N + 2 * W) continue;
      const qx = Math.round((((rx % N) + N) % N) / 6) % Math.round(N / 6), qy = Math.round((((ry % N) + N) % N) / 6) % Math.round(N / 6);
      const col = cols[(((qx * 73856093) ^ (qy * 19349663)) >>> 0) % cols.length];   // same brick, same colour, either side of the wrap
      for (const ctx of [g, hg]) {
        ctx.save(); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = ctx === g ? col : '#fff';
        ctx.fillRect(x + j / 2, y + j / 2, w - j, hh - j);
        ctx.restore();
      }
    }
  }
  speckle(g, N, 26000, 0.12);
  const hb = mk(N); hb[1].filter = 'blur(1.6px)'; hb[1].drawImage(h, 0, 0);
  return { map: tex(c, true, aniso), normal: tex(normalFrom(hb[0], 3.2), false, aniso), tile: M, rough: 0.82, clear: 0, tint: '#d8d0c8' };
}

// resin-bound aggregate: 2–6 mm stones in clear resin, colours from the chosen blend. Tile = 0.5 m.
function resin(aniso: number, b: { c1: string; c2: string; c3: string }): Maps {
  const N = 1024, M = 0.5, px = N / M;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#2a241d'; g.fillRect(0, 0, N, N); hg.fillStyle = '#000'; hg.fillRect(0, 0, N, N);
  const cols = [b.c1, b.c1, b.c2, b.c2, b.c3];
  for (let i = 0; i < 26000; i++) {
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

// Indian-sandstone style random pattern: 900/600/300 mm flags, riven face, buff and grey tones. Tile = 3.6 m.
function stone(aniso: number): Maps {
  const N = 2048, M = 3.6, px = N / M, j = 0.012 * px;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#6e665b'; g.fillRect(0, 0, N, N); hg.fillStyle = '#000'; hg.fillRect(0, 0, N, N);
  const cols = ['#a08f76', '#ad9a7e', '#94846e', '#8a7f70', '#b3a184', '#9a8670', '#837666'];
  // fill a 12 x 12 grid of 300 mm cells with flags of 1x1..3x2 cells (row-major greedy packing)
  const G = 12, cell = px * 0.3, used = Array.from({ length: G }, () => Array(G).fill(false));
  const shapes = [[3, 2], [2, 3], [2, 2], [3, 3], [2, 1], [1, 2], [1, 1]];
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    if (used[y][x]) continue;
    const fit = shapes.filter(([w, hh]) => { for (let a = 0; a < hh; a++) for (let b = 0; b < w; b++) { if (x + b >= G || y + a >= G || used[y + a][x + b]) return false; } return true; });
    const [w, hh] = fit[Math.min(fit.length - 1, Math.floor(rnd() * Math.min(4, fit.length)))];
    for (let a = 0; a < hh; a++) for (let b = 0; b < w; b++) used[y + a][x + b] = true;
    const X = x * cell + j / 2, Y = y * cell + j / 2, W = w * cell - j, H = hh * cell - j;
    g.fillStyle = cols[Math.floor(rnd() * cols.length)]; g.fillRect(X, Y, W, H);
    // riven face: soft bands and blotches
    for (let k = 0; k < 40; k++) {
      g.fillStyle = `rgba(${rnd() > 0.5 ? '255,240,215' : '60,48,36'},${rnd() * 0.07})`;
      g.beginPath(); g.ellipse(X + rnd() * W, Y + rnd() * H, 20 + rnd() * 90, 6 + rnd() * 30, rnd() * 0.4, 0, Math.PI * 2); g.fill();
    }
    hg.fillStyle = '#ccc'; hg.fillRect(X, Y, W, H);
    for (let k = 0; k < 30; k++) { hg.fillStyle = `rgba(${rnd() > 0.5 ? 255 : 120},${rnd() > 0.5 ? 255 : 120},${rnd() > 0.5 ? 255 : 120},.25)`; hg.beginPath(); hg.ellipse(X + rnd() * W, Y + rnd() * H, 30 + rnd() * 80, 4 + rnd() * 10, rnd() * 0.3, 0, Math.PI * 2); hg.fill(); }
  }
  speckle(g, N, 60000, 0.1);
  const hb = mk(N); hb[1].filter = 'blur(2px)'; hb[1].drawImage(h, 0, 0);
  return { map: tex(c, true, aniso), normal: tex(normalFrom(hb[0], 2.6), false, aniso), tile: M, rough: 0.88, clear: 0, tint: '#c4bcb0' };
}

export function makeSurface(kind: Exclude<SurfaceKind, 'porcelain'>, aniso: number, blend: { c1: string; c2: string; c3: string }) {
  seed = kind === 'block' ? 11 : kind === 'resin' ? 23 : 37;
  return kind === 'block' ? block(aniso) : kind === 'resin' ? resin(aniso, blend) : stone(aniso);
}
