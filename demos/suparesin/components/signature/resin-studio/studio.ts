// Resin studio hero: one three.js scene, two modes.
//   Driveways: daylight over an old cracked concrete drive; resin-bound stone is poured from the back, a wet glossy
//              front creeping toward you, in the blend you pick.
//   Floors:    the same slab under strip lights; flake, metallic or high-build epoxy floods across it and the
//              lights reflect in the finished gloss.
// Every new finish pours on top of the last one (a hair higher), so switching always reads as a fresh pour.
// Ground maps: CC0 Poly Haven concrete (baked earlier into public/tex/). Everything else is procedural (surfaces.ts).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeSurface, type Finish } from './surfaces';
export type { Finish };
export type Mode = 'drive' | 'floor';

export type StudioOpts = { fog: string; tex: string; onReady?: () => void; onLost?: () => void; onPoured?: () => void };

const KZ = 0.15;           // seconds per metre of depth for the pour front
const LIFT = 0.004;

export function initStudio(host: HTMLElement, cv: HTMLCanvasElement, opts: StudioOpts) {
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
  scene.background = fogC.clone();
  scene.fog = new THREE.Fog(fogC.clone(), 13, 28);
  const pm = new THREE.PMREMGenerator(renderer);
  const envDay = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const envShop = pm.fromScene(stripRoom(), 0.02).texture;
  scene.environment = envDay;
  (scene as any).environmentIntensity = 0.4;

  const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const look = new THREE.Vector3();
  const hemi = new THREE.HemisphereLight('#d6dce2', '#2a251e', 0.55);
  const sun = new THREE.DirectionalLight('#ffe2bd', 4.1);
  sun.position.set(-6.5, 8.5, -3.2); sun.target.position.set(0.4, 0, -0.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 30 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4; sun.shadow.blurSamples = 12;
  scene.add(hemi, sun, sun.target);

  // one shadow-only frame of a window, so the drive is not a flat field (driveway mode only)
  const tl = new THREE.TextureLoader();
  let pending = 2, dead = false;
  const ready = () => { if (--pending === 0 && !dead) { api.loaded = true; opts.onReady?.(); } };
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const tex = (f: string, srgb: boolean) => {
    const t = tl.load(opts.tex + f, ready, undefined, ready);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const gMap = tex(coarse ? 'ground-1k-v2.webp' : 'ground-v2.webp', true), gNor = tex(coarse ? 'ground-n-1k-v2.jpg' : 'ground-n-v2.jpg', false);
  gMap.repeat.set(4.6, 4.6); gNor.repeat.set(4.6, 4.6); gMap.rotation = gNor.rotation = 0.35;
  const gMat = new THREE.MeshStandardMaterial({ map: gMap, normalMap: gNor, normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.95, color: '#8e8d8b', metalness: 0 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), gMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // ---------- framing ----------
  let W = 1, H = 1, portrait = false, mode: Mode = 'drive';
  const camT = new THREE.Vector3(), lookT = new THREE.Vector3();
  const target = () => {
    if (mode === 'drive') {
      if (portrait) { camT.set(0.4, 6.2, 2.6); lookT.set(0.4, 0, -1.2); } else { camT.set(0.7, 5.2, 4.6); lookT.set(0.7, 0, -1.8); }
    } else {
      // lower and further back indoors, so the ceiling lights show in the gloss
      if (portrait) { camT.set(0.3, 4.4, 3.6); lookT.set(0.3, 0, -1.6); } else { camT.set(0.6, 3.5, 5.6); lookT.set(0.6, 0, -2.2); }
    }
  };
  const frame = () => {
    W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
    renderer.setSize(W, H, false); cam.aspect = W / H; portrait = W / H < 0.9;
    cam.fov = portrait ? 46.5 : 31.5;
    target(); cam.position.copy(camT); look.copy(lookT);
    cam.updateProjectionMatrix(); cam.lookAt(look);
  };
  frame();
  const ro = new ResizeObserver(frame); ro.observe(host);

  // ---------- lighting per mode (eased in the loop) ----------
  const L = {
    drive: { sun: 4.1, hemi: 0.55, env: 0.4, exp: 0.95, ground: new THREE.Color('#8e8d8b'), fog: fogC.clone() },
    floor: { sun: 0.9, hemi: 0.35, env: 1.05, exp: 1.0, ground: new THREE.Color('#77767a'), fog: fogC.clone().multiplyScalar(0.8) },
  };
  let mixK = 0;                          // 0 = daylight, 1 = workshop
  const applyMix = (k: number) => {
    const a = L.drive, b = L.floor;
    sun.intensity = a.sun + (b.sun - a.sun) * k;
    hemi.intensity = a.hemi + (b.hemi - a.hemi) * k;
    (scene as any).environmentIntensity = a.env + (b.env - a.env) * k;
    renderer.toneMappingExposure = a.exp + (b.exp - a.exp) * k;
    gMat.color.copy(a.ground).lerp(b.ground, k);
    (scene.fog as THREE.Fog).color.copy(a.fog).lerp(b.fog, k); (scene.background as THREE.Color).copy((scene.fog as THREE.Fog).color);
    scene.environment = k > 0.5 ? envShop : envDay;
  };

  // the farthest ground the viewer can see (top edge of the screen): the pour starts there
  const zVis = () => {
    const rc = new THREE.Raycaster(), hp = new THREE.Vector3();
    cam.updateMatrixWorld();
    rc.setFromCamera(new THREE.Vector2(0, 1), cam);
    return rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hp) ? hp.z : -99;
  };

  // ---------- pour layers ----------
  type Layer = { g: THREE.Mesh; start: number; end: number; zFar: number; dur: number; uFront: { value: number }; dispose: () => void };
  const layers: Layer[] = [];
  const PW = 30, PD = 24, zNear = 6;
  const surfCache = new Map<string, ReturnType<typeof makeSurface>>();
  const surf = (f: Finish) => {
    const id = `${f.kind}:${f.c1}${f.c2}${f.c3}${f.c4 || ''}`;
    let s = surfCache.get(id);
    if (!s) { s = makeSurface(f, aniso, coarse); for (const t of [s.map, s.normal]) t.repeat.set(PW / s.tile, PD / s.tile); surfCache.set(id, s); }
    return s;
  };
  function makeLayer(f: Finish, start: number): Layer {
    const sf = surf(f);
    const uFront = { value: -99 };
    const floor = f.kind !== 'resin';
    const mat = new THREE.MeshPhysicalMaterial({
      map: sf.map, normalMap: sf.normal, normalScale: new THREE.Vector2(sf.nScale, sf.nScale), color: sf.tint,
      roughness: sf.rough, metalness: sf.metal, clearcoat: sf.clear, clearcoatRoughness: sf.clearRough, envMapIntensity: floor ? 1 : 0.75,
    });
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
          float wet = 1.0 - smoothstep(0.0, ${floor ? '0.9' : '1.6'}, ahead);
          float lip = 1.0 - smoothstep(0.0, 0.06, ahead);`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          diffuseColor.rgb *= mix(1.0, ${floor ? '0.82' : '0.62'}, wet);
          diffuseColor.rgb += lip * ${floor ? '0.10' : '0.04'};`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.05, wet);');
    };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), mat);
    m.rotation.x = -Math.PI / 2; m.position.set(0.6, 0.006 + layers.length * LIFT, -5); m.receiveShadow = true;
    scene.add(m);
    const zFar = Math.max(-17, zVis() - 1), dur = (zNear - zFar) * KZ * (floor ? 0.95 : 0.85);
    return { g: m, start, end: start + dur + 0.2, zFar, dur, uFront, dispose: () => { scene.remove(m); m.geometry.dispose(); mat.dispose(); } };
  }
  // keep at most two layers: the finished one underneath and the one going down
  const trim = () => { while (layers.length > 2) layers.shift()!.dispose(); layers.forEach((l, i) => (l.g.position.y = 0.006 + i * LIFT)); };
  let poured = true;
  function pour(f: Finish, m: Mode = mode, delay = 0.05) {
    setMode(m);
    const t = now() + delay;
    // let the camera arrive before the zFar is measured on a mode change
    const lay = makeLayer(f, t);
    layers.push(lay); trim();
    poured = false;
    frozen = false;
    return lay;
  }
  // finished surface (front = 99), or frozen part-way with the wet edge at world z = front (designer stills)
  function fill(f: Finish, m: Mode = mode, front = 99) {
    setMode(m, true);
    const lay = pour(f, m, 0); lay.start = -1e3; lay.end = -1e3 + 1; lay.uFront.value = front;
    layers.splice(0, layers.length - 1).forEach((l) => l.dispose());
    poured = true;
  }
  function bare(m: Mode = mode) { setMode(m, true); layers.splice(0).forEach((l) => l.dispose()); }
  function setMode(m: Mode, snap = false) {
    mode = m; target();
    if (snap) { mixK = m === 'floor' ? 1 : 0; applyMix(mixK); cam.position.copy(camT); look.copy(lookT); cam.lookAt(look); }
  }

  const clock = new THREE.Timer();
  const now = () => clock.getElapsed();
  let raf = 0, visible = true, frozen = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { threshold: 0 });
  io.observe(host);
  const lost = (e: Event) => { e.preventDefault(); opts.onLost?.(); };
  cv.addEventListener('webglcontextlost', lost);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loop() {
    raf = 0; clock.update();
    if (dead || !visible) return;
    const t = now();
    // lights and camera ease toward the mode
    const k = mode === 'floor' ? 1 : 0;
    if (Math.abs(mixK - k) > 0.002) { mixK += (k - mixK) * 0.08; applyMix(mixK); }
    const drift = reduced ? 0 : Math.sin(t * 0.12) * 0.08;
    cam.position.x += (camT.x + drift - cam.position.x) * 0.04;
    cam.position.y += (camT.y - cam.position.y) * 0.04;
    cam.position.z += (camT.z - cam.position.z) * 0.04;
    look.lerp(lookT, 0.04); cam.lookAt(look);
    if (!reduced) (scene as any).environmentRotation.y = Math.sin(t * 0.09) * 0.35;   // the reflections slide slowly over the gloss
    for (const l of layers) {
      const kk = Math.max(0, Math.min(1, (t - l.start) / l.dur));
      if (l.start > -1e2) l.uFront.value = t < l.start ? -99 : l.zFar - 1.5 + (zNear - l.zFar + 3.5) * (kk < 0.5 ? 2 * kk * kk : 1 - Math.pow(-2 * kk + 2, 2) / 2);
    }
    const top = layers[layers.length - 1];
    if (!poured && top && t > top.end) { poured = true; layers.splice(0, layers.length - 1).forEach((l) => l.dispose()); top.g.position.y = 0.006; opts.onPoured?.(); }
    renderer.render(scene, cam);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  void frozen;

  const api = {
    loaded: false,
    pour: (f: Finish, m?: Mode) => { pour(f, m); },
    fill, bare,
    get look() { return look.clone(); },
    get mode() { return mode; },
    destroy() {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      layers.forEach((l) => l.dispose());
      surfCache.forEach((s) => { s.map.dispose(); s.normal.dispose(); });
      cv.removeEventListener('webglcontextlost', lost);
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mm = m.material as THREE.Material | THREE.Material[] | undefined; (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((x) => x.dispose()); });
      [gMap, gNor, envDay, envShop].forEach((x) => x.dispose());
      pm.dispose(); renderer.dispose();
    },
  };
  return api;
}
export type StudioApi = NonNullable<ReturnType<typeof initStudio>>;

// A dark workshop with long strip lights across the ceiling and one warm window: only used to light/reflect the floors.
function stripRoom() {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 30), new THREE.MeshBasicMaterial({ color: '#16161a', side: THREE.BackSide }));
  room.position.y = 3.6; s.add(room);
  const strip = new THREE.MeshBasicMaterial({ color: new THREE.Color(30, 30, 28) });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 0.13), strip);
    m.position.set(-1.5 + (i % 3) * 1.5, 7.4, -14 + i * 3.4); s.add(m);
  }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.6, 1.9) }));
  win.position.set(0, 2.8, -14.8); s.add(win);
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.33, 0.3) }));
  fill.position.set(0, 3.6, 14.8); fill.rotation.y = Math.PI; s.add(fill);
  return s;
}
