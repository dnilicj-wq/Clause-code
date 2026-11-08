// Slab-drop hero: porcelain paving slabs drop one by one onto a cracked, mossy concrete patio.
// three.js, PBR materials (CC0 Poly Haven scans baked by scripts/prep-slab.mjs), soft sun shadows,
// swaying leaf dapple for idle motion. Same callback shape as drive-pour so the hero can swap engines.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeSurface, type SurfaceKind } from './surfaces';
export type { SurfaceKind };

export type SlabOpts = {
  fog: string;
  tex: string;
  onFirst?: () => void;
  onCoverage?: (c: number) => void;
  onFinished?: () => void;
  onReady?: () => void;
  onLost?: () => void;
};

const SW = 0.9, SD = 0.6, JOINT = 0.007, TH = 0.024;       // 900 x 600 mm porcelain, ~7 mm joints
// the patio runs past every edge of the frame; slabs no camera can see are culled at build time
const COLS = 25, ROWS = 22;
const X0 = 0.6 - (COLS * SW) / 2, Z0 = 3.2;                 // near-left corner of the patio
const FIN_AT = 0.6;
export const START = 0.12;                                  // far rows already laid (matches the poster)

type Slab = { m: THREE.Mesh; x: number; z: number; row: number; state: 0 | 1 | 2; t0: number; dur: number; ry: number; rx: number; rz: number; h: number; hit: boolean };

