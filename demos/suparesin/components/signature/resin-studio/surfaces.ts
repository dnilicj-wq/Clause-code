// Procedural, tileable surface maps for the Suparesin hero: resin-bound stone (driveways) and three poured floors
// (flake, metallic epoxy, high-build epoxy). Drawn on canvas at runtime: no downloads.
// Each returns a colour map + a normal map built from a height map, plus how the finished surface should shine.
import * as THREE from 'three';

export type Finish = {
  key: string; kind: 'resin' | 'flake' | 'metallic' | 'highbuild';
  c1: string; c2: string; c3: string; c4?: string;
};
export type Maps = { map: THREE.Texture; normal: THREE.Texture; tile: number; rough: number; clear: number; clearRough: number; metal: number; tint: string; nScale: number };

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const mk = (n: number) => { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d', { willReadFrequently: true })!] as const; };

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
const hex = (h: string) => { const v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
const W5 = (N: number) => [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N]] as const;

// resin-bound aggregate: 2–6 mm stones in clear UV-stable resin, colours from the blend. Tile = 0.5 m.
function resin(aniso: number, b: Finish, small: boolean): Maps {
  const N = small ? 512 : 1024, M = 0.5, px = N / M;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#2a241d'; g.fillRect(0, 0, N, N); hg.fillStyle = '#000'; hg.fillRect(0, 0, N, N);
  const cols = [b.c1, b.c1, b.c2, b.c2, b.c3];
  for (let i = 0, n = small ? 6500 : 26000; i < n; i++) {
    const r = (0.0022 + rnd() * 0.0032) * px, x = rnd() * N, y = rnd() * N, rot = rnd() * Math.PI, e = 0.6 + rnd() * 0.4;
    const col = cols[Math.floor(rnd() * cols.length)];
    for (const [dx, dy] of W5(N)) {
      if (x + dx < -r || x + dx > N + r || y + dy < -r || y + dy > N + r) continue;
      g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); g.fill();
      const gr = hg.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#333');
      hg.fillStyle = gr; hg.beginPath(); hg.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); hg.fill();
      g.fillStyle = 'rgba(255,255,255,.10)'; g.beginPath(); g.ellipse(x + dx - r * 0.25, y + dy - r * 0.25, r * 0.4, r * 0.3 * e, rot, 0, Math.PI * 2); g.fill();
    }
  }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 2.4), false, aniso), tile: M, rough: 0.5, clear: 0.45, clearRough: 0.3, metal: 0, tint: '#a39a8c', nScale: 1 };
}

// flake floor: a coloured base coat, fully broadcast with 3–6 mm vinyl flakes, sealed under a clear coat. Tile = 0.5 m.
function flake(aniso: number, b: Finish, small: boolean): Maps {
  const N = small ? 512 : 1024, M = 0.5, px = N / M;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = b.c1; g.fillRect(0, 0, N, N); hg.fillStyle = '#808080'; hg.fillRect(0, 0, N, N);
  const cols = [b.c1, b.c2, b.c2, b.c3, b.c3, b.c4 || b.c3];
  for (let i = 0, n = small ? 5200 : 20000; i < n; i++) {
    const r = (0.0016 + rnd() * 0.0028) * px, x = rnd() * N, y = rnd() * N, rot = rnd() * Math.PI * 2;
    const col = cols[Math.floor(rnd() * cols.length)], k = 4 + Math.floor(rnd() * 3);
    const pts: [number, number][] = [];
    for (let j = 0; j < k; j++) { const a = rot + (j / k) * Math.PI * 2 + rnd() * 0.6, rr = r * (0.55 + rnd() * 0.6); pts.push([Math.cos(a) * rr, Math.sin(a) * rr * (0.6 + rnd() * 0.4)]); }
    for (const [dx, dy] of W5(N)) {
      if (x + dx < -r * 2 || x + dx > N + r * 2 || y + dy < -r * 2 || y + dy > N + r * 2) continue;
      g.fillStyle = col; g.beginPath(); pts.forEach(([u, v], j) => (j ? g.lineTo : g.moveTo).call(g, x + dx + u, y + dy + v)); g.closePath(); g.fill();
      hg.fillStyle = `rgb(${150 + Math.floor(rnd() * 40)},0,0)`; hg.beginPath(); pts.forEach(([u, v], j) => (j ? hg.lineTo : hg.moveTo).call(hg, x + dx + u, y + dy + v)); hg.closePath(); hg.fill();
    }
  }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 0.9), false, aniso), tile: M, rough: 0.32, clear: 1, clearRough: 0.06, metal: 0, tint: '#ffffff', nScale: 0.35 };
}

