// "From the ground up": a real-time 3D UK back garden that is built in front of you.
// One engine, two uses:
//   hero  — setBuild(b) scrubs the whole job: sloped boggy plot -> dig & levels -> retaining wall + steps ->
//           MOT sub-base -> porcelain laid slab by slab -> turf -> new fence, planting, golden-hour light.
//   studio — the finished garden; set(zone, value) re-skins the patio / lawn / boundary / extras with a wipe.
// Vanilla three.js, CC0 Poly Haven textures (see CREDITS.md). Renders only while on screen.
import * as THREE from 'three';
import { asset } from './base';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Patio = 'porcelain' | 'stone' | 'block' | 'resin';
export type Lawn = 'turf' | 'artificial';
export type Boundary = 'featheredge' | 'composite' | 'living';
export type Opts = { mode: 'hero' | 'studio'; onReady?: () => void; lite?: boolean };
export type GardenApi = {
  setBuild: (b: number) => void;
  setPatio: (k: Patio, tone: number) => void;
  setLawn: (k: Lawn) => void;
  setBoundary: (k: Boundary) => void;
  setExtra: (k: 'lighting' | 'steps' | 'beds', on: boolean) => void;
  setPointer: (x: number, y: number) => void;
  orbit: (dx: number) => void;
  renderOnce: () => void;
  destroy: () => void;
};

export const TONES: Record<Patio, { name: string; c: string }[]> = {
  porcelain: [{ name: 'Light grey', c: '#e9e7e2' }, { name: 'Warm sand', c: '#eadcc2' }, { name: 'Charcoal', c: '#6b6e70' }],
  stone: [{ name: 'Buff sandstone', c: '#e6cfa6' }, { name: 'Autumn brown', c: '#c99a76' }, { name: 'Raj green', c: '#b6b49e' }],
  block: [{ name: 'Charcoal', c: '#5a5b5d' }, { name: 'Brindle', c: '#b07c63' }, { name: 'Silver grey', c: '#c3c2bd' }],
  resin: [{ name: 'Golden quartz', c: '#d9c49a' }, { name: 'Silver grey', c: '#c9c7c1' }, { name: 'Bronze', c: '#a68566' }],
};

// ---------- layout (metres). Patio top y=0, lawn level +0.90, house behind the camera at z≈+4.5
const XL = -4.6, XR = 4.6;
const ZP0 = 4.2, ZW = -0.62;          // patio runs from the house (z=4.2) back to the wall face
const WALL_T = 0.22, ZWB = ZW - WALL_T; // wall back face
const ZF = -7.1;                      // back fence line
const LAWN_Y = 0.9, DIG_Y = -0.2;
const SW = 0.9, SD = 0.6, JT = 0.008, TH = 0.03;
const STEP_X = 0.95;                  // steps: x in [-STEP_X, STEP_X]

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (b: number, a: number, z: number) => clamp((b - a) / (z - a));
const eOut = (t: number) => 1 - Math.pow(1 - t, 3);
const eInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eBack = (t: number) => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const smooth = (t: number) => t * t * (3 - 2 * t);

// the original, sloping ground
function h0(x: number, z: number) {
  const t = clamp((ZP0 + 0.3 - z) / 11.6);
  return -0.04 + 1.08 * smooth(t) + 0.05 * Math.sin(x * 1.3 + z * 0.7) * Math.cos(z * 1.1 - x * 0.4) + 0.03 * Math.sin(x * 3.1 - z * 2.3)
    - 0.07 * Math.exp(-((x + 1.8) ** 2 + (z - 2.2) ** 2) / 1.4); // a boggy dip near the house
}

