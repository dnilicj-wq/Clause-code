// Brick-drop hero: grey and red block paving falls from above onto an old cracked concrete drive, course by course.
// three.js InstancedMesh (one draw call for ~1,500 bricks), cracked-concrete PBR ground (CC0 Poly Haven, baked by
// scripts/prep-slab.mjs), soft sun shadows, leaf dapple for idle motion. Same callback shape as drive-pour.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeSurface, type SurfaceKind } from './surfaces';
export type { SurfaceKind };

export type BrickOpts = {
  fog: string; tex: string;
  onFirst?: () => void; onCoverage?: (c: number) => void; onFinished?: () => void; onReady?: () => void; onLost?: () => void;
};

const BW = 0.3, BD = 0.15, JOINT = 0.007, TH = 0.07;   // block pavers (drawn a touch larger than 200 x 100 so they read on a phone)
const COLS = 46, ROWS = 76;                               // big enough to fill the frame to the top on any screen                               // field incl. the border
const X0 = -6.2, Z0 = 2.7;
export const START = 0;
const ROWGAP = 0.06, SWEEP = 0.4, FALL_H = 1.1, DUR = 0.4; // course after course, each sweeping left to right

// brindle mix: mostly greys with red runs, charcoal border
const GREYS = ['#5e5e61', '#717070', '#4d4d50', '#7f7e7b', '#585654'];
const REDS = ['#6a2219', '#7c2a1f', '#5a1d16', '#8a3324'];
const BORDER = '#232326';

type B = { i: number; x: number; z: number; ux: number; uy: number; uz: number; rot: boolean; state: 0 | 1 | 2; t0: number; dur: number; h: number; rx: number; ry: number; rz: number; hit: boolean };