// periodic value noise (period P lattice cells) so the metallic pattern tiles without seams
function pnoise(P: number) {
  const L = new Float32Array(P * P).map(() => rnd());
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const a = (i: number, j: number) => L[(((j % P) + P) % P) * P + (((i % P) + P) % P)];
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return (a(xi, yi) * (1 - u) + a(xi + 1, yi) * u) * (1 - v) + (a(xi, yi + 1) * (1 - u) + a(xi + 1, yi + 1) * u) * v;
  };
}

// metallic epoxy: pigment swirled through a self-levelling coat, domain-warped noise (periodic, so it tiles). Tile = 3 m.
function metallic(aniso: number, b: Finish, small: boolean): Maps {
  const N = small ? 384 : 768, P1 = 3, P2 = 6, P3 = 12;
  const n1 = pnoise(P1), n2 = pnoise(P2), n3 = pnoise(P3), n4 = pnoise(P2);
  const fbm = (x: number, y: number) => n1(x * P1, y * P1) * 0.55 + n2(x * P2, y * P2) * 0.3 + n3(x * P3, y * P3) * 0.15;
  const [c, g] = mk(N), [h, hg] = mk(N);
  const img = g.createImageData(N, N), hi = hg.createImageData(N, N);
  const C = [hex(b.c1), hex(b.c2), hex(b.c3), hex(b.c4 || b.c3)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N;
    const wx = fbm(u + 0.13, v), wy = fbm(u, v + 0.71);
    const q = fbm(u + 0.9 * wx, v + 0.9 * wy);
    const t = fbm(u + 1.6 * q + 0.2, v + 1.4 * q);
    const s = Math.sin((t * 3.4 + n4(u * P2, v * P2) * 0.9) * Math.PI);           // the cells and veins of a metallic pour
    const vein = Math.pow(Math.abs(s), 22);                                      // bright lacing
    const dark = Math.pow(1 - Math.abs(s), 4) * 0.45;
    const k = Math.min(1, Math.max(0, t * 1.35 - 0.15));
    const i = (y * N + x) * 4;
    for (let ch = 0; ch < 3; ch++) {
      let col = C[0][ch] * (1 - k) + C[1][ch] * k;
      col = col * (1 - dark) + C[0][ch] * dark * 0.8;
      col = col * (1 - vein) + (C[2][ch] * 0.6 + C[3][ch] * 0.4) * vein;
      img.data[i + ch] = Math.max(0, Math.min(255, col));
    }
    img.data[i + 3] = 255;
    const hv = 128 + (t - 0.5) * 40 + vein * 25;
    hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = hv; hi.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); hg.putImageData(hi, 0, 0);
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 0.6), false, aniso), tile: 5.5, rough: 0.22, clear: 1, clearRough: 0.04, metal: 0.45, tint: '#ffffff', nScale: 0.25 };
}

// high-build epoxy: one solid colour, a faint trowel cloud and orange peel under a hard gloss. Tile = 2 m.
function highbuild(aniso: number, b: Finish, small: boolean): Maps {
  const N = small ? 256 : 512;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = b.c1; g.fillRect(0, 0, N, N); hg.fillStyle = '#808080'; hg.fillRect(0, 0, N, N);
  for (let i = 0; i < 50; i++) {
    const x = rnd() * N, y = rnd() * N, r = N * (0.08 + rnd() * 0.2), lt = rnd() < 0.5;
    for (const [dx, dy] of W5(N)) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, lt ? b.c2 + '22' : b.c3 + '18'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
    }
  }
  for (let i = 0, n = small ? 3000 : 9000; i < n; i++) {
    const x = rnd() * N, y = rnd() * N, r = 1 + rnd() * 2.5, v = rnd() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)';
    hg.fillStyle = v; hg.beginPath(); hg.arc(x, y, r, 0, Math.PI * 2); hg.fill();
  }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 0.5), false, aniso), tile: 2, rough: 0.2, clear: 1, clearRough: 0.035, metal: 0, tint: '#ffffff', nScale: 0.2 };
}

export function makeSurface(f: Finish, aniso: number, small = false): Maps {
  seed = { resin: 23, flake: 31, metallic: 47, highbuild: 59 }[f.kind];
  if (f.kind === 'resin') return resin(aniso, f, small);
  if (f.kind === 'flake') return flake(aniso, f, small);
  if (f.kind === 'metallic') return metallic(aniso, f, small);
  return highbuild(aniso, f, small);
}