export function initGarden(canvas: HTMLCanvasElement, host: HTMLElement, opts: Opts): GardenApi | null {
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false }); } catch { return null; }
  const coarse = matchMedia('(pointer:coarse)').matches || innerWidth < 760;
  const lite = !!opts.lite || coarse;
  const studio = opts.mode === 'studio';
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  if (import.meta.env.DEV) (window as any)["__" + opts.mode] = { scene, renderer, cam };
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  // ---------- textures
  let pending = 0, readyFired = false;
  const tl = new THREE.TextureLoader();
  const S = lite ? 512 : 1024;
  const done = () => { if (--pending === 0 && !readyFired) { readyFired = true; need = true; opts.onReady?.(); } };
  const tex = (name: string, srgb = true, rep: [number, number] = [1, 1]) => {
    pending++;
    const t = tl.load(asset('/tex/' + name), () => { need = true; done(); }, undefined, done);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
    t.anisotropy = Math.min(lite ? 4 : 8, renderer.capabilities.getMaxAnisotropy());
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return track(t);
  };
  const pair = (k: string, rep: [number, number]) => ({ map: tex(`${k}-${S}.webp`, true, rep), normalMap: tex(`${k}-n-${S}.jpg`, false, rep) });

  // ---------- sky dome + light
  const skyU = { uTop: { value: new THREE.Color('#9fb3c6') }, uHor: { value: new THREE.Color('#e6e3da') }, uSun: { value: new THREE.Color('#ffd9a0') }, uSunDir: { value: new THREE.Vector3(-0.5, 0.3, -0.8).normalize() }, uGlow: { value: 0.3 } };
  const sky = new THREE.Mesh(track(new THREE.SphereGeometry(80, 32, 16)), track(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform vec3 uTop,uHor,uSun,uSunDir; uniform float uGlow; varying vec3 vP;
      void main(){ float h = clamp(vP.y*1.6+0.08,0.,1.); vec3 c = mix(uHor,uTop,pow(h,.7));
        float s = max(dot(normalize(vP),normalize(uSunDir)),0.); c += uSun*(pow(s,8.)*.55+pow(s,64.)*1.2)*uGlow;
        gl_FragColor = vec4(c,1.);
        #include <colorspace_fragment>
      }`,
  })));
  scene.add(sky);
  scene.fog = new THREE.Fog('#dfe0da', 16, 42);

  const hemi = new THREE.HemisphereLight('#dfe7ee', '#4a4336', 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff4e2', 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target); sun.target.position.set(0, 0, -1.5);

  // ---------- terrain: two morphing patches (lower = patio dig, upper = lawn level) sharing one seam at the wall line
  const mkPatch = (z0: number, z1: number, nz: number) => {
    const g = new THREE.PlaneGeometry(XR - XL + 1.4, z0 - z1, lite ? 36 : 64, nz);
    g.rotateX(-Math.PI / 2); g.translate(0, 0, (z0 + z1) / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const base = Float32Array.from(p.array as Float32Array);
    return track(Object.assign(g, { userData: { base } }));
  };
  const loGeo = mkPatch(ZP0 + 5, ZW - 0.12, lite ? 26 : 48), hiGeo = mkPatch(ZW - 0.12, ZF - 0.6, lite ? 30 : 56);
  const grassOld = pair('sparse_grass', [5, 5]), mud = pair('brown_mud_leaves_01', [4, 4]), soilT = pair('forest_ground_04', [4, 4]);
  const tiredMat = track(new THREE.MeshStandardMaterial({ ...grassOld, roughness: 1, color: '#d6e2a8' }));
  const mudMat = track(new THREE.MeshStandardMaterial({ ...mud, roughness: 1, color: '#e8dccb', transparent: true, opacity: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, depthWrite: false }));
  const soilMat = track(new THREE.MeshStandardMaterial({ ...soilT, roughness: 1, color: '#efe4d6', transparent: true, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false }));
  // mud only in patches: alpha from a soft blotch texture
  mudMat.alphaMap = track(canvasTex(256, 256, (g, r) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) { const x = r() * 256, y = r() * 256, rad = 16 + r() * 48; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  }, 3));
  const terr = new THREE.Group(); scene.add(terr);
  for (const g of [loGeo, hiGeo]) {
    const a = new THREE.Mesh(g, tiredMat); a.receiveShadow = true;
    const b = new THREE.Mesh(g, mudMat); b.receiveShadow = true; b.renderOrder = 1;
    const c = new THREE.Mesh(g, soilMat); c.receiveShadow = true; c.renderOrder = 2;
    terr.add(a, b, c);
  }
  const morph = (g: THREE.BufferGeometry, target: (x: number, z: number) => number, t: number) => {
    const p = g.attributes.position as THREE.BufferAttribute, base = g.userData.base as Float32Array;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], z = base[i * 3 + 2];
      const a = h0(x, z), b = target(x, z);
      // dig front moves from the house towards the fence
      const local = clamp(t * 1.5 - clamp((ZP0 - z) / 12) * 0.5);
      p.setY(i, a + (b - a) * eInOut(local));
    }
    p.needsUpdate = true; g.computeVertexNormals();
  };
  // outside the garden (beyond the fences) the ground keeps its old shape
  const inside = (x: number) => x > XL - 0.05 && x < XR + 0.05;
  const loTarget = (x: number, z: number) => (inside(x) ? DIG_Y : h0(x, z));
  const hiTarget = (x: number, z: number) => (inside(x) && z > ZF ? LAWN_Y - 0.02 : h0(x, z));

  // neighbouring ground strip beyond the back fence + soft tree line
  const beyond = new THREE.Mesh(track(new THREE.PlaneGeometry(60, 30)), track(new THREE.MeshStandardMaterial({ color: '#8f9c72', roughness: 1 })));
  beyond.rotation.x = -Math.PI / 2; beyond.position.set(0, 1.0, ZF - 15.5); beyond.receiveShadow = true; scene.add(beyond);
  const treeMat = track(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: false }));
  const treeGeo = track(blobGeo(1, 3, 0.28, 11));
  const trees = new THREE.InstancedMesh(treeGeo, treeMat, 26); trees.castShadow = false; trees.receiveShadow = true;
  { const r = rng(21), m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < 26; i++) {
      const x = -15 + i * 1.25 + (r() - 0.5) * 1.2, s = 1.6 + r() * 2.2, z = ZF - 3.5 - r() * 5;
      m.compose(new THREE.Vector3(x, 1.2 + s * 0.8, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6, 0)), new THREE.Vector3(s * 1.1, s * 1.25, s));
      trees.setMatrixAt(i, m); trees.setColorAt(i, c.set(['#7a9161', '#8a9a6a', '#6f875a', '#97a476'][i % 4]));
    } }
  scene.add(trees);
  // a sliver of house wall + window reveal on the right, so the garden reads as a real back garden
  const brick = track(canvasTex(512, 512, (g, r) => {
    g.fillStyle = '#b9a58c'; g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 16) for (let x = (y / 16) % 2 ? -24 : 0; x < 512; x += 48) {
      const v = 0.9 + r() * 0.2; g.fillStyle = `rgb(${(196 * v) | 0},${(160 * v) | 0},${(122 * v) | 0})`; g.fillRect(x + 1, y + 1, 46, 14);
    }
  }, 9, [3, 3]));
  const house = new THREE.Mesh(track(new THREE.BoxGeometry(0.4, 6, 6)), track(new THREE.MeshStandardMaterial({ map: brick, roughness: 0.95 })));
  house.position.set(XR + 0.9, 3, ZP0 + 2.2); house.castShadow = true; house.receiveShadow = true; scene.add(house);

  // ---------- old garden bits that disappear in the dig: cracked slabs + a sagging lap fence
  const oldSlabMat = track(new THREE.MeshStandardMaterial({ color: '#c9c5bb', roughness: 1, map: tex(`sandy_gravel-${S}.webp`, true, [0.6, 0.6]), transparent: true }));
  const oldSlabs: THREE.Mesh[] = [];
  { const r = rng(4); for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(track(new THREE.BoxGeometry(0.6, 0.05, 0.6)), oldSlabMat);
      const x = -2.6 + (i % 4) * 0.66 + (r() - 0.5) * 0.1, z = 3.6 - Math.floor(i / 4) * 0.66;
      m.position.set(x, h0(x, z) + 0.015, z); m.rotation.set((r() - 0.5) * 0.12, (r() - 0.5) * 0.2, (r() - 0.5) * 0.1);
      m.castShadow = true; m.receiveShadow = true; m.userData.y = m.position.y; oldSlabs.push(m); scene.add(m);
    } }

  // ---------- survey pegs + string line on the wall line (site-plan moment)
  const pegs = new THREE.Group(); scene.add(pegs);
  { const pm = track(new THREE.MeshStandardMaterial({ color: '#c9a36c', roughness: 0.8 })), sm = track(new THREE.MeshBasicMaterial({ color: '#ff6a2b' }));
    for (const x of [XL + 0.2, -STEP_X, STEP_X, XR - 0.2]) { const p = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 1.2, 0.04)), pm); p.position.set(x, 0.4, ZW + 0.06); p.castShadow = true; pegs.add(p); }
    const line = new THREE.Mesh(track(new THREE.BoxGeometry(XR - XL - 0.4, 0.008, 0.008)), sm); line.position.set(0, LAWN_Y, ZW + 0.06); pegs.add(line);
    const line2 = line.clone(); line2.position.y = 0.02; pegs.add(line2); }

  // ---------- retaining wall + steps: buff blocks laid course by course
  const blockTex = tex(`sandy_gravel-${S}.webp`, true, [0.35, 0.18]);
  const blockN = tex(`sandy_gravel-n-${S}.jpg`, false, [0.35, 0.18]);
  const blockMat = track(new THREE.MeshStandardMaterial({ map: blockTex, normalMap: blockN, normalScale: new THREE.Vector2(0.6, 0.6), color: '#e8d5ac', roughness: 0.92 }));
  const BL = 0.44, BH = 0.215;
  type Blk = { x: number; y: number; z: number; w: number; h: number; d: number; t: number; mid: boolean };
  const blks: Blk[] = [];
  for (let c = 0; c < 4; c++) {
    const off = c % 2 ? BL / 2 : 0;
    for (const side of [-1, 1]) {
      const a = side < 0 ? XL : STEP_X, b = side < 0 ? -STEP_X : XR;
      for (let x = a - off; x < b - 0.01; x += BL) {
        const x0 = Math.max(a, x), x1 = Math.min(b, x + BL);
        if (x1 - x0 < 0.06) continue;
        blks.push({ x: (x0 + x1) / 2, y: c * BH + BH / 2, z: ZW - WALL_T / 2, w: x1 - x0 - 0.008, h: BH - 0.008, d: WALL_T, t: c / 4 + (side < 0 ? (b - x1) : (x0 - a)) / 3.7 * 0.22, mid: false });
      }
    }
    // the infill where the steps go, only used when steps are switched off
    for (let x = -STEP_X - off; x < STEP_X - 0.01; x += BL) {
      const x0 = Math.max(-STEP_X, x), x1 = Math.min(STEP_X, x + BL); if (x1 - x0 < 0.06) continue;
      blks.push({ x: (x0 + x1) / 2, y: c * BH + BH / 2, z: ZW - WALL_T / 2, w: x1 - x0 - 0.008, h: BH - 0.008, d: WALL_T, t: c / 4, mid: true });
    }
  }
  const blkGeo = track(new RoundedBoxGeometry(1, 1, 1, 2, 0.012));
  const wallIM = new THREE.InstancedMesh(blkGeo, blockMat, blks.length); wallIM.castShadow = true; wallIM.receiveShadow = true;
  { const r = rng(8), c = new THREE.Color(); blks.forEach((_, i) => wallIM.setColorAt(i, c.setScalar(0.9 + r() * 0.12))); }
  scene.add(wallIM);
  // coping
  const copeMat = track(new THREE.MeshStandardMaterial({ map: blockTex, color: '#efe2c3', roughness: 0.85 }));
  const copes: Blk[] = [];
  for (const [a, b] of [[XL, -STEP_X], [STEP_X, XR]] as const) for (let x = a; x < b - 0.01; x += 0.6) { const x1 = Math.min(b, x + 0.6); copes.push({ x: (x + x1) / 2, y: 4 * BH + 0.025, z: ZW - WALL_T / 2 + 0.03, w: x1 - x - 0.006, h: 0.05, d: WALL_T + 0.08, t: (x - XL) / 9.2, mid: false }); }
  for (let x = -STEP_X; x < STEP_X - 0.01; x += 0.6) { const x1 = Math.min(STEP_X, x + 0.6); copes.push({ x: (x + x1) / 2, y: 4 * BH + 0.025, z: ZW - WALL_T / 2 + 0.03, w: x1 - x - 0.006, h: 0.05, d: WALL_T + 0.08, t: 0.5, mid: true }); }
  const copeIM = new THREE.InstancedMesh(blkGeo, copeMat, copes.length); copeIM.castShadow = true; copeIM.receiveShadow = true; scene.add(copeIM);
  // steps: three risers of 0.3 m
  const steps = new THREE.Group(); scene.add(steps);
  const stepBoxes: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const h = 0.3 * (i + 1), d = 0.36;
    const z1 = ZW + (3 - i) * d - 0.02;
    const m = new THREE.Mesh(track(new RoundedBoxGeometry(STEP_X * 2, h, z1 - ZWB, 2, 0.01)), blockMat);
    m.position.set(0, h / 2, (z1 + ZWB) / 2); m.castShadow = m.receiveShadow = true;
    const tread = new THREE.Mesh(track(new RoundedBoxGeometry(STEP_X * 2 + 0.06, 0.04, d + 0.04, 2, 0.01)), copeMat);
    tread.position.set(0, h + 0.02, z1 - d / 2 + 0.02); tread.castShadow = tread.receiveShadow = true;
    const g = new THREE.Group(); g.add(m, tread); g.userData.i = i; steps.add(g); stepBoxes.push(m);
  }

  // ---------- sub-base (MOT Type 1) and a mortar bed for the patio
  const subMat = track(new THREE.MeshStandardMaterial({ ...pair('gravel_ground_01', [4, 2.2]), color: '#b9b4aa', roughness: 1, transparent: true }));
  const sub = new THREE.Mesh(track(new THREE.BoxGeometry(XR - XL, -DIG_Y - TH - 0.035, ZP0 - ZW)), subMat);
  sub.position.set(0, (DIG_Y + (-TH - 0.035)) / 2, (ZP0 + ZW) / 2); sub.receiveShadow = true; sub.castShadow = true; scene.add(sub);
  const bedMat = track(new THREE.MeshStandardMaterial({ ...pair('sandy_gravel', [5, 3]), color: '#d6d0c4', roughness: 1, transparent: true }));
  const bed = new THREE.Mesh(track(new THREE.BoxGeometry(XR - XL, 0.035, ZP0 - ZW)), bedMat);
  bed.position.set(0, -TH - 0.0175, (ZP0 + ZW) / 2); bed.receiveShadow = true; scene.add(bed);

  // ---------- patio surfaces
  const clipOut = new THREE.Plane(new THREE.Vector3(1, 0, 0), 99);  // keeps x > -constant
  const clipIn = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 99);  // keeps x < constant
  type Surface = { group: THREE.Group; mats: THREE.MeshStandardMaterial[]; tint: (c: THREE.Color) => void };
  const surfaces = {} as Record<Patio, Surface>;
  // slab grid (porcelain + stone) — instanced, a few texture-offset variants so neighbours differ
  const slabCells: { x: number; z: number; row: number; col: number; v: number; o: number }[] = [];
  { const cols = Math.round((XR - XL) / SW), rows = Math.ceil((ZP0 - ZW) / SD), r = rng(12);
    for (let rI = 0; rI < rows; rI++) for (let c = 0; c < cols; c++) {
      const z = ZW + rI * SD + SD / 2; if (z - SD / 2 > ZP0) continue;
      const x = XL + c * SW + SW / 2;
      // laid from the steps outwards, row by row towards the house
      slabCells.push({ x, z, row: rI, col: c, v: Math.floor(r() * 4), o: rI / rows * 0.75 + Math.abs(x) / 4.6 * 0.2 + r() * 0.05 });
    } }
  const slabGeo = track(new RoundedBoxGeometry(SW - JT, TH, SD - JT, 2, 0.004));
  const mkSlabSurface = (mapName: string, nName: string, rough: number, nScale: number): Surface => {
    const group = new THREE.Group(), mats: THREE.MeshStandardMaterial[] = [];
    const map = tex(mapName, true), nor = tex(nName, false);
    for (let v = 0; v < 4; v++) {
      const m = map.clone(), n = nor.clone();
      for (const t of [m, n]) { t.repeat.set(SW / 2.6, SD / 2.6); t.offset.set((v * 0.37) % 1, (v * 0.61) % 1); t.needsUpdate = true; track(t); }
      const mat = track(new THREE.MeshPhysicalMaterial({ map: m, normalMap: n, normalScale: new THREE.Vector2(nScale, nScale), roughness: rough, clearcoat: rough < 0.6 ? 0.3 : 0, clearcoatRoughness: 0.35, color: '#ffffff' }));
      mats.push(mat);
      const cells = slabCells.filter((c) => c.v === v);
      const im = new THREE.InstancedMesh(slabGeo, mat, cells.length); im.castShadow = true; im.receiveShadow = true;
      im.userData.cells = cells; group.add(im);
    }
    return { group, mats, tint: (c) => mats.forEach((m) => m.color.copy(c)) };
  };
  surfaces.porcelain = mkSlabSurface('porcelain-g.webp', 'slab-n-v1.jpg', 0.42, 0.45);
  surfaces.stone = mkSlabSurface(`red_sandstone_pavement-g-${S}.webp`, `red_sandstone_pavement-n-${S}.jpg`, 0.9, 1.4);
  const mkPlane = (map: THREE.Texture, nor: THREE.Texture | null, rough: number, border: boolean): Surface => {
    const group = new THREE.Group();
    const mat = track(new THREE.MeshStandardMaterial({ map, normalMap: nor ?? undefined, roughness: rough }));
    const w = XR - XL, d = ZP0 - ZW;
    const top = new THREE.Mesh(track(new THREE.BoxGeometry(w - (border ? 0.4 : 0), TH, d - (border ? 0.2 : 0))), mat);
    top.position.set(0, -TH / 2, (ZP0 + ZW) / 2 + (border ? 0.1 : 0)); top.receiveShadow = true; group.add(top);
    const mats = [mat];
    if (border) {
      const bm = track(new THREE.MeshStandardMaterial({ color: '#3b3c3e', roughness: 0.85, map: tex(`herringbone_pavement_03-g-${S}.webp`, true, [0.2, 4]) }));
      for (const [x, z, bw, bd] of [[XL + 0.1, (ZP0 + ZW) / 2, 0.2, d], [XR - 0.1, (ZP0 + ZW) / 2, 0.2, d], [0, ZW + 0.1, w, 0.2]] as const) {
        const b = new THREE.Mesh(track(new THREE.BoxGeometry(bw, TH, bd)), bm); b.position.set(x, -TH / 2, z); b.receiveShadow = true; group.add(b);
      }
      mats.push(bm);
    }
    return { group, mats, tint: (c) => mat.color.copy(c) };
  };
  surfaces.block = mkPlane(tex(`herringbone_pavement_03-g-${S}.webp`, true, [4.2, 2.2]), tex(`herringbone_pavement_03-n-${S}.jpg`, false, [4.2, 2.2]), 0.86, true);
  const resinTex = track(canvasTex(512, 512, (g, r) => {
    g.fillStyle = '#c9c4ba'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26000; i++) { const v = 0.55 + r() * 0.75; g.fillStyle = `rgba(${(255 * v) | 0},${(248 * v) | 0},${(236 * v) | 0},${0.55 + r() * 0.45})`; const s = 0.8 + r() * 2.2; g.beginPath(); g.ellipse(r() * 512, r() * 512, s, s * (0.6 + r() * 0.5), r() * 3, 0, 7); g.fill(); }
  }, 17, [9, 5]));
  surfaces.resin = mkPlane(resinTex, null, 0.62, false);
  for (const k of Object.keys(surfaces) as Patio[]) { surfaces[k].group.visible = false; scene.add(surfaces[k].group); }
  let patio: Patio = 'porcelain', patioTone = 0;
  const tintOf = (k: Patio, i: number) => new THREE.Color(TONES[k][i].c).convertSRGBToLinear().multiplyScalar(k === 'porcelain' ? 1.0 : 1.15);
  (Object.keys(surfaces) as Patio[]).forEach((k) => surfaces[k].tint(tintOf(k, 0)));
  surfaces.porcelain.group.visible = true;

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), e3 = new THREE.Euler();
  const placeSlabs = (surf: Surface, t: number) => {
    for (const im of surf.group.children as THREE.InstancedMesh[]) {
      const cells = im.userData.cells as typeof slabCells;
      cells.forEach((c, i) => {
        const k = clamp((t * 1.35 - c.o) / 0.32);
        const lift = 1 - eOut(k);
        v3.set(c.x, -TH / 2 + lift * 1.6, c.z + lift * 0.3);
        e3.set(lift * 0.35, 0, lift * (c.col % 2 ? 0.12 : -0.12)); q.setFromEuler(e3);
        const sc = k <= 0 ? 0.0001 : 1; s3.set(sc, sc, sc);
        m4.compose(v3, q, s3); im.setMatrixAt(i, m4);
      });
      im.instanceMatrix.needsUpdate = true;
    }
  };

  // ---------- lawn: base turf plane + instanced blades (wind, growth, stripes, real/artificial wipe)
  const LZ0 = ZWB - 0.02, LZ1 = ZF + 0.85;      // lawn runs from behind the wall to the back bed
  const turfMap = pair('leafy_grass', [6, 4]);
  const turfMat = track(new THREE.MeshStandardMaterial({ ...turfMap, color: '#b4d17f', roughness: 1 }));
  const turfGeo = track(new THREE.PlaneGeometry(XR - XL, LZ0 - LZ1, 1, 1)); turfGeo.rotateX(-Math.PI / 2);
  const turf = new THREE.Mesh(turfGeo, turfMat); turf.position.set(0, LAWN_Y + 0.005, (LZ0 + LZ1) / 2); turf.receiveShadow = true;
  const turfClip = new THREE.Plane(new THREE.Vector3(0, 0, 1), -99);
  turfMat.clippingPlanes = [turfClip];
  scene.add(turf);
  const roll = new THREE.Mesh(track(new THREE.CylinderGeometry(0.12, 0.12, XR - XL, 20)), track(new THREE.MeshStandardMaterial({ ...turfMap, color: '#a2bf72', roughness: 1 })));
  roll.rotation.z = Math.PI / 2; roll.castShadow = true; scene.add(roll);

  const grassU = {
    uTime: { value: 0 }, uGrow: { value: 0 }, uWipe: { value: -99 }, uA: { value: 0 }, uB: { value: 0 },
    uSunDir: { value: new THREE.Vector3() }, uSunCol: { value: new THREE.Color() }, uSky: { value: new THREE.Color() }, uGround: { value: new THREE.Color() },
    fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 100 }, uWind: { value: 1 },
  };
  const blades = mkBlades(lite ? 26000 : 72000, XL + 0.05, XR - 0.05, LZ1 + 0.05, LZ0 - 0.05, LAWN_Y, grassU, 0.09);
  track(blades.geometry); track(blades.material as THREE.Material); scene.add(blades);

  // ---------- back bed, planting, planters
  const mulch = new THREE.Mesh(track(new THREE.BoxGeometry(XR - XL, 0.06, LZ1 - ZF)), track(new THREE.MeshStandardMaterial({ ...pair('wood_chip_path', [5, 0.5]), color: '#d9c3ac', roughness: 1 })));
  mulch.position.set(0, LAWN_Y, (LZ1 + ZF) / 2); mulch.receiveShadow = true; scene.add(mulch);
  const bedEdge = new THREE.Mesh(track(new THREE.BoxGeometry(XR - XL, 0.08, 0.04)), track(new THREE.MeshStandardMaterial({ color: '#4a4c4e', roughness: 0.6, metalness: 0.4 })));
  bedEdge.position.set(0, LAWN_Y + 0.02, LZ1); scene.add(bedEdge);
  const plants = new THREE.Group(); scene.add(plants);
  const boxMat = track(new THREE.MeshStandardMaterial({ color: '#a9c48f', roughness: 0.95, map: track(canvasTex(256, 256, leafDraw, 31, [2, 2])) }));
  const boxGeo = track(blobGeo(0.5, 3, 0.12, 5));
  type P = { m: THREE.Object3D; t: number; s: number };
  const plantList: P[] = [];
  { const r = rng(44);
    for (let i = 0; i < 9; i++) {
      const x = XL + 0.6 + i * ((XR - XL - 1.2) / 8) + (r() - 0.5) * 0.2, s = 0.42 + r() * 0.22;
      const m = new THREE.Mesh(boxGeo, boxMat); m.position.set(x, LAWN_Y + s * 0.42, ZF + 0.42); m.castShadow = true; m.receiveShadow = true;
      plants.add(m); plantList.push({ m, t: i / 9, s });
    }
    // two big planters with box balls either side of the steps
    const potMat = track(new THREE.MeshStandardMaterial({ color: '#3a3b3c', roughness: 0.7 }));
    for (const sx of [-1, 1]) {
      const pot = new THREE.Mesh(track(new RoundedBoxGeometry(0.6, 0.6, 0.6, 3, 0.03)), potMat); pot.position.set(sx * (STEP_X + 0.75), 0.3, ZW + 0.6); pot.castShadow = pot.receiveShadow = true;
      const ball = new THREE.Mesh(boxGeo, boxMat); ball.position.set(0, 0.52, 0); ball.scale.setScalar(0.52); ball.castShadow = true; pot.add(ball);
      plants.add(pot); plantList.push({ m: pot, t: 0.5 + sx * 0.1, s: 1 });
    } }
  // ornamental grasses + lavender in the back bed: tall blade clumps on the same shader
  const tallU = { ...grassU, uGrow: { value: 0 }, uWipe: { value: -99 }, uA: { value: 2 }, uB: { value: 2 } };
  const tall = mkClumps(lite ? 2600 : 6000, XL + 0.3, XR - 0.3, ZF + 0.15, LZ1 - 0.12, LAWN_Y + 0.03, tallU);
  track(tall.geometry); track(tall.material as THREE.Material); scene.add(tall);

  // raised beds (extra)
  const raised = new THREE.Group(); scene.add(raised);
  { const sl = track(new THREE.MeshStandardMaterial({ ...pair('weathered_planks', [1, 0.3]), color: '#e0c9ae', roughness: 0.95 }));
    const soil = track(new THREE.MeshStandardMaterial({ ...soilT, color: '#c6b29c', roughness: 1 }));
    for (const sx of [-1, 1]) {
      const g = new THREE.Group();
      const box = new THREE.Mesh(track(new THREE.BoxGeometry(2.0, 0.45, 0.9)), sl); box.position.y = 0.225; box.castShadow = box.receiveShadow = true;
      const top = new THREE.Mesh(track(new THREE.BoxGeometry(1.86, 0.02, 0.76)), soil); top.position.y = 0.44;
      g.add(box, top);
      for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(boxGeo, boxMat); b.scale.setScalar(0.28 + (i % 2) * 0.06); b.position.set(-0.7 + i * 0.47, 0.56, (i % 2) * 0.12 - 0.06); b.castShadow = true; g.add(b); }
      g.position.set(sx * 2.9, LAWN_Y, ZF + 1.95); g.visible = false; raised.add(g);
    } }

  // ---------- fences: old lap panels (hero start) and the three new boundary styles
  const panelsAt: { x: number; z: number; ry: number; y: number; y0: number; w: number }[] = [];
  { const PW = 1.84;
    const n = Math.round((XR - XL) / PW); for (let i = 0; i < n; i++) { const x = XL + (i + 0.5) * ((XR - XL) / n); panelsAt.push({ x, z: ZF, ry: 0, y: LAWN_Y, y0: h0(x, ZF), w: (XR - XL) / n - 0.1 }); }
    for (const sx of [XL, XR]) { const len = ZP0 - ZF, m = Math.round(len / PW); for (let i = 0; i < m; i++) { const z = ZF + (i + 0.5) * (len / m); panelsAt.push({ x: sx, z, ry: Math.PI / 2, y: z < ZW - 0.1 ? LAWN_Y : DIG_Y + 0.2, y0: h0(sx, z), w: len / m - 0.1 }); } } }
  const FH = 1.8;
  const mkFence = (kind: 'old' | Boundary) => {
    const g = new THREE.Group();
    const r = rng(kind.length * 7);
    let face: THREE.Material, post: THREE.Material, base: THREE.Material | null = null;
    if (kind === 'old') { face = track(new THREE.MeshStandardMaterial({ ...pair('weathered_planks', [0.5, 1.4]), color: '#efe2d0', roughness: 1 })); post = face; }
    else if (kind === 'featheredge') {
      const p = pair('wood_planks', [0.4, 1]); p.map.rotation = p.normalMap.rotation = Math.PI / 2;
      face = track(new THREE.MeshStandardMaterial({ ...p, color: '#f5e2c8', roughness: 0.9 }));
      post = track(new THREE.MeshStandardMaterial({ color: '#b9b5ac', roughness: 0.95, map: tex(`sandy_gravel-${S}.webp`, true, [0.2, 1]) }));
      base = post;
    } else if (kind === 'composite') {
      face = track(new THREE.MeshStandardMaterial({ map: track(canvasTex(64, 256, (gc) => { for (let y = 0; y < 256; y += 16) { gc.fillStyle = '#4c4d4b'; gc.fillRect(0, y, 64, 15); gc.fillStyle = '#2b2c2b'; gc.fillRect(0, y + 15, 64, 1); } }, 5, [3, 1])), color: '#ffffff', roughness: 0.6 }));
      post = track(new THREE.MeshStandardMaterial({ color: '#2b2c2d', roughness: 0.4, metalness: 0.6 }));
    } else {
      face = track(new THREE.MeshStandardMaterial({ map: track(canvasTex(256, 256, leafDraw, 77, [2, 1.6])), color: '#c3d9a6', roughness: 1 }));
      post = track(new THREE.MeshStandardMaterial({ color: '#2b2c2d', roughness: 0.5, metalness: 0.4 }));
    }
    const faceGeo = track(new THREE.BoxGeometry(1, 1, kind === 'living' ? 0.16 : 0.05));
    const postGeo = track(new THREE.BoxGeometry(kind === 'composite' ? 0.07 : 0.1, 1, kind === 'composite' ? 0.07 : 0.1));
    panelsAt.forEach((p, i) => {
      const pg = new THREE.Group();
      const yb = kind === 'old' ? p.y0 : p.y;
      const gb = base ? 0.15 : 0, h = FH - gb;
      const f = new THREE.Mesh(faceGeo, face); f.scale.set(p.w, h, 1); f.position.set(0, gb + h / 2, 0); f.castShadow = f.receiveShadow = true; pg.add(f);
      if (base) { const b = new THREE.Mesh(faceGeo, base); b.scale.set(p.w, gb, 1.1); b.position.y = gb / 2; b.castShadow = b.receiveShadow = true; pg.add(b); }
      const ps = new THREE.Mesh(postGeo, post); ps.scale.y = FH + 0.05; ps.position.set(p.w / 2 + 0.05, (FH + 0.05) / 2, 0); ps.castShadow = true; pg.add(ps);
      if (i === 0 || (p.ry !== panelsAt[i - 1].ry) || (p.ry && p.x !== panelsAt[i - 1].x)) { const ps2 = ps.clone(); ps2.position.x = -p.w / 2 - 0.05; pg.add(ps2); }
      // drop down to the lower level along the side of the patio
      if (kind !== 'old' && p.y < 0.5) { f.scale.y = h + 0.2; f.position.y -= 0.1; }
      pg.position.set(p.x + (p.ry ? (p.x < 0 ? -0.05 : 0.05) : 0), yb, p.z + (p.ry ? 0 : -0.05));
      pg.rotation.y = p.ry;
      if (kind === 'old') { pg.rotation.z = (r() - 0.5) * 0.06; pg.rotation.x = (r() - 0.5) * 0.05; }
      pg.userData = { y: yb, d: Math.hypot(p.x - 3, p.z - 6), i };
      g.add(pg);
    });
    return g;
  };
  const fences = { old: mkFence('old'), featheredge: mkFence('featheredge'), composite: mkFence('composite'), living: mkFence('living') } as Record<'old' | Boundary, THREE.Group>;
  for (const k of Object.keys(fences) as (keyof typeof fences)[]) scene.add(fences[k]);
  let boundary: Boundary = 'featheredge', boundaryFrom: Boundary | null = null, boundaryT = 1;

  // ---------- lights (golden hour / dusk): LED strips under step noses, wall uplights, fence spots
  const glowTex = track(canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,150,1)'); gr.addColorStop(0.25, 'rgba(255,190,120,.45)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }, 1));
  const glowMat = track(new THREE.SpriteMaterial({ map: glowTex, color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  const ledMat = track(new THREE.MeshBasicMaterial({ color: '#ffcf8a', transparent: true, opacity: 0 }));
  const lightsG = new THREE.Group(); scene.add(lightsG);
  for (let i = 0; i < 3; i++) {
    const h = 0.3 * (i + 1), z1 = ZW + (3 - i) * 0.36 - 0.02;
    const led = new THREE.Mesh(track(new THREE.BoxGeometry(STEP_X * 2 - 0.1, 0.012, 0.01)), ledMat); led.position.set(0, h - 0.02, z1 + 0.025); lightsG.add(led);
  }
  const spots: THREE.Sprite[] = [];
  const addGlow = (x: number, y: number, z: number, s: number) => { const sp = new THREE.Sprite(glowMat); sp.position.set(x, y, z); sp.scale.setScalar(s); lightsG.add(sp); spots.push(sp); };
  for (let x = XL + 0.7; x < XR; x += 1.5) if (Math.abs(x) > STEP_X + 0.3) addGlow(x, 0.08, ZW + 0.08, 0.9);
  for (let x = XL + 0.9; x < XR; x += 1.84) addGlow(x, LAWN_Y + 0.15, ZF + 0.12, 1.3);
  const pl1 = new THREE.PointLight('#ffbf7a', 0, 4.5, 1.6); pl1.position.set(0, 0.6, ZW + 1.1); lightsG.add(pl1);
  const pl2 = new THREE.PointLight('#ffbf7a', 0, 6, 1.6); pl2.position.set(0, LAWN_Y + 0.6, ZF + 0.5); lightsG.add(pl2);

  // dust motes in the low sun (idle motion)
  const motes = mkMotes(lite ? 120 : 260); track(motes.geometry); track(motes.material as THREE.Material); scene.add(motes);

  // ---------- state
  let build = studio ? 1 : 1, need = true, vis = false, raf = 0, w = 1, h = 1, t0 = performance.now(), last = 0;
  let lawnMode = 0, lawnFrom = 0, lawnT = 1, patioFrom: Patio | null = null, patioT = 1;
  let extras = { lighting: false, steps: true, beds: false }, lightT = 0, lightTarget = 0, stepsT = 1, bedsT = 0;
  let px = 0, py = 0, pxs = 0, pys = 0, az = 0, azS = 0;

  const resize = () => {
    w = host.clientWidth || 1; h = host.clientHeight || 1;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = cam.aspect < 0.8 ? 50 : cam.aspect < 1.2 ? 44 : 36; if (!studio && cam.aspect < 0.8) cam.setViewOffset(w, h, 0, h * 0.04, w, h); else cam.clearViewOffset(); cam.updateProjectionMatrix(); need = true;
  };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) loop(); }, { rootMargin: '120px' }); io.observe(host);

  // camera rigs
  const C = {
    fin: { p: new THREE.Vector3(2.4, 2.25, 8.3), l: new THREE.Vector3(-0.2, 0.55, -2.4) },
    top: { p: new THREE.Vector3(5.2, 6.4, 9.6), l: new THREE.Vector3(0, 0.1, -1.0) },
    end: { p: new THREE.Vector3(-1.6, 2.0, 8.0), l: new THREE.Vector3(0.3, 0.6, -2.6) },
    studio: { p: new THREE.Vector3(3.9, 4.7, 9.3), l: new THREE.Vector3(0, 0.35, -1.4) },
  };
  const cp = new THREE.Vector3(), cl = new THREE.Vector3();
  const skyOver = { top: new THREE.Color('#aab6c0'), hor: new THREE.Color('#dcdcd6') };
  const skyGold = { top: new THREE.Color('#7f9fc0'), hor: new THREE.Color('#f3dcb6') };
  const skyDusk = { top: new THREE.Color('#2f3c5a'), hor: new THREE.Color('#e7a979') };
  const sunOver = new THREE.Color('#f3f1ea'), sunGold = new THREE.Color('#ffc988'), sunDusk = new THREE.Color('#ff9a5c');
  const fogOver = new THREE.Color('#d9dad4'), fogGold = new THREE.Color('#e9dcc6'), fogDusk = new THREE.Color('#7c6d70');
  const tc = new THREE.Color(), tc2 = new THREE.Color();

  function apply(time: number) {
    const b = build;
    // phases
    const dig = seg(b, 0.04, 0.2), pegT = seg(b, 0.12, 0.2) * (1 - seg(b, 0.42, 0.5));
    const wallT = seg(b, 0.18, 0.36), stepT = seg(b, 0.3, 0.4);
    const subT = seg(b, 0.37, 0.45), bedT = seg(b, 0.44, 0.49), slabT = seg(b, 0.48, 0.67);
    const turfT = seg(b, 0.66, 0.78), growT = seg(b, 0.72, 0.86);
    const fenceT = seg(b, 0.78, 0.9), plantT = seg(b, 0.84, 0.96), goldT = studio ? 1 : seg(b, 0.82, 1);

    // ground
    morph(loGeo, loTarget, dig); morph(hiGeo, hiTarget, dig);
    mudMat.opacity = 1 - clamp(dig * 2);
    soilMat.opacity = clamp(dig * 1.6) * (1 - 0) ;
    tiredMat.color.set('#9aa079').lerp(tc.set('#86734f'), clamp(dig * 1.4));
    oldSlabs.forEach((m, i) => { const k = clamp(dig * 2.2 - i * 0.05); m.position.y = (m.userData.y as number) + eInOut(k) * 2.4; (m.material as THREE.MeshStandardMaterial).opacity = 1 - k; m.visible = k < 1; });
    pegs.visible = pegT > 0.001; pegs.scale.y = eOut(clamp(pegT * 3));

    // wall, built course by course (middle infill only when steps are off)
    const stepsOn = stepsT; // 1 = steps visible
    blks.forEach((k, i) => {
      let t = clamp((wallT * 1.25 - k.t) / 0.25);
      if (k.mid) t = Math.min(t, clamp((1 - stepsOn) * 1.4 - k.y));
      const lift = 1 - eOut(t);
      v3.set(k.x, k.y + lift * 1.2, k.z); q.identity(); s3.set(k.w, k.h, k.d).multiplyScalar(t <= 0 ? 0.0001 : 1);
      m4.compose(v3, q, s3); wallIM.setMatrixAt(i, m4);
    });
    wallIM.instanceMatrix.needsUpdate = true;
    copes.forEach((k, i) => {
      let t = clamp((wallT * 1.3 - 0.8 - k.t * 0.2) / 0.2);
      if (k.mid) t = Math.min(t, clamp((1 - stepsOn) * 2 - 1));
      v3.set(k.x, k.y + (1 - eOut(t)) * 0.8, k.z); s3.set(k.w, k.h, k.d).multiplyScalar(t <= 0 ? 0.0001 : 1); m4.compose(v3, q.identity(), s3); copeIM.setMatrixAt(i, m4);
    });
    copeIM.instanceMatrix.needsUpdate = true;
    steps.children.forEach((g) => { const i = g.userData.i as number; const t = Math.min(clamp(stepT * 1.6 - i * 0.3), stepsOn); g.position.y = (1 - eOut(t)) * -1.0; g.visible = t > 0.001; });

    // sub-base and bed drop in, with a little compaction bounce
    sub.visible = subT > 0; sub.position.y = (DIG_Y + (-TH - 0.035)) / 2 + (1 - eBack(subT)) * 1.5; subMat.opacity = clamp(subT * 4);
    bed.visible = bedT > 0; bed.position.y = -TH - 0.0175 + (1 - eOut(bedT)) * 0.6; bedMat.opacity = clamp(bedT * 4);

    // patio surface (hero: slabs laid; studio: whatever is chosen, wiping across)
    const activeP = surfaces[patio];
    (Object.keys(surfaces) as Patio[]).forEach((k) => { surfaces[k].group.visible = k === patio || k === patioFrom; });
    if (activeP.group.children[0] instanceof THREE.InstancedMesh) placeSlabs(activeP, studio ? (patioFrom ? 1 : 1) : slabT);
    else activeP.group.position.y = (1 - eOut(slabT)) * 0.8;
    if (patioFrom && surfaces[patioFrom].group.children[0] instanceof THREE.InstancedMesh) placeSlabs(surfaces[patioFrom], 1);
    if (!studio) activeP.group.visible = slabT > 0;

    // turf unrolls from the wall to the back bed; blades grow in after it
    const front = LZ0 + (LZ1 - LZ0) * eInOut(turfT);
    turfClip.normal.set(0, 0, 1); turfClip.constant = -front;      // keep z >= front
    turf.visible = turfT > 0.001;
    roll.visible = turfT > 0.001 && turfT < 0.999; roll.position.set(0, LAWN_Y + 0.12, front - 0.12); roll.rotation.x = -front * 3;
    grassU.uGrow.value = studio ? 1 : growT;
    blades.visible = growT > 0.001;

    // fences: old one comes down, new boundary rises panel by panel
    const fT = studio ? 1 : fenceT;
    fences.old.visible = fT < 0.999;
    fences.old.children.forEach((pg) => { const k = clamp(fT * 2 - (pg.userData.d as number) / 14); pg.position.y = (pg.userData.y as number) - eInOut(k) * 2.2; });
    (['featheredge', 'composite', 'living'] as Boundary[]).forEach((k) => {
      const grp = fences[k];
      let t = 0;
      if (k === boundary) t = Math.min(clamp(fT * 2 - 0.9), boundaryFrom ? boundaryT : 1);
      else if (k === boundaryFrom) t = 1 - boundaryT;
      grp.visible = t > 0.001;
      grp.children.forEach((pg) => { const d = (pg.userData.d as number) / 14; const kk = clamp(t * 1.6 - d * 0.6); pg.position.y = (pg.userData.y as number) - (1 - eOut(kk)) * (FH + 0.3); pg.visible = kk > 0.001; });
    });

    // planting pops in
    plantList.forEach((p) => { const k = clamp((plantT * 1.4 - p.t * 0.4) / 0.6); p.m.scale.setScalar((p.s === 1 ? 1 : p.s) * eBack(k) + 0.0001); p.m.visible = k > 0.001; });
    tallU.uGrow.value = studio ? 1 : plantT;
    tall.visible = plantT > 0.001 || studio;
    raised.children.forEach((g, i) => { const k = clamp(bedsT * 1.5 - i * 0.3); g.visible = k > 0.001; g.position.y = LAWN_Y - (1 - eOut(k)) * 0.5; g.scale.setScalar(0.6 + 0.4 * eOut(k)); });

    // light: overcast while it's a building site, golden hour when finished, dusk with the lights on (studio)
    const dusk = studio ? lightT * 0.5 : goldT * 0.1;
    const lamps = studio ? lightT : seg(b, 0.9, 1);
    tc.copy(skyOver.top).lerp(skyGold.top, goldT).lerp(skyDusk.top, dusk); skyU.uTop.value.copy(tc);
    tc.copy(skyOver.hor).lerp(skyGold.hor, goldT).lerp(skyDusk.hor, dusk); skyU.uHor.value.copy(tc);
    skyU.uGlow.value = 0.15 + goldT * 0.75;
    const sa = -0.5 + Math.sin(time * 0.00004) * 0.02;   // the sun drifts very slowly
    const elev = 0.62 - goldT * 0.34 - dusk * 0.18;
    sun.position.set(Math.sin(sa) * 14 - 7, Math.max(2.6, elev * 18), 5 + Math.cos(sa) * 2);
    skyU.uSunDir.value.copy(sun.position).normalize();
    sun.color.copy(sunOver).lerp(sunGold, goldT).lerp(sunDusk, dusk);
    sun.intensity = 1.5 + goldT * 1.9 - dusk * 1.6;
    hemi.intensity = 1.7 - goldT * 0.25 - dusk * 0.6;
    hemi.color.set('#dfe7ee').lerp(tc2.set('#c9d6e8'), goldT).lerp(tc2.set('#7d8aa8'), dusk);
    (scene.fog as THREE.Fog).color.copy(fogOver).lerp(fogGold, goldT).lerp(fogDusk, dusk);
    renderer.toneMappingExposure = 1.12 + goldT * 0.04 - dusk * 0.08;
    ledMat.opacity = lamps; glowMat.opacity = lamps * 0.85;
    pl1.intensity = lamps * 3.2; pl2.intensity = lamps * 2.4;
    spots.forEach((s, i) => s.scale.setScalar((i < 6 ? 0.9 : 1.3) * (0.96 + 0.04 * Math.sin(time * 0.003 + i))));
    (motes.material as THREE.PointsMaterial).opacity = goldT * 0.55;

    // grass shading uniforms follow the light
    grassU.uSunDir.value.copy(sun.position).normalize(); grassU.uSunCol.value.copy(sun.color).multiplyScalar(sun.intensity * 0.42);
    grassU.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity * 0.55); grassU.uGround.value.set('#3a3326').multiplyScalar(hemi.intensity * 0.5);
    grassU.fogColor.value.copy((scene.fog as THREE.Fog).color); grassU.fogNear.value = (scene.fog as THREE.Fog).near; grassU.fogFar.value = (scene.fog as THREE.Fog).far;
    grassU.uTime.value = time / 1000;
    grassU.uA.value = lawnFrom; grassU.uB.value = lawnMode; grassU.uWipe.value = lawnT >= 1 ? 99 : XL - 0.3 + (XR - XL + 0.6) * eInOut(lawnT);
    turfMat.color.set(lawnMode === 1 && lawnT >= 1 ? '#7fae5a' : '#7f9a55');

    // camera
    if (studio) {
      azS += (az - azS) * 0.08;
      cp.copy(C.studio.p).sub(C.studio.l).applyAxisAngle(new THREE.Vector3(0, 1, 0), azS).add(C.studio.l); cl.copy(C.studio.l);
    } else {
      // q-space: rewind (top of page) is b going down, then up again; the camera rises for the build and comes home for the finish
      const up = hero.q < 0.09 ? eInOut(clamp(hero.q / 0.09)) : 1 - eInOut(seg(b, 0.82, 1));
      cp.lerpVectors(hero.q < 0.09 ? C.fin.p : C.end.p, C.top.p, up);
      cl.lerpVectors(hero.q < 0.09 ? C.fin.l : C.end.l, C.top.l, up);
    }
    // portrait screens: step back so the whole garden fits
    const fit = Math.max(1, 1.25 / Math.max(0.5, cam.aspect));
    cp.sub(cl).multiplyScalar(cam.aspect < 1 ? Math.min(fit, studio ? 1.55 : 1.0) : 1).add(cl);
    pxs += (px - pxs) * 0.05; pys += (py - pys) * 0.05;
    cp.x += pxs * 0.35; cp.y += -pys * 0.18;
    cam.position.copy(cp); cam.lookAt(cl);
    motes.rotation.y = time * 0.00002;
  }
  const hero = { q: 0 };

  function frame(now: number) {
    // studio transitions
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (patioFrom) { patioT = Math.min(1, patioT + dt / 1.1); const x = XL - 0.2 + (XR - XL + 0.4) * eInOut(patioT); clipIn.constant = x; clipOut.constant = -x; if (patioT >= 1) { setClip(surfaces[patioFrom], null); setClip(surfaces[patio], null); patioFrom = null; } }
    if (boundaryFrom) { boundaryT = Math.min(1, boundaryT + dt / 1.3); if (boundaryT >= 1) boundaryFrom = null; }
    if (lawnT < 1) { lawnT = Math.min(1, lawnT + dt / 1.2); if (lawnT >= 1) lawnFrom = lawnMode; }
    lightT += (lightTarget - lightT) * Math.min(1, dt * 2.2);
    stepsT += ((extras.steps ? 1 : 0) - stepsT) * Math.min(1, dt * 3);
    bedsT += ((extras.beds ? 1 : 0) - bedsT) * Math.min(1, dt * 3);
    apply(now);
    renderer.render(scene, cam);
  }
  const setClip = (s: Surface, p: THREE.Plane | null) => { s.mats.forEach((m) => { m.clippingPlanes = p ? [p] : null; m.needsUpdate = true; }); };

  function loop() {
    cancelAnimationFrame(raf);
    const tick = (now: number) => {
      if (!vis) return;
      // phones idle at 30fps to save battery; everything is time-based so it still reads smooth
      if (!(lite && now - t0 < 30 && !need)) { t0 = now; frame(now); need = false; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  apply(performance.now());

  return {
    setBuild(qv) {
      hero.q = clamp(qv);
      build = hero.q < 0.09 ? 1 - eInOut(hero.q / 0.09) : clamp((hero.q - 0.09) / 0.86);
      need = true;
    },
    setPatio(k, tone) {
      if (k === patio) { patioTone = tone; surfaces[k].tint(tintOf(k, tone)); need = true; return; }
      if (patioFrom) { setClip(surfaces[patioFrom], null); }
      patioFrom = patio; patio = k; patioTone = tone; patioT = 0;
      surfaces[k].tint(tintOf(k, tone));
      clipIn.constant = XL - 0.2; clipOut.constant = -(XL - 0.2);
      setClip(surfaces[k], clipIn); setClip(surfaces[patioFrom], clipOut);
      need = true;
    },
    setLawn(k) { const m = k === 'artificial' ? 1 : 0; if (m === lawnMode) return; lawnFrom = lawnMode; lawnMode = m; lawnT = 0; },
    setBoundary(k) { if (k === boundary) return; boundaryFrom = boundary; boundary = k; boundaryT = 0; },
    setExtra(k, on) { extras = { ...extras, [k]: on }; if (k === 'lighting') lightTarget = on ? 1 : 0; },
    setPointer(x, y) { px = x; py = y; },
    orbit(dx) { az = clamp(az - dx * 0.004, -0.5, 0.42); },
    renderOnce() { frame(performance.now()); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); disposables.forEach((d) => d.dispose()); renderer.dispose(); },
  };
}

// ---------------- helpers ----------------
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, seed = 7, rep: [number, number] = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d')!, rng(seed));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 4;
  return t;
}
function leafDraw(g: CanvasRenderingContext2D, r: () => number) {
  const W = g.canvas.width, H = g.canvas.height;
  g.fillStyle = '#2f4426'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < W * H / 40; i++) {
    const v = 0.55 + r() * 0.7; g.fillStyle = `rgb(${(80 * v) | 0},${(118 * v) | 0},${(58 * v) | 0})`;
    g.beginPath(); g.ellipse(r() * W, r() * H, 2 + r() * 3, 1 + r() * 1.5, r() * 3.2, 0, 7); g.fill();
  }
}
// lumpy sphere (box balls / tree canopies)
function blobGeo(r: number, detail: number, amp: number, seed: number) {
  const g = mergeVertices(new THREE.IcosahedronGeometry(r, detail).deleteAttribute('normal').deleteAttribute('uv'));
  const p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  const k = seed * 0.37;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    const d = 1 + amp * (Math.sin(n.x * 5 + k) * Math.sin(n.y * 6 - k) * Math.sin(n.z * 5 + k * 2) + 0.4 * Math.sin(n.x * 13 + n.z * 11));
    v.copy(n).multiplyScalar(r * d); p.setXYZ(i, v.x, v.y * 0.92, v.z);
  }
  g.computeVertexNormals(); return g;
}

const GRASS_VS = `
  attribute vec4 aOff;   // x, z, rotation, height
  attribute vec3 aVar;   // colour variation, stripe band, phase
  uniform float uTime, uGrow, uWipe, uA, uB, uWind;
  varying float vT; varying vec3 vCol; varying vec3 vN; varying float vFog;
  void main(){
    float mode = aOff.x < uWipe ? uB : uA;          // 0 turf, 1 artificial, 2 ornamental clump
    float hh = aOff.w;
    if (mode > 0.5 && mode < 1.5) hh = 0.045 + fract(aVar.z * 7.) * 0.01;   // artificial: short, even pile
    // growth wave from the wall to the fence
    float g = clamp(uGrow * 1.6 - (fract(aVar.z * 3.17) * .25 + (-aOff.y - 1.) / 6.0 * 0.4), 0., 1.);
    g = g*g*(3.-2.*g);
    vec3 p = position; vT = p.y;
    p.y *= hh * g; p.x *= (mode > 1.5 ? 1.6 : 1.0) * (mode > 0.5 && mode < 1.5 ? 0.8 : 1.);
    float c = cos(aOff.z), s = sin(aOff.z);
    p.xz = mat2(c,-s,s,c) * p.xz;
    float stiff = (mode > 0.5 && mode < 1.5) ? 0.15 : 1.0;
    float wv = sin(uTime*1.7 + aOff.x*0.9 + aOff.y*0.6 + aVar.z*6.) * 0.5 + sin(uTime*3.1 + aOff.x*2.3) * 0.25;
    float bend = vT*vT * (0.05 + (mode > 1.5 ? 0.16 : 0.0)) * stiff * uWind;
    p.x += wv * bend; p.z += (wv*0.6 + 0.35) * bend;
    vec4 wp = modelMatrix * vec4(p + vec3(aOff.x, 0., aOff.y), 1.);
    vN = normalize(vec3(s*0.6, 1.0, c*0.6));
    // colour: natural turf with mown stripes / artificial even green / ornamental grasses and lavender tips
    vec3 turfA = vec3(.20,.33,.10), turfB = vec3(.27,.42,.14);
    vec3 col = mix(turfA, turfB, aVar.y) * (0.82 + aVar.x*0.35);
    if (mode > 0.5 && mode < 1.5) col = vec3(.22,.46,.12) * (0.95 + aVar.x*0.1);
    if (mode > 1.5) col = fract(aVar.z*13.) > .72 ? mix(vec3(.24,.32,.15), vec3(.36,.27,.52), smoothstep(.6,1.,vT)) : mix(vec3(.24,.34,.13), vec3(.50,.47,.27), smoothstep(.45,1.,vT)*0.6);
    if (mode > 1.5) col *= 0.72;
    vCol = col;
    vec4 mv = viewMatrix * wp; vFog = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const GRASS_FS = `
  uniform vec3 uSunDir, uSunCol, uSky, uGround, fogColor; uniform float fogNear, fogFar;
  varying float vT; varying vec3 vCol; varying vec3 vN; varying float vFog;
  void main(){
    float ao = mix(0.35, 1.0, smoothstep(0., .9, vT));
    float dif = max(dot(vN, normalize(uSunDir)), 0.) * 0.6 + 0.4;
    float trans = pow(max(dot(normalize(-uSunDir), vec3(0.,0.,-1.)), 0.), 2.) * vT * 0.6;  // backlit tips glow
    vec3 c = vCol * (uSky*ao + uGround*0.25 + uSunCol*dif*ao) + vCol*uSunCol*trans*1.4;
    c = mix(c, fogColor, smoothstep(fogNear, fogFar, vFog));
    gl_FragColor = vec4(c, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
function bladeGeo(segs = 3, w = 0.012) {
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= segs; i++) { const t = i / segs, ww = w * (1 - t * 0.85); pos.push(-ww, t, 0, ww, t, 0); }
  for (let i = 0; i < segs; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
}
function mkBlades(n: number, x0: number, x1: number, z0: number, z1: number, y: number, u: Record<string, THREE.IUniform>, hBase: number) {
  const base = bladeGeo(3, 0.011);
  const g = new THREE.InstancedBufferGeometry(); g.index = base.index; g.setAttribute('position', base.getAttribute('position'));
  const off = new Float32Array(n * 4), vr = new Float32Array(n * 3), r = rng(99);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
    off.set([x, z, r() * Math.PI, hBase * (0.7 + r() * 0.6)], i * 4);
    vr.set([r(), Math.floor((x - x0) / 0.92) % 2, r()], i * 3);
  }
  g.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4)); g.setAttribute('aVar', new THREE.InstancedBufferAttribute(vr, 3));
  g.instanceCount = n; g.boundingSphere = new THREE.Sphere(new THREE.Vector3((x0 + x1) / 2, y, (z0 + z1) / 2), 12);
  const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: GRASS_VS, fragmentShader: GRASS_FS, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, m); mesh.position.y = y; mesh.frustumCulled = false; return mesh;
}
function mkClumps(n: number, x0: number, x1: number, z0: number, z1: number, y: number, u: Record<string, THREE.IUniform>) {
  const base = bladeGeo(4, 0.009);
  const g = new THREE.InstancedBufferGeometry(); g.index = base.index; g.setAttribute('position', base.getAttribute('position'));
  const off = new Float32Array(n * 4), vr = new Float32Array(n * 3), r = rng(7);
  const centers: [number, number, number][] = [];
  for (let x = x0 + 0.25; x < x1; x += 0.52 + r() * 0.2) centers.push([x, z0 + 0.2 + r() * (z1 - z0 - 0.3), r()]);
  for (let i = 0; i < n; i++) {
    const c = centers[i % centers.length], a = r() * 6.28, d = Math.sqrt(r()) * 0.16;
    off.set([c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d, a, 0.45 + r() * 0.4], i * 4);
    vr.set([r(), 0, c[2]], i * 3);
  }
  g.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4)); g.setAttribute('aVar', new THREE.InstancedBufferAttribute(vr, 3));
  g.instanceCount = n;
  const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: GRASS_VS, fragmentShader: GRASS_FS, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, m); mesh.position.y = y; mesh.frustumCulled = false; return mesh;
}
function mkMotes(n: number) {
  const p = new Float32Array(n * 3), r = rng(3);
  for (let i = 0; i < n; i++) p.set([(r() - 0.5) * 10, 0.3 + r() * 3, -6 + r() * 10], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color: '#ffe2b0', size: 0.025, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  return new THREE.Points(g, m);
}
