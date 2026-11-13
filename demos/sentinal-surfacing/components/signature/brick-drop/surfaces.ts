// Procedural, tileable resin-bound and tarmac maps for the hero's type switcher (block paving and patio flags are laid as real pieces in bricks.ts).
// Ported from the Proficient Essex slab-drop engine; microcement and floor coating added for Sentinal Surfacing.
// Drawn on canvas at runtime: no downloads. Each returns a colour map + a normal map built from a height map.
import * as THREE from 'three';

export type SurfaceKind = 'block' | 'resin' | 'tarmac' | 'patio' | 'micro' | 'coat';
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
  const N = small ? 512 : 1024, M = 0.5, px = N / M, SHOW = 1.1;   // drawn as 0.5 m, shown over 1.1 m so the stones read on a phone
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
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 2.4), false, aniso), tile: SHOW, rough: 0.45, clear: 0.5, tint: '#b4ab9c' };
}

// tarmac: dense 0-6 mm black aggregate in bitumen, a few lighter chips catching the light. Tile = 0.5 m.
function tarmac(aniso: number, small: boolean): Maps {
  const N = small ? 512 : 1024, M = 0.5, px = N / M;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#141416'; g.fillRect(0, 0, N, N); hg.fillStyle = '#000'; hg.fillRect(0, 0, N, N);
  const cols = ['#1d1e20', '#26272a', '#303134', '#222326', '#44464a', '#66686c'];
  for (let i = 0, n = small ? 9000 : 36000; i < n; i++) {
    const r = (0.0012 + rnd() * 0.0026) * px, x = rnd() * N, y = rnd() * N, rot = rnd() * Math.PI, e = 0.55 + rnd() * 0.45;
    const col = cols[Math.floor(Math.pow(rnd(), 1.8) * cols.length)];
    for (const [dx, dy] of [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N]]) {
      if (x + dx < -r || x + dx > N + r || y + dy < -r || y + dy > N + r) continue;
      g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); g.fill();
      const gr = hg.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, '#ddd'); gr.addColorStop(1, '#222');
      hg.fillStyle = gr; hg.beginPath(); hg.ellipse(x + dx, y + dy, r, r * e, rot, 0, Math.PI * 2); hg.fill();
    }
  }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 2.0), false, aniso), tile: M, rough: 0.78, clear: 0.08, tint: '#dfe2e7' };
}

// microcement: hand-trowelled, cloudy greige with soft darker passes and faint trowel arcs. Tile = 2 m.
function micro(aniso: number, small: boolean): Maps {
  const N = small ? 512 : 1024;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#b3aca2'; g.fillRect(0, 0, N, N); hg.fillStyle = '#808080'; hg.fillRect(0, 0, N, N);
  const blot = (x: number, y: number, r: number, col: string, a: number) => {
    for (const [dx, dy] of [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N], [N, N], [-N, -N], [N, -N], [-N, N]]) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, col.replace('A', String(a))); gr.addColorStop(1, col.replace('A', '0'));
      g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2);
    }
  };
  for (let i = 0; i < 70; i++) blot(rnd() * N, rnd() * N, (0.08 + rnd() * 0.22) * N, rnd() < 0.55 ? 'rgba(92,86,78,A)' : 'rgba(230,226,218,A)', 0.12 + rnd() * 0.16);
  // trowel arcs: long shallow curves, slightly burnished
  g.lineCap = 'round';
  for (let i = 0; i < 120; i++) {
    const x = rnd() * N, y = rnd() * N, r = (0.12 + rnd() * 0.3) * N, a0 = rnd() * Math.PI * 2, sw = 0.25 + rnd() * 0.5;
    g.strokeStyle = rnd() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(60,55,50,.05)'; g.lineWidth = (0.01 + rnd() * 0.03) * N;
    g.beginPath(); g.arc(x, y, r, a0, a0 + sw); g.stroke();
    hg.strokeStyle = 'rgba(160,160,160,.08)'; hg.lineWidth = g.lineWidth * 0.5; hg.beginPath(); hg.arc(x, y, r, a0, a0 + sw); hg.stroke();
  }
  for (let i = 0, n = small ? 4000 : 16000; i < n; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '40,36,32' : '255,255,255'},${0.05 + rnd() * 0.08})`; g.fillRect(rnd() * N, rnd() * N, 1.2, 1.2); }
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 1.2), false, aniso), tile: 2, rough: 0.42, clear: 0.35, tint: '#ffffff' };
}

// floor coating: seamless, glossy mid-grey with a fine decorative fleck. Tile = 1 m.
function coat(aniso: number, small: boolean): Maps {
  const N = small ? 512 : 1024;
  const [c, g] = mk(N), [h, hg] = mk(N);
  g.fillStyle = '#5d636d'; g.fillRect(0, 0, N, N); hg.fillStyle = '#808080'; hg.fillRect(0, 0, N, N);
  const cols = ['#2b2f36', '#9aa0aa', '#d8dbe0', '#3f444c', '#c9a46a'];
  for (let i = 0, n = small ? 2200 : 8000; i < n; i++) {
    const r = (0.6 + rnd() * 2.2) * (N / 1024), x = rnd() * N, y = rnd() * N;
    g.fillStyle = cols[Math.floor(Math.pow(rnd(), 1.4) * cols.length)]; g.globalAlpha = 0.55 + rnd() * 0.4;
    g.beginPath(); g.ellipse(x, y, r * 1.6, r, rnd() * Math.PI, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  return { map: tex(c, true, aniso), normal: tex(normalFrom(h, 0.4), false, aniso), tile: 1, rough: 0.18, clear: 1, tint: '#ffffff' };
}

export type PourKind = 'resin' | 'tarmac' | 'micro' | 'coat';
export function makeSurface(kind: PourKind, aniso: number, blend: { c1: string; c2: string; c3: string }, small = false) {
  seed = ({ resin: 23, tarmac: 41, micro: 57, coat: 71 } as const)[kind];
  return kind === 'resin' ? resin(aniso, blend, small) : kind === 'micro' ? micro(aniso, small) : kind === 'coat' ? coat(aniso, small) : tarmac(aniso, small);
}
