// Procedural, tileable resin-bound and poured-concrete maps for the hero's type switcher (block paving and patio flags are laid as real pieces in bricks.ts).
// Ported from the Proficient Essex slab-drop engine; concrete added for Butler's.
// Drawn on canvas at runtime: no downloads. Each returns a colour map + a normal map built from a height map.
import * as THREE from 'three';

export type SurfaceKind = 'block' | 'resin' | 'concrete' | 'patio';
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
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 2.4), false, aniso), tile: M, rough: 0.5, clear: 0.45, tint: '#c2c0bb' };
}

// poured concrete: light grey cement paste with fine sand, very soft cure mottling and a light broom grain across
// the drive. Big 2 m tile so the mottling never repeats visibly from the hero camera.
function concrete(aniso: number, small: boolean): Maps {
  const N = small ? 1024 : 2048, M = 2;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#b4b2ad'; g.fillRect(0, 0, N, N); hg.fillStyle = '#808080'; hg.fillRect(0, 0, N, N);
  for (let i = 0; i < 26; i++) {
    const x = rnd() * N, y = rnd() * N, r = (0.18 + rnd() * 0.35) * N, l = rnd() < 0.5;
    for (const [dx, dy] of [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N], [N, N], [-N, -N], [N, -N], [-N, N]]) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, l ? 'rgba(214,212,206,.16)' : 'rgba(128,126,121,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
    }
  }
  for (let i = 0, n = small ? 60000 : 220000; i < n; i++) {
    const x = rnd() * N, y = rnd() * N, big = rnd() < 0.03, r = big ? 1.2 + rnd() * 1.4 : 0.5 + rnd() * 0.7;
    const v = Math.round(big ? 115 + rnd() * 70 : 145 + rnd() * 60);
    g.fillStyle = `rgba(${v},${v - 2},${v - 6},${big ? 0.85 : 0.4})`; g.fillRect(x, y, r, r);
    if (big) { hg.fillStyle = '#c4c4c4'; hg.fillRect(x, y, r, r); }
  }
  for (let i = 0, n = small ? 900 : 2600; i < n; i++) {
    const y = rnd() * N, x = rnd() * N, len = (0.05 + rnd() * 0.3) * N, w = 0.5 + rnd() * 0.8, d = rnd() < 0.5;
    for (const dx of [0, -N]) {
      hg.strokeStyle = d ? 'rgba(60,60,60,.35)' : 'rgba(190,190,190,.3)'; hg.lineWidth = w;
      hg.beginPath(); hg.moveTo(x + dx, y); hg.lineTo(x + dx + len, y + (rnd() - 0.5) * 2); hg.stroke();
    }
  }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 1.1), false, aniso), tile: M, rough: 0.84, clear: 0.03, tint: '#f4f2ee' };
}

export function makeSurface(kind: 'resin' | 'concrete', aniso: number, blend: { c1: string; c2: string; c3: string }, small = false) {
  seed = kind === 'resin' ? 23 : 41;
  return kind === 'resin' ? resin(aniso, blend, small) : concrete(aniso, small);
}
