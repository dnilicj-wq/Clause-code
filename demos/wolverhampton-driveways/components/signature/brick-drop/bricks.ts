// Brick-drop hero: grey and red block paving falls from above onto an old cracked concrete drive, course by course.
// three.js InstancedMesh (one draw call for ~1,500 bricks), cracked-concrete PBR ground (CC0 Poly Haven, baked by
// scripts/prep-slab.mjs), soft sun shadows, leaf dapple for idle motion. Same callback shape as drive-pour.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type BrickOpts = {
  fog: string; tex: string;
  onFirst?: () => void; onCoverage?: (c: number) => void; onFinished?: () => void; onReady?: () => void; onLost?: () => void;
};

const BW = 0.3, BD = 0.15, JOINT = 0.007, TH = 0.07;   // block pavers (drawn a touch larger than 200 x 100 so they read on a phone)
const COLS = 34, ROWS = 46;                               // field incl. the border
const X0 = -4.4, Z0 = 2.7;
const FIN_AT = 0.7;
export const START = 0.42;

// brindle mix: mostly greys with red runs, charcoal border
const GREYS = ['#5e5e61', '#717070', '#4d4d50', '#7f7e7b', '#585654'];
const REDS = ['#6a2219', '#7c2a1f', '#5a1d16', '#8a3324'];
const BORDER = '#232326';

type B = { i: number; x: number; z: number; rot: boolean; state: 0 | 1 | 2; t0: number; dur: number; h: number; rx: number; ry: number; rz: number; hit: boolean };

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

  const scene = new THREE.Scene();
  const fogC = new THREE.Color(opts.fog);
  scene.background = fogC;
  scene.fog = new THREE.Fog(fogC, 7, 17);
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
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 25 });
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
      list.push({ i: list.length, x, z, rot: false, state: 0, t0: 0, dur: 0, h: 0, rx: 0, ry: 0, rz: 0, hit: false });
    }
  }
  const total = list.length;
  const geo = new RoundedBoxGeometry(BW - JOINT, TH, BD - JOINT, 2, 0.008);
  const mat = new THREE.MeshStandardMaterial({ map: sMap, normalMap: sNor, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.82, metalness: 0, color: '#ffffff' });
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), S0 = new THREE.Vector3(0, 0, 0);
  const setM = (b: B, y: number, rx = 0, ry = 0, rz = 0, show = true) => {
    P.set(b.x, y, b.z); Q.setFromEuler(E.set(rx, ry, rz)); M.compose(P, Q, show ? S1 : S0); mesh.setMatrixAt(b.i, M);
  };
  list.forEach((b, k) => { mesh.setColorAt(k, cols[k]); setM(b, 0, 0, 0, 0, false); });
  scene.add(mesh);

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
    if (portrait) { cam.fov = 50; cam.position.set(0.5, 4.9, 4.6); look.set(0.5, 0, -1.5); }
    else { cam.fov = 34; cam.position.set(0.7, 3.5, 5.7); look.set(0.7, 0, -1.6); }
    cam.updateProjectionMatrix(); cam.lookAt(look);
  };
  frame();
  const ro = new ResizeObserver(frame); ro.observe(host);

  let laid = 0, finished = false, first = false, finishing = false;
  const falling = new Set<B>();
  const drop = (b: B, at: number) => {
    if (b.state !== 0) return;
    b.state = 1; b.t0 = at; b.h = 1.6 + rnd() * 1.2; b.dur = Math.sqrt((2 * b.h) / 9.81) * 1.1;
    b.rx = (rnd() - 0.5) * 0.9; b.rz = (rnd() - 0.5) * 0.9; b.ry = (rnd() - 0.5) * 0.8;
    falling.add(b);
  };
  const coverage = () => laid / total;
  const landed = (b: B, now: number) => {
    b.hit = true; laid++;
    if (b.i % 9 === 0) puff(b.x, b.z, now);
    if (laid % 12 === 0 || laid === total) opts.onCoverage?.(coverage());
    if (!finishing && coverage() >= FIN_AT) finish();
    if (laid === total && !finished) { finished = true; api.finished = true; opts.onFinished?.(); }
  };
  // far courses first, so new bricks land in front of the laid ones (reads as "landing from the top")
  const order = () => list.filter((b) => b.state === 0).sort((a, b) => a.z - b.z || a.x - b.x);
  function finish(gap = 0.0035) { finishing = true; const t = now(); order().forEach((b, i) => drop(b, t + i * gap)); }
  function place(b: B) { b.state = 2; b.hit = true; setM(b, TH / 2); }
  function demo(start = START) {
    const t = now(); const o = order(), n = Math.round(total * start);
    o.slice(0, n).forEach(place); laid += n; mesh.instanceMatrix.needsUpdate = true;
    let at = t + 0.15;
    o.slice(n).forEach((b, i) => { drop(b, at); at += Math.max(0.004, 0.06 * Math.pow(0.97, i)); });
  }
  function prefill(f = START) {
    const o = order(); const n = Math.round(total * f);
    o.slice(0, n).forEach(place); laid = n;
    // the next courses caught mid-air, scattered across the width at different heights
    o.slice(n, n + 90).forEach((b, i) => { if (rnd() > 0.32) return; b.state = 1; const hgt = 0.12 + rnd() * 1.7; setM(b, TH / 2 + hgt, (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.8, (rnd() - 0.5) * 0.9); });
    mesh.instanceMatrix.needsUpdate = true; frozen = true;
  }
  function fillAll() { list.forEach(place); laid = total; mesh.instanceMatrix.needsUpdate = true; frozen = true; }
  function reset() { list.forEach((b) => { b.state = 0; b.hit = false; setM(b, 0, 0, 0, 0, false); }); falling.clear(); mesh.instanceMatrix.needsUpdate = true; laid = 0; finished = false; finishing = false; api.finished = false; opts.onCoverage?.(0); }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const onPtr = (e: PointerEvent) => {
    if ((e.target as HTMLElement)?.closest?.('[data-nopour],a,button,input,select,label')) return;
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
        setM(b, TH / 2 + b.h * (1 - e), b.rx * sw, b.ry * sw, b.rz * sw);
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
    set: (_b: unknown) => {},
    destroy() {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
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