export function initSlabs(host: HTMLElement, cv: HTMLCanvasElement, opts: SlabOpts) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  } catch { return null; }
  const coarse = matchMedia('(pointer:coarse)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const fogC = new THREE.Color(opts.fog);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 7, 17);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  (scene as any).environmentIntensity = 0.45;

  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const look = new THREE.Vector3();

  // light: low warm sun from the back-left so the porcelain catches a sheen, cool sky fill
  const hemi = new THREE.HemisphereLight('#d6dce2', '#2a251e', 0.34);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffd8a4', 4.3);
  sun.position.set(-6.5, 8.5, -3.2);
  sun.target.position.set(0.4, 0, -0.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 25 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 14;
  scene.add(sun, sun.target);

  // textures
  const tl = new THREE.TextureLoader();
  let pending = 4, loaded = false, dead = false;
  const ready = () => { if (--pending === 0 && !dead) { loaded = true; api.loaded = true; opts.onReady?.(); } };
  const tex = (f: string, srgb: boolean) => {
    const t = tl.load(opts.tex + f, ready, undefined, ready);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  // phones get half-size maps (they are viewed smaller and download over mobile data)
  const gMap = tex(coarse ? 'ground-1k-v2.webp' : 'ground-v2.webp', true), gNor = tex(coarse ? 'ground-n-1k-v2.jpg' : 'ground-n-v2.jpg', false);
  const sMap = tex(coarse ? 'slab-512-v1.webp' : 'slab-v1.webp', true), sNor = tex(coarse ? 'slab-n-512-v1.jpg' : 'slab-n-v1.jpg', false);
  gMap.repeat.set(9.8, 9.8); gNor.repeat.set(9.8, 9.8);
  gMap.rotation = gNor.rotation = 0.35;

  // old cracked concrete
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: gMap, normalMap: gNor, normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.95, color: '#b9b6b0', metalness: 0 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // porcelain: a handful of material variants, each sampling its own patch of the stone so no two neighbours match
  const variants = (w: number) => Array.from({ length: 6 }, (_, i) => {
    const m = sMap.clone(), n = sNor.clone();
    const ox = (i * 0.37) % 1, oy = (i * 0.61) % 1;
    for (const t of [m, n]) { t.repeat.set(w / 3, SD / 3); t.offset.set(ox, oy); t.needsUpdate = true; }
    return new THREE.MeshPhysicalMaterial({ map: m, normalMap: n, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.48, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.28, color: '#bcc2c9', envMapIntensity: 0.8 });
  });
  const matFull = variants(SW), matHalf = variants(SW / 2);
  const geoFull = new RoundedBoxGeometry(SW - JOINT, TH, SD - JOINT, 2, 0.004);
  const geoHalf = new RoundedBoxGeometry(SW / 2 - JOINT, TH, SD - JOINT, 2, 0.004);

  // which slabs can ever be on screen: the widest landscape and portrait framings, plus a margin
  const views = ([[34, 2.5, [0.7, 3.5, 5.7], [0.7, 0, -1.6]], [50, 0.9, [0.5, 4.9, 4.6], [0.5, 0, -1.5]]] as const).map(([fov, asp, p, l]) => {
    const c = new THREE.PerspectiveCamera(fov + 6, asp, 0.1, 17);
    c.position.set(p[0], p[1], p[2]); c.lookAt(l[0], l[1], l[2]); c.updateMatrixWorld(); c.updateProjectionMatrix();
    return new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse));
  });
  const box = new THREE.Box3(), seen = (x: number, z: number, w: number) => {
    box.min.set(x - w / 2, 0, z - SD / 2); box.max.set(x + w / 2, TH, z + SD / 2);
    return views.some((f) => f.intersectsBox(box));
  };
  // surfaces built later only need the framing in use now (keeps piece counts down on phones)
  const seenNow = (x: number, z: number, w: number) => {
    box.min.set(x - w / 2, 0, z - w / 2); box.max.set(x + w / 2, TH, z + w / 2);
    return views[portrait ? 1 : 0].intersectsBox(box);
  };

  // stretcher bond: every other row starts and ends with a half slab
  const slabGroup = new THREE.Group(); scene.add(slabGroup);
  const slabs: Slab[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let r = 0; r < ROWS; r++) {
    const z = Z0 - r * SD - SD / 2;
    const odd = r % 2 === 1;
    const pieces: { cx: number; half: boolean }[] = [];
    if (!odd) for (let c = 0; c < COLS; c++) pieces.push({ cx: X0 + c * SW + SW / 2, half: false });
    else {
      pieces.push({ cx: X0 + SW / 4, half: true });
      for (let c = 0; c < COLS - 1; c++) pieces.push({ cx: X0 + SW / 2 + c * SW + SW / 2, half: false });
      pieces.push({ cx: X0 + COLS * SW - SW / 4, half: true });
    }
    for (const p of pieces) {
      if (!seen(p.cx, z, p.half ? SW / 2 : SW)) continue;
      const mats = p.half ? matHalf : matFull;
      const m = new THREE.Mesh(p.half ? geoHalf : geoFull, mats[Math.floor(rnd() * mats.length)]);
      m.castShadow = true; m.receiveShadow = true; m.visible = false;
      m.position.set(p.cx, TH / 2, z);
      slabGroup.add(m);
      slabs.push({ m, x: p.cx, z, row: r, state: 0, t0: 0, dur: 0, ry: 0, rx: 0, rz: 0, h: 0, hit: false });
    }
  }
  const total = slabs.length;

  // dust puffs where a slab lands
  const dustTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d')!; const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(225,215,195,.55)'); gr.addColorStop(1, 'rgba(225,215,195,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  type Puff = { s: THREE.Sprite; t0: number; vx: number; vz: number };
  const puffs: Puff[] = [];
  const puff = (x: number, z: number, now: number) => {
    for (let i = 0; i < 2; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, transparent: true, depthWrite: false, opacity: 0 }));
      const a = (i / 2) * Math.PI * 2 + Math.random();
      s.position.set(x + Math.cos(a) * 0.4, 0.04, z + Math.sin(a) * 0.28);
      s.scale.setScalar(0.25);
      scene.add(s);
      puffs.push({ s, t0: now, vx: Math.cos(a) * 0.5, vz: Math.sin(a) * 0.35 });
    }
  };

  // dappled shade from an unseen tree: an invisible plane that only casts leaf-shaped shadows
  const leafTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d')!;
    g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512);
    g.fillStyle = '#fff';
    // canopy: clusters of small leaves, denser to the left, with sun gaps between them
    for (let k = 0; k < 70; k++) {
      const cx = Math.pow(Math.random(), 1.6) * 360, cy = Math.random() * 512, R = 18 + Math.random() * 34;
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2, d = R * Math.sqrt(Math.random());
        g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 + Math.random() * 4, 1.2 + Math.random() * 2.2, Math.random() * Math.PI, 0, Math.PI * 2); g.fill();
      }
    }
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const leafGeo = new THREE.PlaneGeometry(12, 12);
  const leaves = new THREE.Mesh(leafGeo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, alphaMap: leafTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  leaves.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: leafTex, alphaTest: 0.5, side: THREE.DoubleSide });
  leaves.rotation.x = -Math.PI / 2;
  leaves.position.set(-2.2, 3.4, -1.2);
  leaves.castShadow = true;
  scene.add(leaves);

  // sizing + camera framing per aspect
  let W = 1, H = 1, portrait = false;
  const frame = () => {
    W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
    renderer.setSize(W, H, false);
    cam.aspect = W / H;
    portrait = W / H < 0.9;
    if (portrait) { cam.fov = 50; cam.position.set(0.5, 4.9, 4.6); look.set(0.5, 0, -1.5); }
    else { cam.fov = 34; cam.position.set(0.7, 3.5, 5.7); look.set(0.7, 0, -1.6); }
    cam.updateProjectionMatrix();
    cam.lookAt(look);
  };
  frame();
  const ro = new ResizeObserver(frame); ro.observe(host);

  // dropping
  let laid = 0, finished = false, first = false, finishing = false;
  const drop = (s: Slab, at: number) => {
    if (s.state !== 0) return;
    s.state = 1; s.t0 = at; s.h = 0.55 + rnd() * 0.08; s.dur = 0.54;
    s.rx = (rnd() - 0.5) * 0.12; s.rz = (rnd() - 0.5) * 0.12; s.ry = (rnd() - 0.5) * 0.06;
  };
  const coverage = () => laid / total;
  const landed = (s: Slab, now: number) => {
    s.hit = true; laid++;
    puff(s.x, s.z, now);
    opts.onCoverage?.(coverage());
    if (!finishing && coverage() >= FIN_AT) finish();
    if (laid === total && !finished) { finished = true; api.finished = true; opts.onFinished?.(); if (top === slabGroup) settle(slabGroup); }
  };
  const order = () => slabs.filter((s) => s.state === 0).sort((a, b) => a.z - b.z || a.x - b.x); // far rows first
  // lay in rows, far to near: each row sweeps left to right, the next row starts before the last one ends,
  // so the slabs come down as one smooth travelling line
  const minX = Math.min(...slabs.map((s) => s.x)), spanX = Math.max(...slabs.map((s) => s.x)) - minX || 1;
  function sweep(list: Slab[], t: number, rowGap: number, across: number) {
    if (!list.length) return;
    const r0 = Math.max(...list.map((s) => s.row));        // highest row index = farthest from camera
    list.forEach((s) => drop(s, t + (r0 - s.row) * rowGap + ((s.x - minX) / spanX) * across));
  }
  function finish() {
    if (finishing) return;
    finishing = true;
    sweep(order(), now(), 0.1, 0.3);
  }
  function demo(start = START) {
    const t = now();
    const o = order(), n = Math.round(total * start);
    o.slice(0, n).forEach(place); laid += n;
    finishing = true;
    sweep(o.slice(n), t + 0.05, 0.135, 0.36);
  }
  function place(s: Slab) { s.state = 2; s.hit = true; s.m.visible = true; s.m.position.set(s.x, TH / 2, s.z); s.m.rotation.set(0, 0, 0); }
  function prefill(f = START) {
    const o = order(); const n = Math.round(total * f);
    o.slice(0, n).forEach(place); laid = n;
    // a few caught mid-air for the poster
    o.slice(n + 1, n + 3).forEach((s, i) => { s.state = 1; s.t0 = -1; s.m.visible = true; s.m.position.set(s.x, TH / 2 + 0.35 + i * 0.5, s.z); s.m.rotation.set((i % 2 ? 1 : -1) * 0.08, 0.05 * i, (i % 2 ? -1 : 1) * 0.06); });
    frozen = true;
  }
  function fillAll() { slabs.forEach(place); laid = total; frozen = true; }
  function reset() {
    slabs.forEach((s) => { s.state = 0; s.hit = false; s.m.visible = false; });
    laid = 0; finished = false; finishing = false; api.finished = false; opts.onCoverage?.(0);
  }

  // type switcher. Every surface goes down the way it would on site:
  //   block paving and natural stone: a sand/mortar bed, then each piece laid by hand, far to near (instanced, animated in the shader)
  //   resin: poured from the back, a wet glossy front with an uneven edge creeping forward
  //   porcelain: the slabs above
  // A new surface always goes down on top of what is there (one level up); when it is done the old one is hidden
  // and the new one eases back down to ground level.
  const LIFT = 0.035, PT = 0.03;
  const uTime = { value: 0 };
  type Layer = { group: THREE.Group; start: number; end: number; dispose: () => void; tick?: (t: number) => void };
  const layers = new Map<SurfaceKind, Layer>();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let kind: SurfaceKind = 'porcelain';
  let top: THREE.Group = slabGroup;                  // what is on show (or going down)
  let blendC = { c1: '#8C6A3F', c2: '#C49A62', c3: '#E9D3A6' };
  let active: Layer | null = null;
  let lowering: { g: THREE.Group; t0: number; y0: number } | null = null;
  const KZ = 0.15, ACROSS = 0.34;                     // seconds per metre of depth, and for a left-to-right pass

  // drop animation shared by every instanced piece: aT0 = when it starts falling, aSeed = per-piece variety
  const dropShader = (dur: number, h: number) => (sh: { uniforms: Record<string, unknown>; vertexShader: string }) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; attribute float aT0; attribute float aSeed;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float kk = clamp((uTime - aT0) / ${dur.toFixed(3)}, 0.0, 1.0);
        float ee = kk < 0.5 ? 4.0 * kk * kk * kk : 1.0 - pow(-2.0 * kk + 2.0, 3.0) / 2.0;
        float sw = 1.0 - ee;
        float ax = (fract(aSeed * 13.7) - 0.5) * 0.14 * sw * sw, az = (fract(aSeed * 7.3) - 0.5) * 0.14 * sw * sw;
        transformed.yz = mat2(cos(ax), sin(ax), -sin(ax), cos(ax)) * transformed.yz;
        transformed.xy = mat2(cos(az), sin(az), -sin(az), cos(az)) * transformed.xy;
        float bt = uTime - aT0 - ${dur.toFixed(3)};
        transformed.y += ${h.toFixed(3)} * (0.9 + 0.2 * fract(aSeed * 3.1)) * (1.0 - ee) + (bt > 0.0 ? max(0.0, sin(bt * 22.0) * 0.003 * exp(-bt * 16.0)) : 0.0);
        if (uTime < aT0) transformed *= 0.0;`);
  };
  const uvShift = (sh: { vertexShader: string }) => {
    sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
      #ifdef USE_MAP
        vMapUv += vec2(fract(aSeed * 5.13), fract(aSeed * 9.71));
      #endif
      #ifdef USE_NORMALMAP
        vNormalMapUv += vec2(fract(aSeed * 5.13), fract(aSeed * 9.71));
      #endif`);
  };

  type Piece = { x: number; z: number; w: number; d: number; ry: number; c: THREE.Color };
  // 45° herringbone, 200 x 100 mm blocks: staircases of H/V pairs repeating every (2W, -2W), turned 45°
  function blockPieces() {
    const W = 0.1, out: Piece[] = [], cols = ['#6a4a3c', '#735040', '#5f4337', '#7a5a47', '#55403a', '#6b5547', '#4d3f39', '#704c3d'].map((c) => new THREE.Color(c));
    const R = 140, ox = 0.6, oz = -3;
    for (let k = -R; k <= R; k++) for (let i = -R; i <= R; i++) {
      const bx = i * W + k * 2 * W, by = i * W - k * 2 * W;
      for (const [cx, cy, ry] of [[bx + W, by + W / 2, -Math.PI / 4], [bx + W / 2, by + 2 * W, -3 * Math.PI / 4]]) {
        const x = (cx - cy) * Math.SQRT1_2 + ox, z = (cx + cy) * Math.SQRT1_2 + oz;
        if (x < -14 || x > 15 || z < -15 || z > 5 || !seenNow(x, z, 0.25)) continue;
        out.push({ x, z, w: 0.2, d: 0.1, ry, c: cols[Math.floor(rnd() * cols.length)] });
      }
    }
    return out;
  }
  // random-pattern natural stone on a 300 mm grid: 900x600, 600x900, 600x600, 900x900, 600x300, 300x600, 300x300 flags
  function stonePieces() {
    const C = 0.3, out: Piece[] = [], x0 = -14, z0 = -15, GX = 98, GZ = 68;
    const used = Array.from({ length: GZ }, () => new Uint8Array(GX));
    const shapes = [[3, 2], [2, 3], [2, 2], [3, 3], [2, 1], [1, 2], [1, 1]];
    const cols = ['#a08f76', '#ad9a7e', '#94846e', '#8a7f70', '#b3a184', '#9a8670', '#837666'].map((c) => new THREE.Color(c));
    for (let y = 0; y < GZ; y++) for (let x = 0; x < GX; x++) {
      if (used[y][x]) continue;
      const fit = shapes.filter(([w, h]) => { for (let a = 0; a < h; a++) for (let b = 0; b < w; b++) if (x + b >= GX || y + a >= GZ || used[y + a][x + b]) return false; return true; });
      const [w, h] = fit[Math.min(fit.length - 1, Math.floor(rnd() * Math.min(4, fit.length)))];
      for (let a = 0; a < h; a++) for (let b = 0; b < w; b++) used[y + a][x + b] = 1;
      const px = x0 + (x + w / 2) * C, pz = z0 + (y + h / 2) * C;
      if (!seenNow(px, pz, Math.max(w, h) * C)) continue;
      out.push({ x: px, z: pz, w: w * C, d: h * C, ry: 0, c: cols[Math.floor(rnd() * cols.length)] });
    }
    return out;
  }

  // bed under the pieces: revealed just ahead of the laying front, so joints never show the old surface
  function bed(color: string, start: number, zFar: number) {
    const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), zFar);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), new THREE.MeshStandardMaterial({ color, roughness: 1, normalMap: gNor, normalScale: new THREE.Vector2(0.5, 0.5), clippingPlanes: [clip] }));
    m.rotation.x = -Math.PI / 2; m.position.set(0.6, 0.001, -4); m.receiveShadow = true;
    return { m, tick: (t: number) => { clip.constant = zFar - 0.4 + Math.max(0, t - start + 0.25) / KZ; } };
  }

  function pieceLayer(k: 'block' | 'stone', start: number): Layer {
    const g = new THREE.Group();
    const P = k === 'block' ? blockPieces() : stonePieces();
    const zFar = Math.min(...P.map((p) => p.z)), xs = P.map((p) => p.x), x0 = Math.min(...xs), sx = Math.max(...xs) - x0 || 1;
    const t0 = (p: Piece) => start + (p.z - zFar) * KZ + ((p.x - x0) / sx) * ACROSS + rnd() * 0.04;
    const joint = k === 'block' ? 0.006 : 0.012;
    const map = sMap.clone(), nor = sNor.clone();
    for (const t of [map, nor]) { t.repeat.set(k === 'block' ? 0.12 : 0.35, k === 'block' ? 0.12 : 0.35); t.needsUpdate = true; }
    const mat = new THREE.MeshStandardMaterial({ map, normalMap: nor, normalScale: new THREE.Vector2(k === 'block' ? 0.5 : 1.1, k === 'block' ? 0.5 : 1.1), roughness: k === 'block' ? 0.86 : 0.8, metalness: 0, envMapIntensity: 0.6 });
    mat.onBeforeCompile = (sh) => { dropShader(0.5, k === 'block' ? 0.4 : 0.5)(sh); uvShift(sh); };
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.onBeforeCompile = dropShader(0.5, k === 'block' ? 0.4 : 0.5);
    // one instanced mesh per piece size (rounded edges stay true to size)
    const bySize = new Map<string, Piece[]>();
    for (const p of P) { const key = `${p.w.toFixed(2)}x${p.d.toFixed(2)}`; (bySize.get(key) ?? bySize.set(key, []).get(key)!).push(p); }
    const geos: THREE.BufferGeometry[] = [];
    let end = 0;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
    for (const list of bySize.values()) {
      const { w, d } = list[0];
      const geo = k === 'block' && coarse ? new THREE.BoxGeometry(w - joint, PT, d - joint) : new RoundedBoxGeometry(w - joint, PT, d - joint, 1, k === 'block' ? 0.007 : 0.01);
      geo.translate(0, PT / 2, 0);
      const aT0 = new Float32Array(list.length), aSeed = new Float32Array(list.length);
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((p, i) => {
        M.compose(V.set(p.x, 0, p.z), Q.setFromAxisAngle(Y, p.ry), S); im.setMatrixAt(i, M);
        im.setColorAt(i, p.c.clone().multiplyScalar((k === 'block' ? 1.85 : 1.7) * (0.9 + rnd() * 0.2)));
        aT0[i] = t0(p); aSeed[i] = rnd(); end = Math.max(end, aT0[i] + 0.6);
      });
      geo.setAttribute('aT0', new THREE.InstancedBufferAttribute(aT0, 1));
      geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1));
      im.castShadow = true; im.receiveShadow = true; im.customDepthMaterial = depth; im.frustumCulled = false;
      g.add(im); geos.push(geo);
    }
    const b = bed(k === 'block' ? '#6e6456' : '#5f594f', start, zFar);
    g.add(b.m);
    scene.add(g);
    return { group: g, start, end, tick: b.tick, dispose: () => { scene.remove(g); geos.forEach((x) => x.dispose()); mat.dispose(); depth.dispose(); map.dispose(); nor.dispose(); b.m.geometry.dispose(); (b.m.material as THREE.Material).dispose(); } };
  }

  // resin: poured from the back. The front is uneven and wet (darker, glossy) and dries behind itself.
  function resinLayer(start: number): Layer {
    const g = new THREE.Group();
    const sf = makeSurface('resin', aniso, blendC);
    const PW = 30, PD = 22;
    for (const t of [sf.map, sf.normal]) t.repeat.set(PW / sf.tile, PD / sf.tile);
    const zFar = -15, zNear = 5, dur = (zNear - zFar) * KZ * 0.85;
    const uFront = { value: zFar - 2 };
    const mat = new THREE.MeshPhysicalMaterial({ map: sf.map, normalMap: sf.normal, color: sf.tint, roughness: sf.rough, metalness: 0, clearcoat: sf.clear, clearcoatRoughness: 0.3, envMapIntensity: 0.75 });
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uFront = uFront;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n varying vec3 vW;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        uniform float uFront; varying vec3 vW;
        float hh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float nn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hh(i), hh(i + vec2(1, 0)), f.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), f.x), f.y); }`)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
          float edge = uFront + 0.45 * sin(vW.x * 1.1 + 0.7) + 0.22 * sin(vW.x * 3.7 + 2.1) + 0.35 * nn(vW.xz * 2.2) + 0.12 * nn(vW.xz * 9.0);
          float ahead = edge - vW.z;
          if (ahead < 0.0) discard;
          float wet = 1.0 - smoothstep(0.0, 1.6, ahead);`)
        .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, 0.62, wet);')
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.08, wet);');
    };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), mat);
    m.rotation.x = -Math.PI / 2; m.position.set(0.6, 0.006, -4); m.receiveShadow = true;
    g.add(m); scene.add(g);
    const tick = (t: number) => { const k = Math.max(0, Math.min(1, (t - start) / dur)); uFront.value = zFar - 1 + (zNear - zFar + 3) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); };
    return { group: g, start, end: start + dur + 0.2, tick, dispose: () => { scene.remove(g); m.geometry.dispose(); mat.dispose(); sf.map.dispose(); sf.normal.dispose(); } };
  }

  // hide everything but the finished surface, then ease it down to ground level
  function settle(g: THREE.Group) {
    if (g !== slabGroup) slabGroup.visible = false;
    layers.forEach((L) => { if (L.group !== g) { L.dispose(); } });
    for (const [k, L] of [...layers]) if (L.group !== g) layers.delete(k);
    lowering = { g, t0: now(), y0: g.position.y };
  }
  function surface(k: SurfaceKind, force = false) {
    if (k === kind && !force) return;
    kind = k; frozen = false;
    const y = top.position.y + LIFT, t = now() + 0.05;
    lowering = null;
    if (active) { active = null; }
    if (k === 'porcelain') {
      slabGroup.visible = true; slabGroup.position.y = y; top = slabGroup;
      slabs.forEach((s) => { s.state = 0; s.hit = false; s.m.visible = false; });
      laid = 0; finished = false; finishing = true; api.finished = false;
      sweep(order(), t, 0.1, 0.3);
      return;
    }
    const old = layers.get(k); if (old) { layers.delete(k); layers.set(`${k}-old` as SurfaceKind, old); }   // stays under the re-pour
    const L = k === 'resin' ? resinLayer(t) : pieceLayer(k, t);
    L.group.position.y = y; layers.set(k, L); top = L.group; active = L;
  }
  function stepLayers(t: number) {
    uTime.value = t;
    layers.forEach((L) => L.tick?.(t));
    if (active && t > active.end) { const g = active.group; active = null; settle(g); }
    if (lowering) {
      const k = Math.min(1, (t - lowering.t0) / 0.6);
      lowering.g.position.y = lowering.y0 * (1 - k * k * (3 - 2 * k));
      if (k >= 1) lowering = null;
    }
  }

  // pointer: drag across the ground to drop the slabs under it
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const onPtr = (e: PointerEvent) => {
    if (kind !== 'porcelain' || (e.target as HTMLElement)?.closest?.('[data-nopour],a,button,input,select,label')) return;
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    if (!ray.ray.intersectPlane(plane, hit)) return;
    const t = now();
    let n = 0;
    for (const s of slabs) {
      if (s.state !== 0) continue;
      const d = Math.hypot((s.x - hit.x) / 1.1, (s.z - hit.z) / 0.8);
      if (d < 1) { drop(s, t + d * 0.12 + n * 0.02); n++; }
    }
    if (n && !first) { first = true; opts.onFirst?.(); }
  };
  host.addEventListener('pointermove', onPtr, { passive: true });
  host.addEventListener('pointerdown', onPtr, { passive: true });

  // loop (paused off-screen)
  const clock = new THREE.Timer();
  const now = () => clock.getElapsed();
  let raf = 0, visible = true, frozen = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { threshold: 0 });
  io.observe(host);
  const lost = (e: Event) => { e.preventDefault(); opts.onLost?.(); };
  cv.addEventListener('webglcontextlost', lost);

  function loop() {
    raf = 0;
    clock.update();
    if (dead || !visible) return;
    const t = now();
    if (!frozen) {
      stepLayers(t);
      for (const s of slabs) {
        if (s.state !== 1) continue;
        const k = (t - s.t0) / s.dur;
        if (k < 0) { s.m.visible = false; continue; }
        s.m.visible = true;
        if (k >= 1) {
          const b = t - s.t0 - s.dur;                     // settle after the landing
          const y = TH / 2 + Math.max(0, Math.sin(b * 22) * 0.004 * Math.exp(-b * 16));
          s.m.position.set(s.x, y, s.z);
          const r = Math.exp(-b * 18);
          s.m.rotation.set(s.rx * 0.04 * r, 0, s.rz * 0.04 * r);
          if (!s.hit) landed(s, t);
          if (b > 0.35) { s.m.rotation.set(0, 0, 0); s.m.position.y = TH / 2; s.state = 2; }
          continue;
        }
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // lowered into place, slows before contact
        const sw = 1 - e;
        s.m.position.set(s.x, TH / 2 + s.h * (1 - e), s.z);
        s.m.rotation.set(s.rx * sw * sw, s.ry * sw * sw, s.rz * sw * sw);
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i], a = t - p.t0, k = a / 0.9;
        if (k >= 1) { scene.remove(p.s); p.s.material.dispose(); puffs.splice(i, 1); continue; }
        p.s.position.x += p.vx * 0.012; p.s.position.z += p.vz * 0.012; p.s.position.y = 0.04 + k * 0.18;
        p.s.scale.setScalar(0.25 + k * 0.7);
        p.s.material.opacity = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 0.5;
      }
      // idle life: leaves sway, camera breathes
      leaves.position.x = -2.2 + Math.sin(t * 0.45) * 0.12 + Math.sin(t * 1.3) * 0.03;
      leaves.position.z = -1.2 + Math.cos(t * 0.37) * 0.08;
      cam.position.x += (Math.sin(t * 0.12) * 0.08 + (portrait ? 0.5 : 0.7) - cam.position.x) * 0.02;
      cam.lookAt(look);
    }
    renderer.render(scene, cam);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  const api = {
    loaded: false, finished: false,
    demo, finish: () => finish(), reset, prefill, fillAll,
    surface,
    set: (b: { c1: string; c2: string; c3: string }) => {
      if (b.c1 === blendC.c1 && b.c2 === blendC.c2 && b.c3 === blendC.c3) return;
      blendC = { c1: b.c1, c2: b.c2, c3: b.c3 };
      if (kind === 'resin') surface('resin', true);
    },
    light: (_x: number, _y: number) => {},
    destroy() {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener('pointermove', onPtr); host.removeEventListener('pointerdown', onPtr);
      cv.removeEventListener('webglcontextlost', lost);
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mm = m.material as THREE.Material | THREE.Material[] | undefined; (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((x) => x.dispose()); });
      [gMap, gNor, sMap, sNor, env, dustTex, leafTex].forEach((t) => t.dispose());
      pm.dispose(); renderer.dispose();
    },
  };
  return api;
}
export type SlabApi = NonNullable<ReturnType<typeof initSlabs>>;
