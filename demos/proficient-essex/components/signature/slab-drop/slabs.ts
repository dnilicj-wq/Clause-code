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

  // stretcher bond: every other row starts and ends with a half slab
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
      scene.add(m);
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
    if (laid === total && !finished) { finished = true; api.finished = true; opts.onFinished?.(); layers.forEach((L) => (L.mesh.visible = false)); }
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

  // type switcher: block paving, resin and natural stone are full-patio surfaces that sweep in over whatever is there
  // (far to near, behind a moving clip plane). Porcelain re-lays the slabs on top.
  type Layer = { mesh: THREE.Mesh; clip: THREE.Plane; tex: THREE.Texture[] };
  const layers = new Map<SurfaceKind, Layer>();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const PW = 32, PD = 24, PCX = 0.6, PCZ = -4, FAR = PCZ - PD / 2, NEAR = PCZ + PD / 2;
  let kind: SurfaceKind = 'porcelain';
  let blendC = { c1: '#8C6A3F', c2: '#C49A62', c3: '#E9D3A6' };
  let reveal: { L: Layer; t0: number } | null = null;
  const dropLayer = (k: SurfaceKind) => {
    const L = layers.get(k); if (!L) return;
    scene.remove(L.mesh); L.mesh.geometry.dispose(); (L.mesh.material as THREE.Material).dispose(); L.tex.forEach((t) => t.dispose());
    layers.delete(k);
  };
  const getLayer = (k: Exclude<SurfaceKind, 'porcelain'>) => {
    let L = layers.get(k); if (L) return L;
    const sf = makeSurface(k, aniso, blendC);
    for (const t of [sf.map, sf.normal]) t.repeat.set(PW / sf.tile, PD / sf.tile);
    const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), FAR);
    const mat = new THREE.MeshPhysicalMaterial({ map: sf.map, normalMap: sf.normal, normalScale: new THREE.Vector2(1, 1), color: sf.tint, roughness: sf.rough, metalness: 0, clearcoat: sf.clear, clearcoatRoughness: 0.3, envMapIntensity: 0.75, clippingPlanes: [clip] });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), mat);
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(PCX, 0.003, PCZ); mesh.receiveShadow = true; mesh.visible = false;
    scene.add(mesh);
    L = { mesh, clip, tex: [sf.map, sf.normal] }; layers.set(k, L); return L;
  };
  function surface(k: SurfaceKind, force = false) {
    if (k === kind && !force) return;
    kind = k; frozen = false;
    layers.forEach((L) => (L.mesh.position.y = 0.003));       // existing surfaces sit under what comes next
    if (k === 'porcelain') {
      reveal = null;
      slabs.forEach((s) => { s.state = 0; s.hit = false; s.m.visible = false; });
      laid = 0; finished = false; finishing = true; api.finished = false;
      sweep(order(), now() + 0.05, 0.1, 0.3);
      return;
    }
    const L = getLayer(k);
    L.mesh.position.y = TH + 0.004;                            // above the slabs while it sweeps over them
    L.clip.constant = FAR; L.mesh.visible = true;
    reveal = { L, t0: now() };
  }
  const REVEAL = 1.5;
  function stepReveal(t: number) {
    if (!reveal) return;
    const k = Math.min(1, (t - reveal.t0) / REVEAL), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    reveal.L.clip.constant = FAR + (NEAR - FAR) * e;
    if (k >= 1) {
      const keep = reveal.L; reveal = null;
      layers.forEach((L) => { if (L !== keep) L.mesh.visible = false; });
      slabs.forEach((s) => { s.state = 0; s.hit = false; s.m.visible = false; });
      laid = 0; finished = true; finishing = true;
      keep.mesh.position.y = 0.003;
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
      stepReveal(t);
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
      if (kind === 'resin') { const old = layers.get('resin'); if (old) { layers.delete('resin'); layers.set('old-resin' as SurfaceKind, old); } surface('resin', true); setTimeout(() => dropLayer('old-resin' as SurfaceKind), REVEAL * 1000 + 200); }
      else dropLayer('resin');
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
