// "Built in layers": a cutaway of a block-paved drive that builds itself as you scroll.
// Old cracked surface lifts out, then sub-base, laying course, herringbone blocks (cut at the edges, the way they're
// really laid), the border course and a final finish. Vanilla three.js, renders only while on screen and only
// when the scroll position or an easing step has moved something.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type LayersApi = { setProgress: (p: number) => void; destroy: () => void };
export const STEPS = 6;

const W = 6, D = 4;                 // slab footprint (m)
const EDGE = 0.2;                   // border course width
const BLK_H = 0.08, SAND = 0.06, SUB = 0.3, SOIL = 0.95;
const yTop = 0, ySand = -BLK_H, ySub = ySand - SAND, ySoil = ySub - SUB, yBot = ySoil - SOIL;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOut = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
// each step does its work in the first 62% of its scroll segment, then holds so the copy can be read
const stepT = (p: number, s: number) => clamp((p * STEPS - s) / 0.62);

function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, seed = 7, repeat: [number, number] = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!; draw(g, rng(seed));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat); t.anisotropy = 4; return t;
}
const speckle = (base: string, dots: string[], n: number, rMax: number) => (g: CanvasRenderingContext2D, r: () => number) => {
  g.fillStyle = base; g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  for (let i = 0; i < n; i++) {
    g.fillStyle = dots[Math.floor(r() * dots.length)]; g.globalAlpha = 0.35 + r() * 0.65;
    const x = r() * g.canvas.width, y = r() * g.canvas.height, s = 0.6 + r() * rMax;
    g.beginPath();
    const k = 3 + Math.floor(r() * 4);           // angular stones
    for (let j = 0; j < k; j++) { const a = (j / k) * Math.PI * 2 + r() * 0.6, d = s * (0.6 + r() * 0.5); j ? g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d) : g.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
};

// 90° herringbone on a 0.1 m grid, verified gap/overlap free: H block at lattice origin, V block one unit up.
function herringbone(): { x: number; z: number; w: number; d: number }[] {
  const u = 0.1, out: { x: number; z: number; w: number; d: number }[] = [];
  const x0 = -W / 2 + EDGE, x1 = W / 2 - EDGE, z0 = -D / 2 + EDGE, z1 = D / 2 - EDGE;
  const add = (gx: number, gz: number, gw: number, gd: number) => {
    const ax = Math.max(x0, gx * u + x0 - 0.37), bx = Math.min(x1, (gx + gw) * u + x0 - 0.37);
    const az = Math.max(z0, gz * u + z0 - 0.13), bz = Math.min(z1, (gz + gd) * u + z0 - 0.13);
    if (bx - ax < 0.025 || bz - az < 0.025) return;       // slivers are left to the jointing sand
    out.push({ x: (ax + bx) / 2, z: (az + bz) / 2, w: bx - ax, d: bz - az });
  };
  for (let a = -40; a < 100; a++) for (let b = -40; b < 40; b++) {
    const ox = a + 2 * b, oz = a - 2 * b;
    if (ox < -4 || ox > 60 || oz < -4 || oz > 40) continue;
    add(ox, oz, 2, 1); add(ox, oz + 1, 1, 2);
  }
  return out;
}

export function initLayers(canvas: HTMLCanvasElement, host: HTMLElement): LayersApi | null {
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return null; }
  const dpr = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.6 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  // light: cool sky fill, warm low sun that warms further as the drive is finished
  const hemi = new THREE.HemisphereLight(0xdfe6f2, 0x2a2622, 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
  sun.position.set(-6, 9, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -6; sun.shadow.camera.right = 6; sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9db4ff, 0.7); rim.position.set(7, 3, -6); scene.add(rim);

  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.38 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = yBot - 0.001; catcher.receiveShadow = true; scene.add(catcher);

  const slab = new THREE.Group(); scene.add(slab);
  const disposables: { dispose: () => void }[] = [];
  const box = (w: number, h: number, d: number, mat: THREE.Material | THREE.Material[], y: number) => {
    const g = new THREE.BoxGeometry(w, h, d); disposables.push(g);
    const m = new THREE.Mesh(g, mat); m.position.y = y + h / 2; m.castShadow = true; m.receiveShadow = true; return m;
  };
  const mat = (map: THREE.Texture, rough = 0.95, color = 0xffffff) => { disposables.push(map); const m = new THREE.MeshStandardMaterial({ map, roughness: rough, color, transparent: true }); disposables.push(m); return m; };

  // soil (the formation)
  const soilTex = canvasTex(512, 256, speckle('#4a3a2c', ['#5d4835', '#3a2c20', '#6e5a44', '#2d241b', '#7d6a55'], 2600, 3.2), 3, [2, 1]);
  const soil = box(W, SOIL, D, mat(soilTex), yBot); slab.add(soil);
  // spoil: the old ground that gets dug out, plus the old cracked surface on top
  const spoilTex = canvasTex(512, 256, speckle('#56473a', ['#6b5a49', '#40352b', '#7a6857'], 1800, 2.6), 9, [2, 1]);
  const spoil = box(W, SUB + SAND + BLK_H - 0.07, D, mat(spoilTex), ySoil);
  const oldTop = new THREE.TextureLoader().load('/tex/ground-1k-v2.webp', () => dirty()); oldTop.colorSpace = THREE.SRGBColorSpace; disposables.push(oldTop);
  const oldSide = canvasTex(256, 32, speckle('#2b2b2c', ['#3a3a3b', '#1f1f20', '#4a4a4a'], 500, 1.4), 4, [4, 1]);
  const oldMats = [mat(oldSide), mat(oldSide), mat(oldTop, 1), mat(oldSide), mat(oldSide), mat(oldSide)];
  const old = box(W, 0.07, D, oldMats, yTop - 0.07);
  const dig = new THREE.Group(); dig.add(spoil, old); slab.add(dig);

  // sub-base: crushed stone
  const subTex = canvasTex(512, 256, speckle('#8c8a86', ['#a7a5a0', '#6f6d69', '#bdbab3', '#5d5b58', '#97938c'], 5200, 3.4), 11, [3, 1]);
  const sub = box(W, SUB, D, mat(subTex, 0.98), ySoil); slab.add(sub);
  // laying course: sharp sand
  const sandTex = canvasTex(512, 128, speckle('#c9b58d', ['#d8c6a0', '#b39d74', '#e3d4b2', '#a58f68'], 6000, 1.1), 13, [3, 1]);
  const sand = box(W, SAND, D, mat(sandTex, 1), ySub); slab.add(sand);
  // screed bar that runs across the sand
  const screed = box(0.05, 0.05, D + 0.3, new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 0.6, roughness: 0.35, transparent: true }), ySand);
  slab.add(screed);

  // blocks: instanced, rounded, brindle mix
  const blkTex = canvasTex(128, 64, speckle('#ffffff', ['#e9e4dc', '#d8d1c6', '#f5f2ec', '#cfc6b8'], 420, 1.6), 21);
  const blkGeo = new RoundedBoxGeometry(1, BLK_H, 1, 2, 0.012); disposables.push(blkGeo);
  const blkMat = new THREE.MeshStandardMaterial({ map: blkTex, roughness: 0.82 }); disposables.push(blkMat);
  const field = herringbone();
  const blocks = new THREE.InstancedMesh(blkGeo, blkMat, field.length);
  blocks.castShadow = true; blocks.receiveShadow = true;
  const palette = ['#8e3b2a', '#a2492f', '#7a3324', '#b0583a', '#5a2a22', '#6b5a50', '#3d3533'];
  const r = rng(5), col = new THREE.Color();
  const order: number[] = [];
  field.forEach((b, i) => {
    col.set(palette[Math.floor(r() * palette.length)]).offsetHSL(0, (r() - 0.5) * 0.05, (r() - 0.5) * 0.06);
    blocks.setColorAt(i, col);
    // laid from the front-left corner outwards, in a sweeping wave, with a little hand-laid jitter
    order.push(((b.x + W / 2) / W) * 0.6 + ((b.z + D / 2) / D) * 0.4 + r() * 0.05);
  });
  const oMax = Math.max(...order); for (let i = 0; i < order.length; i++) order[i] /= oMax;
  slab.add(blocks);

  // border course: charcoal soldier blocks round the edge
  const edge: { x: number; z: number; w: number; d: number }[] = [];
  for (let x = -W / 2; x < W / 2 - 0.01; x += 0.1) { edge.push({ x: x + 0.05, z: -D / 2 + EDGE / 2, w: 0.1, d: EDGE }); edge.push({ x: x + 0.05, z: D / 2 - EDGE / 2, w: 0.1, d: EDGE }); }
  for (let z = -D / 2 + EDGE; z < D / 2 - EDGE - 0.01; z += 0.1) { edge.push({ x: -W / 2 + EDGE / 2, z: z + 0.05, w: EDGE, d: 0.1 }); edge.push({ x: W / 2 - EDGE / 2, z: z + 0.05, w: EDGE, d: 0.1 }); }
  const edgeMat = new THREE.MeshStandardMaterial({ map: blkTex, roughness: 0.78, color: 0x34363b }); disposables.push(edgeMat);
  const border = new THREE.InstancedMesh(blkGeo, edgeMat, edge.length);
  border.castShadow = true; border.receiveShadow = true;
  edge.forEach((b, i) => { col.set('#34363b').offsetHSL(0, 0, (r() - 0.5) * 0.06); border.setColorAt(i, col); });
  slab.add(border);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const place = (im: THREE.InstancedMesh, list: typeof field, lift: (i: number) => number) => {
    for (let i = 0; i < list.length; i++) {
      const b = list[i], h = lift(i);
      const shrink = h >= 0.999 ? 0.001 : 1;
      v.set(b.x, yTop - BLK_H / 2 + h * 2.2, b.z); s.set((b.w - 0.006) * shrink, shrink, (b.d - 0.006) * shrink);
      m4.compose(v, q, s); im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
  };

  // ---- state
  let target = 0, shown = -1, vis = false, raf = 0, w = 0, h = 0, need = true;
  const dirty = () => { need = true; };
  const resize = () => {
    w = host.clientWidth; h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // wide screens: slide the slab right so the copy column on the left stays clear; phones: nudge it up off the step card
    if (w >= 900) camera.setViewOffset(w, h, -w * 0.16, -h * 0.03, w, h); else camera.setViewOffset(w, h, 0, h * 0.04, w, h);
    camera.updateProjectionMatrix(); need = true;
  };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) loop(); }, { rootMargin: '200px' }); io.observe(host);

  const camFrom = new THREE.Vector3(8.6, 7.4, 10.2), camTo = new THREE.Vector3(6.4, 3.6, 7.6);
  const lookFrom = new THREE.Vector3(0, -0.45, 0), lookTo = new THREE.Vector3(0.2, -0.35, 0);
  const look = new THREE.Vector3();
  const sunCold = new THREE.Color(0xfff1dc), sunWarm = new THREE.Color(0xffd8a8);

  function apply(p: number) {
    const t0 = stepT(p, 0), t1 = stepT(p, 1), t2 = stepT(p, 2), t3 = stepT(p, 3), t4 = stepT(p, 4), t5 = stepT(p, 5);
    // 1 dig out: old surface and spoil lift away
    const d = easeInOut(t0);
    dig.position.y = d * 3.4; dig.rotation.z = d * 0.08; dig.rotation.x = -d * 0.05;
    for (const m of [spoil, old]) { const mm = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[]; mm.forEach((x) => (x.opacity = 1 - clamp(d * 1.6 - 0.6))); }
    dig.visible = d < 0.999;
    // 2 sub-base and 3 sand drop into the dig
    const fall = (m: THREE.Mesh, t: number) => { const e = easeOut(t); m.position.y = m.userData.y0 + (1 - e) * 2.6; (m.material as THREE.MeshStandardMaterial).opacity = clamp(t * 3); m.visible = t > 0.001; };
    fall(sub, t1); fall(sand, t2);
    // screed bar sweeps the sand flat
    const sw = clamp((t2 - 0.35) / 0.65);
    screed.visible = sw > 0 && sw < 1; screed.position.x = -W / 2 + sw * W;
    // 4 blocks laid in a wave, 5 border course, both settle from above
    place(blocks, field, (i) => 1 - easeOut(clamp((t3 * 1.25 - order[i] * 0.95) / 0.3)));
    blocks.visible = t3 > 0.001;
    place(border, edge, (i) => 1 - easeOut(clamp((t4 * 1.3 - (i / edge.length) * 0.9) / 0.4)));
    border.visible = t4 > 0.001;
    // 6 finish: camera comes down to a hero angle, sun warms
    const c = easeInOut(clamp(p));
    camera.position.lerpVectors(camFrom, camTo, c);
    look.lerpVectors(lookFrom, lookTo, c);
    const fit = Math.max(1, 1.02 / Math.max(0.45, camera.aspect));         // keep the slab framed on tall phones
    camera.position.sub(look).multiplyScalar(fit).add(look);
    camera.lookAt(look);
    const f = easeInOut(t5);
    sun.color.copy(sunCold).lerp(sunWarm, f); sun.intensity = 2.6 + f * 0.6;
    sun.position.set(-6 + f * 2, 9 - f * 2.5, 5);
    slab.rotation.y = -0.06 + c * 0.16;
  }
  sub.userData.y0 = sub.position.y; sand.userData.y0 = sand.position.y;

  function loop() {
    cancelAnimationFrame(raf);
    const tick = () => {
      if (!vis) return;
      const next = shown < 0 ? target : shown + (target - shown) * 0.14;
      if (Math.abs(next - shown) > 0.00005 || need) {
        shown = Math.abs(target - next) < 0.0003 ? target : next;
        apply(shown); renderer.render(scene, camera); need = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  apply(0); renderer.render(scene, camera);

  return {
    setProgress(p) { target = clamp(p); },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      disposables.forEach((x) => x.dispose()); blocks.dispose(); border.dispose(); renderer.dispose();
    },
  };
}