export function initBricks(host: HTMLElement, cv: HTMLCanvasElement, opts: BrickOpts) {
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); } catch { return null; }
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
  scene.fog = new THREE.Fog(fogC, 13, 28);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  (scene as any).environmentIntensity = 0.4;

  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const look = new THREE.Vector3();
  scene.add(new THREE.HemisphereLight('#d6dce2', '#2a251e', 0.36));
  const sun = new THREE.DirectionalLight('#ffe2bd', 4.1);
  sun.position.set(-6.5, 8.5, -3.2); sun.target.position.set(0.4, 0, -0.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 30 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  scene.add(sun, sun.target);

  const tl = new THREE.TextureLoader();
  let pending = 4, dead = false;
  const ready = () => { if (--pending === 0 && !dead) { api.loaded = true; opts.onReady?.(); } };
  const tex = (f: string, srgb: boolean) => {
    const t = tl.load(opts.tex + f, ready, undefined, ready);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const gMap = tex(coarse ? 'ground-1k-v2.webp' : 'ground-v2.webp', true), gNor = tex(coarse ? 'ground-n-1k-v2.jpg' : 'ground-n-v2.jpg', false);
  const sMap = tex('slab-512-v1.webp', true), sNor = tex('slab-n-512-v1.jpg', false);
  gMap.repeat.set(4.6, 4.6); gNor.repeat.set(4.6, 4.6); gMap.rotation = gNor.rotation = 0.35;
  sMap.repeat.set(0.35, 0.18); sNor.repeat.set(0.35, 0.18);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), new THREE.MeshStandardMaterial({ map: gMap, normalMap: gNor, normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.95, color: '#8e8d8b', metalness: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // the bricks: stretcher bond along x, two-course charcoal border on the sides and front
  const list: B[] = [];
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cols: THREE.Color[] = [];
  for (let r = 0; r < ROWS; r++) {
    const z = Z0 - r * BD - BD / 2, off = r % 2 ? BW / 2 : 0;
    for (let c = -1; c < COLS; c++) {
      const x = X0 + off + c * BW + BW / 2;
      if (x < X0 + BW / 2 - 0.001 || x > X0 + COLS * BW - BW / 2 + 0.001) continue;
      const edge = r < 2 || x < X0 + BW || x > X0 + (COLS - 1) * BW;
      const pick = edge ? BORDER : (rnd() < 0.34 ? REDS[Math.floor(rnd() * REDS.length)] : GREYS[Math.floor(rnd() * GREYS.length)]);
      cols.push(new THREE.Color(pick).offsetHSL(0, 0, (rnd() - 0.5) * 0.04));
      list.push({ i: list.length, x, z, ux: 0, uy: 1, uz: 0, rot: false, state: 0, t0: 0, dur: 0, h: 0, rx: 0, ry: 0, rz: 0, hit: false });
    }
  }
  const total = list.length;
  const geo = new RoundedBoxGeometry(BW - JOINT, TH, BD - JOINT, 2, 0.008);
  const mat = new THREE.MeshStandardMaterial({ map: sMap, normalMap: sNor, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.82, metalness: 0, color: '#ffffff' });
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), S0 = new THREE.Vector3(0, 0, 0);
  // lift = how far up the brick's own line of sight it still is: it falls toward its spot without leaving the screen
  const setM = (b: B, y: number, rx = 0, ry = 0, rz = 0, show = true, lift = 0) => {
    P.set(b.x + b.ux * lift, y + b.uy * lift, b.z + b.uz * lift); Q.setFromEuler(E.set(rx, ry, rz)); M.compose(P, Q, show ? S1 : S0); mesh.setMatrixAt(b.i, M);
  };
  list.forEach((b, k) => { mesh.setColorAt(k, cols[k]); setM(b, 0, 0, 0, 0, false); });
  const brickGroup = new THREE.Group(); brickGroup.add(mesh); scene.add(brickGroup);

  // dust where a course lands
  const dustTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d')!; const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(225,215,195,.5)'); gr.addColorStop(1, 'rgba(225,215,195,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  type Puff = { s: THREE.Sprite; t0: number; vx: number; vz: number };
  const puffs: Puff[] = [];
  const puff = (x: number, z: number, now: number) => {
    if (puffs.length > 40) return;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.position.set(x, 0.05, z); s.scale.setScalar(0.2); scene.add(s);
    puffs.push({ s, t0: now, vx: (Math.random() - 0.5) * 0.6, vz: (Math.random() - 0.5) * 0.4 });
  };

  // leaf dapple (invisible plane that only casts shadows)
  const leafTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d')!; g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512); g.fillStyle = '#fff';
    for (let k = 0; k < 60; k++) {
      const cx = Math.pow(Math.random(), 1.6) * 320, cy = Math.random() * 512, R = 18 + Math.random() * 34;
      for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, d = R * Math.sqrt(Math.random()); g.beginPath(); g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 + Math.random() * 4, 1.2 + Math.random() * 2.2, Math.random() * Math.PI, 0, Math.PI * 2); g.fill(); }
    }
    return new THREE.CanvasTexture(c);
  })();
  const leaves = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, alphaMap: leafTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  leaves.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: leafTex, alphaTest: 0.5, side: THREE.DoubleSide });
  leaves.rotation.x = -Math.PI / 2; leaves.position.set(-2.4, 3.4, -1.2); leaves.castShadow = true; leaves.visible = false; scene.add(leaves); // dapple off: kept the ground clean behind the headline

  let W = 1, H = 1, portrait = false;
  const frame = () => {
    W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
    renderer.setSize(W, H, false); cam.aspect = W / H; portrait = W / H < 0.9;
    // looking down at the drive steeply enough that the floor fills the frame right up to the top edge
    if (portrait) { cam.fov = 46.5; cam.position.set(0.4, 6.2, 2.6); look.set(0.4, 0, -1.2); }
    else { cam.fov = 31.5; cam.position.set(0.7, 5.2, 4.6); look.set(0.7, 0, -1.8); }
    cam.updateProjectionMatrix(); cam.lookAt(look);
  };
  frame();
  const ro = new ResizeObserver(frame); ro.observe(host);

  let laid = 0, finished = false, first = false, finishing = false;
  const falling = new Set<B>();
  const aim = (b: B) => {
    b.ux = cam.position.x - b.x; b.uy = cam.position.y; b.uz = cam.position.z - b.z;
    const n = Math.hypot(b.ux, b.uy, b.uz); b.ux /= n; b.uy /= n; b.uz /= n;
  };
  const drop = (b: B, at: number) => {
    if (b.state !== 0) return;
    aim(b);
    b.state = 1; b.t0 = at; b.h = FALL_H; b.dur = DUR;
    b.rx = -0.18; b.rz = 0; b.ry = 0;                       // every brick tips in the same way: reads as one smooth wave
    falling.add(b);
  };
  const coverage = () => laid / total;
  const landed = (b: B, now: number) => {
    b.hit = true; laid++;
    if (b.i % 9 === 0) puff(b.x, b.z, now);
    if (laid % 12 === 0 || laid === total) opts.onCoverage?.(coverage());
    if (laid === total && !finished) { finished = true; api.finished = true; opts.onFinished?.(); if (top === brickGroup) settle(brickGroup); if (!prebuilt) { prebuilt = true; prebuild(); } }
  };
  // what the camera can see: bricks off-screen are simply placed; the visible ones are laid course by course
  // from the top of the screen down, each course sweeping left to right.
  const V = new THREE.Vector3();
  const plan = () => {
    cam.updateMatrixWorld();
    const vis: { b: B; sx: number; out: boolean }[] = [];
    for (const b of list) {
      if (b.state !== 0) continue;
      V.set(b.x, 0, b.z).project(cam);
      // only bricks below the frame are placed up front (their shadows fall off-screen); anything above or beside
      // the frame lands with the course it belongs to, so no stray shadows appear before the bricks do
      if (V.y < -1.08) { place(b); laid++; continue; }
      aim(b);
      vis.push({ b, sx: Math.max(0, Math.min(1, (V.x + 1) / 2)), out: V.y > 1 || Math.abs(V.x) > 1 });
    }
    const rowKey = (b: B) => Math.round((Z0 - b.z) / BD);
    const rows = [...new Set(vis.filter((v) => !v.out).map((v) => rowKey(v.b)))].sort((p, q) => q - p);   // far (top of screen) first
    const idx = new Map(rows.map((r, i) => [r, i] as const));
    mesh.instanceMatrix.needsUpdate = true;
    return vis.map((v) => ({ b: v.b, row: idx.get(rowKey(v.b)) ?? 0, sx: v.sx })).sort((p, q) => p.row - q.row || p.sx - q.sx);
  };
  function finish(gap = 0.03) {
    finishing = true; const t = now();
    plan().forEach((v) => drop(v.b, t + v.row * gap + v.sx * 0.25));
  }
  function place(b: B) { b.state = 2; b.hit = true; setM(b, TH / 2); }
  function demo(start = START) {
    const t = now() + 0.1, p = plan();
    const skip = Math.round(p.length * start);
    p.slice(0, skip).forEach((v) => { place(v.b); laid++; });
    const rows = p.length ? p[p.length - 1].row + 1 : 1, gap = Math.min(ROWGAP, 1.5 / rows);   // whole wave ~2s on any screen
    p.slice(skip).forEach((v) => drop(v.b, t + v.row * gap + v.sx * SWEEP));
    mesh.instanceMatrix.needsUpdate = true;
  }
  function prefill(_f = 0) { plan(); mesh.instanceMatrix.needsUpdate = true; frozen = true; }   // poster = the bare floor the wave starts from
  function fillAll() { list.forEach(place); laid = total; mesh.instanceMatrix.needsUpdate = true; frozen = true; }
  function reset() { list.forEach((b) => { b.state = 0; b.hit = false; setM(b, 0, 0, 0, 0, false); }); falling.clear(); mesh.instanceMatrix.needsUpdate = true; laid = 0; finished = false; finishing = false; api.finished = false; opts.onCoverage?.(0); }

  // type switcher (ported from the Proficient Essex slab-drop engine). Every surface goes down the way it would on site:
  //   block paving: the bricks above, laid course by course
  //   patio: a sand/mortar bed, then each flag laid by hand, far to near (instanced, animated in the shader)
  //   resin and tarmac: poured from the back, a wet glossy front with an uneven edge creeping forward
  // A new surface always goes down on top of what is there (one level up); when it is done the old one is hidden
  // and the new one eases back down to ground level.
  const LIFT = 0.035, PT = 0.03;
  const uTime = { value: 0 };
  type Layer = { group: THREE.Group; start: number; end: number; dispose: () => void; tick?: (t: number) => void };
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let kind: SurfaceKind = 'block';
  let top: THREE.Group = brickGroup;                 // what is on show (or going down)
  let blendC = { c1: '#8C6A3F', c2: '#C49A62', c3: '#E9D3A6' };
  let active: Layer | null = null;
  let lowering: { g: THREE.Group; t0: number; y0: number } | null = null;
  const KZ = 0.15, ACROSS = 0.34;                     // seconds per metre of depth, and for a left-to-right pass

  // which ground the camera can see now (with a margin): pieces outside it are never built
  const box = new THREE.Box3(), fr = new THREE.Frustum();
  const seenNow = (x: number, z: number, w: number) => {
    const c = new THREE.PerspectiveCamera(cam.fov + 6, cam.aspect, 0.1, 40);
    c.position.copy(cam.position); c.lookAt(look); c.updateMatrixWorld(); c.updateProjectionMatrix();
    fr.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse));
    box.min.set(x - w / 2, 0, z - w / 2); box.max.set(x + w / 2, PT, z + w / 2);
    return fr.intersectsBox(box);
  };
  // the farthest ground the viewer can see (the top edge of the screen): laying starts there, not off-screen
  const zVis = () => {
    const rc = new THREE.Raycaster(), hp = new THREE.Vector3();
    rc.setFromCamera(new THREE.Vector2(0, 1), cam);
    return rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hp) ? hp.z : -99;
  };

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
  // patio: random-pattern sandstone flags on a 300 mm grid: 900x600, 600x900, 600x600, 900x900, 600x300, 300x600, 300x300
  function patioPieces() {
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

  // bed under the pieces: a dark sand/mortar layer revealed exactly where pieces have just landed (the clip plane is
  // tilted to match the laying order: depth first, then left to right), so joints never show the old surface
  function bed(color: string) {
    const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), -99);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), new THREE.MeshStandardMaterial({ color, roughness: 1, clippingPlanes: [clip] }));
    m.rotation.x = -Math.PI / 2; m.position.set(0.6, 0.001, -4); m.receiveShadow = true;
    const at = (t: number, start: number, zFar: number, x0: number, a: number) => {
      const L = Math.hypot(a, KZ);
      clip.normal.set(-a / L, 0, -KZ / L);
      clip.constant = (t - start - 0.42 + KZ * zFar + a * x0) / L;
    };
    return { m, at };
  }

  // Each surface is built once (in idle time after the first lay, or on first tap) and then re-used:
  // laying it again only rewrites the per-piece start times.
  type Built = Layer & { reset: (start: number) => void };
  const built = new Map<SurfaceKind, Built>();
  function pieceLayer(): Built {
    const g = new THREE.Group(); g.visible = false;
    const P = patioPieces();
    const zFar = Math.min(...P.map((p) => p.z)), xs = P.map((p) => p.x), x0 = Math.min(...xs), sx = Math.max(...xs) - x0 || 1, a = ACROSS / sx;
    const joint = 0.012;
    const map = sMap.clone(), nor = sNor.clone();
    for (const t of [map, nor]) { t.repeat.set(0.35, 0.35); t.needsUpdate = true; }
    const pmat = new THREE.MeshStandardMaterial({ map, normalMap: nor, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.8, metalness: 0, envMapIntensity: 0.6 });
    pmat.onBeforeCompile = (sh) => { dropShader(0.5, 0.5)(sh); uvShift(sh); };
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.onBeforeCompile = dropShader(0.5, 0.5);
    const bySize = new Map<string, Piece[]>();
    for (const p of P) { const key = `${p.w.toFixed(2)}x${p.d.toFixed(2)}`; (bySize.get(key) ?? bySize.set(key, []).get(key)!).push(p); }
    const geos: THREE.BufferGeometry[] = [];
    const slots: { attr: THREE.InstancedBufferAttribute; pz: Float32Array; px: Float32Array; jit: Float32Array }[] = [];
    let zStart = zFar;
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
    for (const list of bySize.values()) {
      const { w, d } = list[0];
      const geo = new RoundedBoxGeometry(w - joint, PT, d - joint, 1, 0.01);
      geo.translate(0, PT / 2, 0);
      const pz = new Float32Array(list.length), px = new Float32Array(list.length), jit = new Float32Array(list.length), aT0 = new Float32Array(list.length).fill(1e9), aSeed = new Float32Array(list.length);
      const im = new THREE.InstancedMesh(geo, pmat, list.length);
      list.forEach((p, i) => {
        M.compose(V.set(p.x, 0, p.z), Q.setFromAxisAngle(Y, p.ry), S); im.setMatrixAt(i, M);
        im.setColorAt(i, p.c.clone().multiplyScalar(1.7 * (0.9 + rnd() * 0.2)));
        pz[i] = p.z; px[i] = p.x; jit[i] = rnd() * 0.04; aSeed[i] = rnd();
      });
      const attr = new THREE.InstancedBufferAttribute(aT0, 1); attr.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('aT0', attr);
      geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1));
      im.castShadow = true; im.receiveShadow = true; im.customDepthMaterial = depth; im.frustumCulled = false;
      g.add(im); geos.push(geo); slots.push({ attr, pz, px, jit });
    }
    const b = bed('#433e37');
    g.add(b.m);
    scene.add(g);
    const L: Built = {
      group: g, start: 1e9, end: 1e9,
      reset(start) {
        zStart = Math.max(zFar, zVis() - 0.6);
        let span = 0;
        for (const s of slots) {
          const arr = s.attr.array as Float32Array;
          for (let i = 0; i < arr.length; i++) { const d = Math.max(0, s.pz[i] - zStart) * KZ + (s.px[i] - x0) * a + s.jit[i]; arr[i] = start + d; if (d > span) span = d; }
          s.attr.needsUpdate = true;
        }
        L.start = start; L.end = start + span + 0.6;
      },
      tick: (t) => b.at(t, L.start, zStart, x0, a),
      dispose: () => { scene.remove(g); geos.forEach((x) => x.dispose()); pmat.dispose(); depth.dispose(); map.dispose(); nor.dispose(); b.m.geometry.dispose(); (b.m.material as THREE.Material).dispose(); },
    };
    return L;
  }

  // resin and tarmac: poured from the back. The front is uneven and wet (darker, glossy) and dries behind itself.
  function pourLayer(k: 'resin' | 'tarmac'): Built {
    const g = new THREE.Group(); g.visible = false;
    let sf = makeSurface(k, aniso, blendC, coarse);
    const PW = 30, PD = 22;
    const rep = () => { for (const t of [sf.map, sf.normal]) t.repeat.set(PW / sf.tile, PD / sf.tile); };
    rep();
    const zNear = 5; let zFar = -15, dur = (zNear - zFar) * KZ * 0.85;
    const uFront = { value: -99 };
    const rmat = new THREE.MeshPhysicalMaterial({ map: sf.map, normalMap: sf.normal, color: sf.tint, roughness: sf.rough, metalness: 0, clearcoat: sf.clear, clearcoatRoughness: 0.3, envMapIntensity: 0.75 });
    rmat.onBeforeCompile = (sh) => {
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
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), rmat);
    m.rotation.x = -Math.PI / 2; m.position.set(0.6, 0.006, -4); m.receiveShadow = true;
    g.add(m); scene.add(g);
    const L: Built = {
      group: g, start: 1e9, end: 1e9,
      reset(start) { zFar = Math.max(-15, zVis() - 1); dur = (zNear - zFar) * KZ * 0.85; L.start = start; L.end = start + dur + 0.2; uFront.value = -99; },
      tick: (t) => { const kk = Math.max(0, Math.min(1, (t - L.start) / dur)); uFront.value = t < L.start ? -99 : zFar - 1.5 + (zNear - zFar + 3.5) * (kk < 0.5 ? 2 * kk * kk : 1 - Math.pow(-2 * kk + 2, 2) / 2); },
      dispose: () => { scene.remove(g); m.geometry.dispose(); rmat.dispose(); sf.map.dispose(); sf.normal.dispose(); },
    };
    // a new blend repaints the stone in place
    if (k === 'resin') (L as any).recolour = () => { const old = sf; sf = makeSurface('resin', aniso, blendC, coarse); rep(); rmat.map = sf.map; rmat.normalMap = sf.normal; rmat.needsUpdate = true; old.map.dispose(); old.normal.dispose(); };
    return L;
  }
  const build = (k: Exclude<SurfaceKind, 'block'>) => {
    let L = built.get(k);
    if (!L) { L = k === 'patio' ? pieceLayer() : pourLayer(k); built.set(k, L); warm.push(L.group); }
    return L;
  };
  // first frame of a new material compiles its shaders; do that while nobody is watching (all pieces collapsed)
  const warm: THREE.Group[] = [];
  let warming: THREE.Group[] = [];
  function prebuild() {
    const todo: Exclude<SurfaceKind, 'block'>[] = ['resin', 'tarmac', 'patio'];
    const idle = (f: () => void) => ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(f, { timeout: 1500 }) : setTimeout(f, 120));
    const next = () => { if (dead) return; const k = todo.shift(); if (!k) return; if (!built.has(k)) build(k); idle(next); };
    idle(next);
  }

  // hide everything but the finished surface, then ease it down to ground level
  function settle(g: THREE.Group) {
    if (g !== brickGroup) brickGroup.visible = false;
    built.forEach((L) => { if (L.group !== g) L.group.visible = false; });
    lowering = { g, t0: now(), y0: g.position.y };
  }
  let prebuilt = false;
  function surface(k: SurfaceKind, force = false) {
    if (k === kind && !force) return;
    if (force && k === 'resin') { (built.get('resin') as any)?.recolour?.(); return; }
    // the new surface goes down on top of whatever is showing (bricks stand taller than the other surfaces)
    const y = top.position.y + (top === brickGroup ? TH : LIFT), t = now() + 0.03;
    kind = k; frozen = false;
    lowering = null; active = null;
    if (k === 'block') {
      brickGroup.visible = true; brickGroup.position.y = y; top = brickGroup;
      list.forEach((b) => { b.state = 0; b.hit = false; setM(b, 0, 0, 0, 0, false); });
      falling.clear(); mesh.instanceMatrix.needsUpdate = true;
      laid = 0; finished = false; finishing = true; api.finished = false;
      const p = plan(), rows = p.length ? p[p.length - 1].row + 1 : 1, gap = Math.min(ROWGAP, 1.5 / rows);
      p.forEach((v) => drop(v.b, t + v.row * gap + v.sx * SWEEP));
      return;
    }
    const L = build(k);
    L.reset(t); L.group.position.y = y; L.group.visible = true;
    top = L.group; active = L;
  }
  function stepLayers(t: number) {
    uTime.value = t;
    built.forEach((L) => { if (L.group.visible) L.tick?.(t); });
    if (active && t > active.end) { const g = active.group; active = null; settle(g); }
    if (lowering) {
      const k = Math.min(1, (t - lowering.t0) / 0.6);
      lowering.g.position.y = lowering.y0 * (1 - k * k * (3 - 2 * k));
      if (k >= 1) lowering = null;
    }
    // shader warm-up: show freshly built (collapsed) surfaces for one frame so their programs compile now, not on tap
    warming.forEach((g) => { if (g !== top) g.visible = false; }); warming = [];
    while (warm.length) { const g = warm.pop()!; if (!g.visible) { g.visible = true; warming.push(g); } }
  }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const onPtr = (e: PointerEvent) => {
    if (kind !== 'block' || (e.target as HTMLElement)?.closest?.('[data-nopour],a,button,input,select,label')) return;
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    if (!ray.ray.intersectPlane(plane, hitP)) return;
    const t = now(); let n = 0;
    for (const b of list) {
      if (b.state !== 0) continue;
      const d = Math.hypot((b.x - hitP.x) / 0.9, (b.z - hitP.z) / 0.6);
      if (d < 1) { drop(b, t + d * 0.15 + n * 0.004); n++; }
    }
    if (n && !first) { first = true; opts.onFirst?.(); }
  };
  host.addEventListener('pointermove', onPtr, { passive: true });
  host.addEventListener('pointerdown', onPtr, { passive: true });

  const clock = new THREE.Timer();
  const now = () => clock.getElapsed();
  let raf = 0, visible = true, frozen = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { threshold: 0 });
  io.observe(host);
  const lost = (e: Event) => { e.preventDefault(); opts.onLost?.(); };
  cv.addEventListener('webglcontextlost', lost);

  function loop() {
    raf = 0; clock.update();
    if (dead || !visible) return;
    const t = now();
    if (!frozen) {
      stepLayers(t);
      let dirty = false;
      for (const b of falling) {
        const k = (t - b.t0) / b.dur;
        if (k < 0) continue;
        dirty = true;
        if (k >= 1) {
          const a = t - b.t0 - b.dur;
          const y = TH / 2 + Math.max(0, Math.sin(a * 30) * 0.02 * Math.exp(-a * 16));
          const r = Math.exp(-a * 20);
          setM(b, y, b.rx * 0.05 * r, 0, b.rz * 0.05 * r);
          if (!b.hit) landed(b, t);
          if (a > 0.3) { setM(b, TH / 2); b.state = 2; falling.delete(b); }
          continue;
        }
        const e = k * k, sw = (1 - k) * (1 - k);
        setM(b, TH / 2, b.rx * sw, b.ry * sw, b.rz * sw, true, b.h * (1 - e));
      }
      if (dirty) mesh.instanceMatrix.needsUpdate = true;
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i], k = (t - p.t0) / 0.9;
        if (k >= 1) { scene.remove(p.s); p.s.material.dispose(); puffs.splice(i, 1); continue; }
        p.s.position.x += p.vx * 0.012; p.s.position.z += p.vz * 0.012; p.s.position.y = 0.05 + k * 0.16;
        p.s.scale.setScalar(0.2 + k * 0.6); p.s.material.opacity = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 0.45;
      }
      leaves.position.x = -2.4 + Math.sin(t * 0.45) * 0.12 + Math.sin(t * 1.3) * 0.03;
      leaves.position.z = -1.2 + Math.cos(t * 0.37) * 0.08;
      cam.position.x += (Math.sin(t * 0.12) * 0.06 + (portrait ? 0.4 : 0.7) - cam.position.x) * 0.02;
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
      (built.get('resin') as any)?.recolour?.();
    },
    destroy() {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      built.forEach((L) => L.dispose());
      host.removeEventListener('pointermove', onPtr); host.removeEventListener('pointerdown', onPtr);
      cv.removeEventListener('webglcontextlost', lost);
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mm = m.material as THREE.Material | THREE.Material[] | undefined; (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((x) => x.dispose()); });
      [gMap, gNor, sMap, sNor, env, dustTex, leafTex].forEach((x) => x.dispose());
      pm.dispose(); renderer.dispose();
    },
  };
  return api;
}
export type BrickApi = NonNullable<ReturnType<typeof initBricks>>;
