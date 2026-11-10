// "The bit you'll never see": a cut-away patio block that lifts into its real layers on scroll, shows the fall to the
// drain, then snaps back together. Vanilla three.js; renders only while on screen and only when something moved.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type LayersApi = { setProgress: (p: number) => void; destroy: () => void };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const eInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);
// how strongly layer i is 'the one being described' at progress p: a soft bump, so focus glides from layer to layer
const focus = (p: number, i: number) => { const c = 0.18 + i * 0.12; return smooth(clamp(1 - Math.abs(p - c) / 0.11)); };

export function layerAt(p: number) { return p < 0.1 ? -1 : p > 0.8 ? 5 : clamp(Math.round((p - 0.18) / 0.12), 0, 4); }

export function initLayers(canvas: HTMLCanvasElement, host: HTMLElement): LayersApi | null {
  let r: THREE.WebGLRenderer;
  try { r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return null; }
  const lite = matchMedia('(pointer:coarse)').matches || innerWidth < 760;
  r.setPixelRatio(Math.min(devicePixelRatio || 1, lite ? 1.5 : 1.75));
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const dis: { dispose: () => void }[] = [];
  const S = lite ? 512 : 1024, tl = new THREE.TextureLoader();
  let need = true;
  const tex = (n: string, srgb: boolean, rep: [number, number]) => { const t = tl.load('/tex/' + n, () => (need = true)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; dis.push(t); return t; };

  scene.add(new THREE.HemisphereLight('#e8eef0', '#2b3326', 1.1));
  const sun = new THREE.DirectionalLight('#ffe2b8', 2.6); sun.position.set(-5, 9, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const rim = new THREE.DirectionalLight('#a9c3ff', 0.8); rim.position.set(6, 2, -5); scene.add(rim);
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.35 })); catcher.rotation.x = -Math.PI / 2; catcher.position.y = -0.62; catcher.receiveShadow = true; scene.add(catcher);

  const W = 3.4, D = 2.3;
  const L = [
    { h: 0.5, mat: new THREE.MeshStandardMaterial({ map: tex(`forest_ground_04-${S}.webp`, true, [2, 1]), normalMap: tex(`forest_ground_04-n-${S}.jpg`, false, [2, 1]), color: '#a08b74', roughness: 1 }) },
    { h: 0.012, mat: new THREE.MeshStandardMaterial({ color: '#d8d6cf', roughness: 0.9, map: weave() }) },
    { h: 0.22, mat: new THREE.MeshStandardMaterial({ map: tex(`gravel_ground_01-${S}.webp`, true, [2, 1]), normalMap: tex(`gravel_ground_01-n-${S}.jpg`, false, [2, 1]), color: '#c4bfb5', roughness: 1 }) },
    { h: 0.05, mat: new THREE.MeshStandardMaterial({ map: tex(`sandy_gravel-${S}.webp`, true, [2, 0.6]), color: '#dcd6c9', roughness: 1 }) },
  ];
  const block = new THREE.Group(); scene.add(block);
  const parts: THREE.Object3D[] = [];
  let y = -0.6;
  for (const l of L) {
    dis.push(l.mat);
    const g = new THREE.BoxGeometry(W, l.h, D); dis.push(g);
    const m = new THREE.Mesh(g, l.mat); m.castShadow = m.receiveShadow = true;
    m.position.y = y + l.h / 2; m.userData.y = m.position.y; y += l.h;
    block.add(m); parts.push(m);
  }
  // porcelain slabs on top: 4 x 3 with joints
  const slabs = new THREE.Group(); slabs.userData.y = y + 0.02;
  const sMap = tex('porcelain-g.webp', true, [0.35, 0.35]), sN = tex('slab-n-v1.jpg', false, [0.35, 0.35]);
  const sMat = new THREE.MeshPhysicalMaterial({ map: sMap, normalMap: sN, normalScale: new THREE.Vector2(0.4, 0.4), color: '#efece6', roughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.3 }); dis.push(sMat);
  const sw = W / 4, sd = D / 3, sg = new RoundedBoxGeometry(sw - 0.012, 0.04, sd - 0.012, 2, 0.005); dis.push(sg);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const m = new THREE.Mesh(sg, sMat); m.position.set(-W / 2 + sw / 2 + i * sw, 0, -D / 2 + sd / 2 + j * sd); m.castShadow = m.receiveShadow = true; slabs.add(m); }
  slabs.position.y = slabs.userData.y; block.add(slabs); parts.push(slabs);
  // fall arrows: chevrons that travel across the slab surface to a channel drain
  const drain = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, D), new THREE.MeshStandardMaterial({ color: '#2a2b2c', metalness: 0.6, roughness: 0.4 }));
  drain.position.set(W / 2 + 0.07, 0, 0); slabs.add(drain); dis.push(drain.geometry, drain.material as THREE.Material);
  const chevMat = new THREE.MeshBasicMaterial({ color: '#E9E2C9', transparent: true, opacity: 0 }); dis.push(chevMat);
  const chevShape = new THREE.Shape(); chevShape.moveTo(0, 0); chevShape.lineTo(0.12, 0.12); chevShape.lineTo(0, 0.24); chevShape.lineTo(-0.05, 0.24); chevShape.lineTo(0.07, 0.12); chevShape.lineTo(-0.05, 0);
  const chevGeo = new THREE.ShapeGeometry(chevShape); chevGeo.rotateX(-Math.PI / 2); chevGeo.translate(0, 0.03, 0.12); dis.push(chevGeo);
  const chevs: THREE.Mesh[] = [];
  for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(chevGeo, chevMat); c.userData = { i, k }; slabs.add(c); chevs.push(c); }

  let target = 0, shown = -1, vis = false, raf = 0, last = -1;
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    r.setSize(w, h, false); cam.aspect = w / h;
    if (w >= 900) cam.setViewOffset(w, h, -w * 0.01, -h * 0.08, w, h); else cam.setViewOffset(w, h, 0, h * 0.02, w, h);
    cam.updateProjectionMatrix(); need = true;
  };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) loop(); }, { rootMargin: '200px' }); io.observe(host);

  const look = new THREE.Vector3(0, 0, 0);
  function apply(p: number, t: number) {
    const open = eInOut(clamp((p - 0.04) / 0.5));               // explode
    const close = eInOut(clamp((p - 0.84) / 0.14));             // settle back, no overshoot
    const gap = open * (1 - close);
    // the layer being described lifts a touch further and warms up; weights blend so nothing ever snaps
    parts.forEach((m, i) => {
      const f = focus(p, i) * gap;
      m.position.y = (m.userData.y as number) + gap * i * 0.42 + 0.07 * f;
      const mm = m instanceof THREE.Mesh ? (m.material as THREE.MeshStandardMaterial) : sMat;
      mm.emissive.setRGB(0.23 * f, 0.19 * f, 0.125 * f);
    });
    const fall = smooth(clamp((p - 0.64) / 0.1)) * (1 - smooth(clamp((p - 0.82) / 0.08)));
    chevMat.opacity = fall * 0.95;
    slabs.rotation.z = -fall * 0.035;
    chevs.forEach((c) => { const u = ((t * 0.00035 + c.userData.i / 5) % 1); c.position.set(-W / 2 + 0.2 + u * (W - 0.4), 0, -D / 2 + 0.35 + c.userData.k * 0.75); c.scale.setScalar(Math.sin(u * Math.PI)); });
    block.rotation.y = -0.6 + smooth(p) * 0.5 + Math.sin(t * 0.0003) * 0.02;
    const fit = (w() < 900 ? 1.45 : 1) * (1 + gap * 0.2);   // ease the camera back as the stack opens, so it never crowds the heading
    cam.position.set(5.6 * fit, (3.2 + gap * 0.8) * fit, 6.8 * fit); look.set(0, 0.3 + gap * 0.95, 0); cam.lookAt(look);
  }
  const w = () => host.clientWidth;
  function loop() {
    cancelAnimationFrame(raf);
    const tick = (now: number) => {
      if (!vis) { last = -1; return; }
      const dt = last < 0 ? 16 : Math.min(64, now - last); last = now;
      const next = shown < 0 ? target : shown + (target - shown) * (1 - Math.exp(-dt / 140));
      const fallOn = shown > 0.62 && shown < 0.92;
      if (Math.abs(next - shown) > 0.00002 || need || fallOn) { shown = Math.abs(target - next) < 0.0001 ? target : next; apply(shown, now); r.render(scene, cam); need = false; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  apply(0, 0);
  return {
    setProgress(p) { target = clamp(p); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); dis.forEach((d) => d.dispose()); r.dispose(); },
  };
}

function weave() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
  g.fillStyle = '#cfcdc6'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 4) { g.fillStyle = i % 8 ? '#bdbab2' : '#e2e0da'; g.fillRect(i, 0, 2, 128); g.fillRect(0, i, 128, 1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 4); t.colorSpace = THREE.SRGBColorSpace; return t;
}
