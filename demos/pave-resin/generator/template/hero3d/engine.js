// Pave Resin hero: lay a new surface over a cracked old drive, in three.js.
// Ported from the Wolverhampton Driveways brick-drop engine (instanced pieces dropping in with shadows, idle-time
// build + shader warm-up, the cracked-concrete ground, pause off-screen, lower pixel ratio on phones) and the
// Proficient Essex pour hero (a brush that follows the finger or mouse, data-nopour, a path player for auto-play).
// Colours are Pave's own, read from the previous hero renderer (surface-gen.js): see PAL below.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ---- Pave palette (unchanged from the live hero) ----
const PAL = {
  block: { char: ['#3c3d40', '#47484c', '#333437', '#525357'], silv: ['#8e9093', '#7d7f83', '#a0a2a5'], silvShare: 0.3, joint: '#24221f', soldier: ['#2e2f32', '#38393c'] },
  porcelain: { tone: 196, spread: 14, tint: [1, 1.004, 1.012], grout: '#45474a', bed: '#26241f' },
  kerb: { tone: 168, tint: [1, 0.985, 0.96] },
};
const U = 0.1, BTH = 0.06, PTH = 0.025, KH = 0.07;       // block unit (200 x 100 mm pavers), block / slab / kerb heights
const SW = 0.9, SD = 0.6;                                  // porcelain slabs
// metres across the middle of the screen, per surface (close enough to see stones in resin; wide for slabs)
const FRAME = { portrait: { resin: 1.1, tarmac: 1.8, block: 2.6, porcelain: 4.0 }, landscape: { resin: 2.0, tarmac: 3.0, block: 4.4, porcelain: 6.4 } };
const PITCH = 41 * Math.PI / 180;
const OPEN = { portrait: 0.39, landscape: 0.46 };       // where the auto-play strip runs (fraction of hero height)

export function initHero(host, cv, opts) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance', alpha: false }); } catch { return null; }
  if (!renderer.getContext()) return null;
  const coarse = matchMedia('(pointer:coarse)').matches;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;               // keep Pave's exact surface colours
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const bg = new THREE.Color(opts.bg || '#0B0C0F');
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 8, 20);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env; scene.environmentIntensity = 0.16;
  const LK = opts.light || 1;
  const SK = { block: 0.7, resin: 0.69, tarmac: 0.23, porcelain: 0.86 }; // per-surface exposure, calibrated to the old hero's colours
  const hemi = new THREE.HemisphereLight('#ffffff', '#1a1c20', 0.95 * LK); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffffff', 2.25 * LK);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015; sun.shadow.radius = 5; sun.shadow.blurSamples = 12;
  scene.add(sun, sun.target);
  // cobalt work lamp hanging over the far end of the drive: it is what the wet resin and fresh tarmac reflect
  const lamp = new THREE.PointLight('#4C86F5', 0, 30, 1.6); scene.add(lamp);

  const cam = new THREE.PerspectiveCamera(50, 1, 0.05, 80);
  const look = new THREE.Vector3();
  let W = 1, H = 1, portrait = true;
  const camFor = (k) => {
    const wm = FRAME[portrait ? 'portrait' : 'landscape'][k];
    const vf = portrait ? 56 : 36, hf = 2 * Math.atan(Math.tan(vf * Math.PI / 360) * (W / H));
    const D = wm / (2 * Math.tan(hf / 2));
    return { wm, vf, D };
  };
  let camK = 'block', camT0 = -1, camFrom = null;
  const poseOf = (k) => { const c = camFor(k); return { fov: c.vf, D: c.D, wm: c.wm }; };
  function applyPose(p) {
    cam.fov = p.fov; look.set(0, 0, 0);
    cam.position.set(0, Math.sin(PITCH) * p.D, Math.cos(PITCH) * p.D);
    cam.updateProjectionMatrix(); cam.lookAt(look); cam.updateMatrixWorld();
    // sun from the top left, behind; shadow box covers what this pose sees
    sun.position.set(-0.55 * p.D, 1.25 * p.D, -0.7 * p.D); sun.target.position.set(0, 0, -0.3 * p.D);
    const s = p.D * 1.3; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.1, far: p.D * 4 }); sun.shadow.camera.updateProjectionMatrix();
    lamp.position.set(0.15 * p.wm, 0.9 * p.wm, -1.35 * p.D); lamp.distance = p.D * 3;
    scene.fog.near = p.D * 1.5; scene.fog.far = p.D * 4.4;
  }
  const frame = () => {
    W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
    const was = portrait; portrait = W / H < 1;
    renderer.setSize(W, H, false); cam.aspect = W / H;
    applyPose(poseOf(camK));
    if (was !== portrait) { layers.forEach((L) => L.dispose()); layers.clear(); if (cur) start(cur, 'reset'); }
  };

  // ---- ground: the tired, cracked drive (Wolverhampton's baked CC0 cracked concrete) ----
  const tl = new THREE.TextureLoader();
  let pending = 2, dead = false;
  const ready = () => { if (--pending === 0 && !dead) { api.loaded = true; opts.onReady && opts.onReady(); } };
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const tex = (f, srgb) => { const t = tl.load(opts.tex + f, ready, undefined, ready); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const gMap = tex(coarse ? 'ground-1k-v2.webp' : 'ground-v2.webp', true), gNor = tex(coarse ? 'ground-n-1k-v2.jpg' : 'ground-n-v2.jpg', false);
  for (const t of [gMap, gNor]) { t.repeat.set(9, 9); t.rotation = 0.35; }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: gMap, normalMap: gNor, normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.95, color: '#77787b' }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // ---- shared bits ----
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const uTime = { value: 0 };
  const clock = new THREE.Timer();
  const now = () => clock.getElapsed();
  // value-noise canvas texture (mean ~1 after the material colour), for block faces and slab clouding
  function noiseTex(n, cells, amp, base) {
    const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), im = g.createImageData(n, n), d = im.data;
    const hs = (x, y) => { let h = (x * 374761393 + y * 668265263 + 99 * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
    const vn = (x, y, Q) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = (a) => ((a % Q) + Q) % Q;
      const a = hs(w(xi), w(yi)), b = hs(w(xi + 1), w(yi)), cc = hs(w(xi), w(yi + 1)), dd = hs(w(xi + 1), w(yi + 1)); return a + (b - a) * u + (cc - a) * v + (a - b - cc + dd) * u * v; };
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = base + vn(x / n * cells, y / n * cells, cells) * amp[0] + vn(x / n * cells * 5, y / n * cells * 5, cells * 5) * amp[1] + (Math.random() - 0.5) * amp[2], i = (y * n + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v * 255)); d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  // drop animation for every instanced piece (from Wolverhampton): aT0 = when it starts falling, aSeed = variety
  const dropShader = (dur, h, bounce) => (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; attribute float aT0; attribute float aSeed;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float kk = clamp((uTime - aT0) / ${dur.toFixed(3)}, 0.0, 1.0);
        float ee = kk * kk;
        float sw = 1.0 - kk;
        float ax = (fract(aSeed * 13.7) - 0.5) * 0.22 * sw * sw, az = (fract(aSeed * 7.3) - 0.5) * 0.22 * sw * sw;
        transformed.yz = mat2(cos(ax), sin(ax), -sin(ax), cos(ax)) * transformed.yz;
        transformed.xy = mat2(cos(az), sin(az), -sin(az), cos(az)) * transformed.xy;
        float bt = uTime - aT0 - ${dur.toFixed(3)};
        transformed.y += ${h.toFixed(3)} * (0.85 + 0.3 * fract(aSeed * 3.1)) * (1.0 - ee) + (bt > 0.0 ? max(0.0, sin(bt * 24.0) * ${bounce.toFixed(4)} * exp(-bt * 13.0)) : 0.0);
        if (uTime < aT0) transformed *= 0.0;`);
  };
  const uvShift = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
      #ifdef USE_MAP
        vMapUv += vec2(fract(aSeed * 5.13), fract(aSeed * 9.71));
      #endif`);
  };
  // the bed under a piece shows from the moment it lands (joint sand); \`fill\` > 0 fades it to grout afterwards
  const bedShader = (dur, fill, c0, c1) => (sh) => {
    sh.uniforms.uTime = uTime; sh.uniforms.uC0 = { value: new THREE.Color(c0) }; sh.uniforms.uC1 = { value: new THREE.Color(c1) };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
        uniform float uTime; attribute float aT0; varying float vF;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float lt = uTime - aT0 - ${(dur * 0.85).toFixed(3)};
        vF = ${fill > 0 ? `clamp((lt - 0.25) / ${fill.toFixed(3)}, 0.0, 1.0)` : '1.0'};
        if (lt < 0.0) transformed *= 0.0;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n uniform vec3 uC0; uniform vec3 uC1; varying float vF;')
      .replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = mix(uC0, uC1, vF);');
  };

  // which ground a pose can see (rays through the screen corners), so pieces off-screen are never built
  const ray = new THREE.Raycaster(), V2 = new THREE.Vector2(), HP = new THREE.Vector3(), PL = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hitAt = (sx, sy) => { V2.set(sx * 2 - 1, -(sy * 2 - 1)); ray.setFromCamera(V2, cam); return ray.ray.intersectPlane(PL, HP) ? HP.clone() : null; };
  function view(margin = 0.25) {
    const pts = [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0]].map(([x, y]) => hitAt(x, y) || new THREE.Vector3(x ? 30 : -30, 0, -60));
    const xs = pts.map((p) => p.x), zs = pts.map((p) => p.z);
    const zFar = Math.max(Math.min(...zs), cam.position.z - Math.cos(PITCH) * 0 - scene.fog.far * 1.02);
    return { x0: Math.min(...xs) - margin, x1: Math.max(...xs) + margin, zFar: zFar - margin, zNear: Math.max(...zs) + margin, pts };
  }
  const frus = new THREE.Frustum(), bx = new THREE.Box3(), PM = new THREE.Matrix4();
  const seen = (x, z, r) => { PM.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); frus.setFromProjectionMatrix(PM); bx.min.set(x - r, 0, z - r); bx.max.set(x + r, 0.3, z + r); return frus.intersectsBox(bx) && cam.position.distanceTo(new THREE.Vector3(x, 0, z)) < scene.fog.far * 1.05; };

  // ---- piece layers (block paving, porcelain, kerbs): one InstancedMesh per size, animated in the shader ----
  function pieceSet(group, pieces, o) {
    const geo = new RoundedBoxGeometry(o.w - o.joint, o.th, o.d - o.joint, 2, o.r);
    geo.translate(0, o.th / 2, 0);
    const n = pieces.length;
    const aT0 = new Float32Array(n).fill(1e9), aSeed = new Float32Array(n), px = new Float32Array(n), pz = new Float32Array(n);
    const im = new THREE.InstancedMesh(geo, o.mat, n);
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
    pieces.forEach((p, i) => { M.compose(P.set(p.x, 0, p.z), Q.setFromAxisAngle(Y, p.ry || 0), S); im.setMatrixAt(i, M); im.setColorAt(i, p.c); px[i] = p.x; pz[i] = p.z; aSeed[i] = rnd(); });
    const attr = new THREE.InstancedBufferAttribute(aT0, 1); attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aT0', attr); geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1));
    im.castShadow = true; im.receiveShadow = true; im.customDepthMaterial = o.depth; im.frustumCulled = false;
    group.add(im);
    let bedM = null;
    if (o.bed) { // bed tile under each piece: same instance matrices and start times, full cell size
      const bg = new THREE.PlaneGeometry(o.w + 0.002, o.d + 0.002); bg.rotateX(-Math.PI / 2); bg.translate(0, 0.0015, 0);
      bg.setAttribute('aT0', attr);
      bedM = new THREE.InstancedMesh(bg, o.bed, n); bedM.instanceMatrix = im.instanceMatrix; bedM.receiveShadow = true; bedM.frustumCulled = false; group.add(bedM);
    }
    return { im, bedM, attr, aT0, px, pz, n, geo, dirty: false };
  }
  function pieceLayer(kind) {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const v = view(0.4), sets = [], mats = [];
    let dur = 0.42, h = 0.55;
    const clip = [];
    if (kind === 'block') {
      // left edge of the drive in view at about 13% across the middle of the screen; a charcoal soldier course runs along it
      const XL = v.x0 - 3 * U, ZF = v.zNear + 3 * U; // edges off-screen: the surface covers the whole hero
      clip.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), -(XL + 2 * U)), new THREE.Plane(new THREE.Vector3(0, 0, -1), ZF - 2 * U));
      const c45 = Math.SQRT1_2, fld = [], sold = [];
      const col = () => { const r = rnd(); const a = r < PAL.block.silvShare ? PAL.block.silv : PAL.block.char; return new THREE.Color(a[Math.floor(rnd() * a.length)]).multiplyScalar(0.93 + rnd() * 0.14); };
      // 45° herringbone, the same lattice as the previous hero: X across, Y back from the front edge, in 100 mm units
      const toU = (X, Y) => [(X + Y) * c45 / U, (-X + Y) * c45 / U];
      const cs = [[v.x0 - XL, 0], [v.x1 - XL, 0], [v.x0 - XL, ZF - v.zFar], [v.x1 - XL, ZF - v.zFar]].map(([X, Y]) => toU(X, Y));
      const umin = Math.min(...cs.map((c) => c[0])), umax = Math.max(...cs.map((c) => c[0])), vmin = Math.min(...cs.map((c) => c[1])), vmax = Math.max(...cs.map((c) => c[1]));
      for (let k = Math.floor((umin + vmin) / 2) - 3; k <= Math.ceil((umax + vmax) / 2) + 3; k++) for (let s = Math.floor((umin - vmax) / 4) - 3; s <= Math.ceil((umax - vmin) / 4) + 3; s++) {
        for (const [uc, vc, ry] of [[k + 2 * s + 1, k - 2 * s + 0.5, Math.PI / 4], [k + 2 * s + 0.5, k - 2 * s + 2, -Math.PI / 4]]) {
          const X = (uc - vc) * c45 * U, Y = (uc + vc) * c45 * U, x = XL + X, z = ZF - Y;
          if (X < 2 * U - 0.16 || Y < 2 * U - 0.16 || z < v.zFar || x > v.x1) continue;
          if (!seen(x, z, 0.16)) continue;
          fld.push({ x, z, ry, c: col() });
        }
      }
      // soldier course: along the left edge (200 mm across x) and the front (200 mm deep)
      for (let z = ZF - U / 2; z > v.zFar; z -= U) if (seen(XL + U, z, 0.15)) sold.push({ x: XL + U, z, ry: 0, c: new THREE.Color(PAL.block.soldier[Math.floor(rnd() * 2)]).multiplyScalar(0.94 + rnd() * 0.12) });
      for (let x = XL + 2 * U + U / 2; x < v.x1; x += U) if (seen(x, ZF - U, 0.15)) sold.push({ x, z: ZF - U, ry: Math.PI / 2, c: new THREE.Color(PAL.block.soldier[Math.floor(rnd() * 2)]).multiplyScalar(0.94 + rnd() * 0.12) });
      const nt = noiseTex(256, 8, [0.12, 0.06, 0.1], 0.86); nt.repeat.set(0.5, 0.5);
      const mk = (cl) => { const m = new THREE.MeshStandardMaterial({ map: nt, roughness: 0.86, metalness: 0, clippingPlanes: cl }); m.onBeforeCompile = (sh) => { dropShader(dur, h, 0.006)(sh); uvShift(sh); }; mats.push(m); return m; };
      const dp = (cl) => { const d = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, clippingPlanes: cl }); d.onBeforeCompile = dropShader(dur, h, 0.006); mats.push(d); return d; };
      const bedM = (cl) => { const m = new THREE.MeshStandardMaterial({ roughness: 1, clippingPlanes: cl }); m.onBeforeCompile = bedShader(dur, 0, PAL.block.joint, PAL.block.joint); mats.push(m); return m; };
      sets.push(pieceSet(g, fld, { w: 2 * U, d: U, th: BTH, joint: 0.006, r: 0.006, mat: mk(clip), depth: dp(clip), bed: bedM(clip) }));
      sets.push(pieceSet(g, sold, { w: 2 * U, d: U, th: BTH, joint: 0.006, r: 0.006, mat: mk([]), depth: dp([]), bed: bedM([]) }));
    } else if (kind === 'porcelain') {
      dur = 0.5; h = 0.6;
      const P = PAL.porcelain, out = [];
      const r0 = 0, r1 = Math.ceil((v.zNear - v.zFar) / SD) + 1;
      for (let r = r0; r < r1; r++) {
        const z = v.zNear - (r + 0.5) * SD, off = (r & 1) * SW / 2;
        for (let x = Math.floor((v.x0 - off) / SW) * SW + off + SW / 2; x < v.x1 + SW; x += SW) {
          if (!seen(x, z, 0.55)) continue;
          const t = (P.tone + (rnd() - 0.5) * P.spread) / 255;
          out.push({ x, z, ry: 0, c: new THREE.Color().setRGB(t * P.tint[0], t * P.tint[1], t * P.tint[2], THREE.SRGBColorSpace) });
        }
      }
      const nt = noiseTex(512, 6, [0.07, 0.03, 0.035], 0.95); nt.repeat.set(0.45, 0.45);
      const m = new THREE.MeshStandardMaterial({ map: nt, roughness: 0.55, metalness: 0, envMapIntensity: 0.9 }); m.onBeforeCompile = (sh) => { dropShader(dur, h, 0.009)(sh); uvShift(sh); }; mats.push(m);
      const d = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }); d.onBeforeCompile = dropShader(dur, h, 0.009); mats.push(d);
      const b = new THREE.MeshStandardMaterial({ roughness: 1 }); b.onBeforeCompile = bedShader(dur, 0.45, P.bed, P.grout); mats.push(b);
      sets.push(pieceSet(g, out, { w: SW, d: SD, th: PTH, joint: 0.006, r: 0.004, mat: m, depth: d, bed: b }));
    }
    const all = () => sets;
    const L = {
      kind, group: g, sets, pieces: true, start: 0,
      // drop every piece within the brush (an ellipse, wider than deep) that has not gone down yet
      brush(x, z, r, t) {
        let n = 0;
        for (const s of sets) for (let i = 0; i < s.n; i++) {
          if (s.aT0[i] < 1e8) continue;
          const d = Math.hypot((s.px[i] - x) / r, (s.pz[i] - z) / (r * 0.7));
          if (d < 1) { s.aT0[i] = t + d * 0.16 + (n++) * 0.0025; s.dirty = true; }
        }
        return n;
      },
      // everything still to go, far to near then left to right, over \`span\` seconds
      sweep(t, span) {
        let zf = 1e9, zn = -1e9, x0 = 1e9, x1 = -1e9;
        for (const s of sets) for (let i = 0; i < s.n; i++) if (s.aT0[i] > 1e8) { zf = Math.min(zf, s.pz[i]); zn = Math.max(zn, s.pz[i]); x0 = Math.min(x0, s.px[i]); x1 = Math.max(x1, s.px[i]); }
        const dz = zn - zf || 1, dx = x1 - x0 || 1;
        for (const s of sets) { for (let i = 0; i < s.n; i++) if (s.aT0[i] > 1e8) s.aT0[i] = t + ((s.pz[i] - zf) / dz) * span * 0.8 + ((s.px[i] - x0) / dx) * span * 0.2; s.dirty = true; }
      },
      // pre-laid: every piece above screen line \`sy\` is already down
      laidAbove(sy) {
        const V = new THREE.Vector3();
        for (const s of sets) { for (let i = 0; i < s.n; i++) { V.set(s.px[i], 0, s.pz[i]).project(cam); if ((1 - V.y) / 2 < sy) s.aT0[i] = -100; } s.dirty = true; }
      },
      fill() { for (const s of sets) { s.aT0.fill(-100); s.dirty = true; } },
      clear() { for (const s of sets) { s.aT0.fill(1e9); s.dirty = true; } },
      done() { for (const s of sets) for (let i = 0; i < s.n; i++) if (s.aT0[i] > 1e8 || s.aT0[i] > uTime.value - dur) return false; return true; },
      tick() { for (const s of sets) if (s.dirty) { s.attr.needsUpdate = true; s.dirty = false; } },
      dispose() { scene.remove(g); sets.forEach((s) => { s.geo.dispose(); s.bedM && s.bedM.geometry.dispose(); }); mats.forEach((m) => { m.map && m.map.dispose(); m.dispose(); }); },
    };
    return L;
  }

  // ---- poured / rolled layers (resin, tarmac): the brush paints a mask; the surface shows where the mask is ----
  // mask R = laid, G = wet (fades as it cures). Resin spreads and levels behind the stroke; tarmac goes down in
  // straight-edged roller bands with a kerb along the left edge.
  const texJobs = new Map();
  let wk = null;
  function tileTex(kind) {
    if (texJobs.has(kind)) return texJobs.get(kind);
    const N = kind === 'resin' ? (coarse ? 1536 : 2048) : (coarse ? 1024 : 2048);
    const P = kind === 'resin' ? Math.round(N / 1536 * 450) : N / 1024 * 1000;
    const p = new Promise((res) => {
      const done = (d) => {
        const mkT = (arr, srgb) => { const t = new THREE.DataTexture(arr, N, N, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.flipY = true; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
        res({ map: mkT(new Uint8Array(d.alb.buffer), true), normal: mkT(new Uint8Array(d.nrm.buffer), false), tile: d.tile });
      };
      if (opts.worker && typeof Worker !== 'undefined') {
        wk = wk || new Worker(opts.worker);
        const id = kind + Math.random();
        const on = (e) => { if (e.data.id !== id) return; wk.removeEventListener('message', on); done(e.data); };
        wk.addEventListener('message', on); wk.postMessage({ id, kind, N, P });
      } else if (typeof genTile === 'function') done(genTile(kind, N, P)); // eslint-disable-line no-undef
    });
    texJobs.set(kind, p); return p;
  }
  function maskLayer(kind) {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const v = view(0.6);
    const ppm = Math.min(150, 1100 / Math.max(v.x1 - v.x0, v.zNear - v.zFar));
    const MW = Math.ceil((v.x1 - v.x0) * ppm), MH = Math.ceil((v.zNear - v.zFar) * ppm);
    const mask = document.createElement('canvas'); mask.width = MW; mask.height = MH;
    const mc = mask.getContext('2d', { willReadFrequently: false }); mc.fillStyle = '#000'; mc.fillRect(0, 0, MW, MH);
    const scratch = document.createElement('canvas'); scratch.width = MW; scratch.height = MH; const sc = scratch.getContext('2d');
    const mt = new THREE.CanvasTexture(mask); mt.minFilter = THREE.LinearFilter; mt.generateMipmaps = false;
    const uM = { value: mt }, uR = { value: new THREE.Vector4(v.x0, v.zFar, v.x1 - v.x0, v.zNear - v.zFar) };
    const resin = kind === 'resin';
    let XL = v.x0;
    if (!resin) XL = v.x0 - 1; // kerb off-screen: tarmac covers the whole hero
    const mat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: resin ? 0.5 : 0.72, metalness: 0, clearcoat: resin ? 0.3 : 0.05, clearcoatRoughness: resin ? 0.4 : 0.6, envMapIntensity: resin ? 0.9 : 0.6, normalScale: new THREE.Vector2(resin ? 1.1 : 0.45, resin ? 1.1 : 0.45) });
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uM = uM; sh.uniforms.uR = uR; sh.uniforms.uXL = { value: resin ? -1e9 : XL + 0.125 };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n varying vec3 vW;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        uniform sampler2D uM; uniform vec4 uR; uniform float uXL; varying vec3 vW;
        float hh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float nn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hh(i), hh(i + vec2(1, 0)), f.x), mix(hh(i + vec2(0, 1)), hh(i + vec2(1, 1)), f.x), f.y); }`)
        .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
          vec2 muv = vec2((vW.x - uR.x) / uR.z, (vW.z - uR.y) / uR.w);
          vec4 mk = texture2D(uM, vec2(muv.x, 1.0 - muv.y));
          float cov = mk.r + ${resin ? '(nn(vW.xz * 9.0) - 0.5) * 0.22 + (nn(vW.xz * 40.0) - 0.5) * 0.08' : '(nn(vW.xz * 30.0) - 0.5) * 0.05'};
          if (cov < 0.45 || vW.x < uXL) discard;
          float wet = mk.g * smoothstep(0.45, 0.75, cov);
          float rim = 1.0 - smoothstep(0.45, ${resin ? '0.6' : '0.5'}, cov);`)
        .replace('#include <map_fragment>', `#include <map_fragment>
          diffuseColor.rgb *= mix(1.0, ${resin ? '0.8' : '0.86'}, wet) * (1.0 - rim * 0.35);`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          roughnessFactor = mix(roughnessFactor, ${resin ? '0.07' : '0.2'}, wet);`);
    };
    const PW = v.x1 - v.x0, PD = v.zNear - v.zFar;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), mat);
    m.rotation.x = -Math.PI / 2; m.position.set((v.x0 + v.x1) / 2, resin ? 0.004 : 0.006, (v.zFar + v.zNear) / 2); m.receiveShadow = true;
    g.add(m);
    let haveTex = false;
    tileTex(kind).then((t) => {
      if (dead) return;
      mat.map = t.map; mat.normalMap = t.normal;
      const geoUV = m.geometry.attributes.uv; // world-scaled repeat
      const ts = t.tile * (resin ? 3.4 : 3.2); // stones drawn larger than life so they read as stones at hero scale
      for (const tt of [t.map, t.normal]) tt.repeat.set(PW / ts, PD / ts);
      mat.needsUpdate = true; haveTex = true; geoUV.needsUpdate = true;
    });
    // tarmac: concrete kerb along the left edge, 125 mm wide, units of 914 mm
    let kerb = null;
    if (!resin) {
      const out = [];
      for (let z = v.zNear - 0.457; z > v.zFar - 0.5; z -= 0.914) if (seen(XL + 0.0625, z, 0.5)) { const t = (PAL.kerb.tone + (rnd() - 0.5) * 10) / 255; out.push({ x: XL + 0.0625, z, ry: Math.PI / 2, c: new THREE.Color().setRGB(t, t * PAL.kerb.tint[1], t * PAL.kerb.tint[2], THREE.SRGBColorSpace) }); }
      const nt = noiseTex(256, 6, [0.14, 0.08, 0.12], 0.86); nt.repeat.set(1, 0.2);
      const km = new THREE.MeshStandardMaterial({ map: nt, roughness: 0.9 }); km.onBeforeCompile = (sh) => { dropShader(0.35, 0.3, 0.004)(sh); uvShift(sh); };
      const kd = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }); kd.onBeforeCompile = dropShader(0.35, 0.3, 0.004);
      kerb = pieceSet(g, out, { w: 0.914, d: 0.125, th: KH, joint: 0.006, r: 0.012, mat: km, depth: kd });
      kerb.mats = [km, kd];
    }
    let spread = 0, dirty = true, last = null;
    const toM = (x, z) => [(x - v.x0) * ppm, (z - v.zFar) * ppm];
    function dab(x, z, r, a) {
      const [mx, my] = toM(x, z), R = r * ppm;
      const gr = mc.createRadialGradient(mx, my, 0, mx, my, R);
      gr.addColorStop(0, `rgba(255,255,0,${a})`); gr.addColorStop(0.55, `rgba(255,255,0,${a * 0.8})`); gr.addColorStop(1, 'rgba(255,255,0,0)');
      mc.globalCompositeOperation = 'lighten'; mc.fillStyle = gr; mc.beginPath(); mc.arc(mx, my, R, 0, 7); mc.fill(); mc.globalCompositeOperation = 'source-over';
      spread = Math.min(resin ? 60 : 6, spread + (resin ? 9 : 2)); dirty = true;
    }
    function band(x0, z0, x1, z1, w) { // a roller pass: a straight band with square ends
      const [a, b] = toM(x0, z0), [c, d] = toM(x1, z1);
      mc.globalCompositeOperation = 'lighten'; mc.strokeStyle = 'rgb(255,255,0)'; mc.lineWidth = w * ppm; mc.lineCap = 'butt';
      mc.beginPath(); mc.moveTo(a, b); mc.lineTo(c, d); mc.stroke(); mc.globalCompositeOperation = 'source-over';
      spread = Math.min(4, spread + 1); dirty = true;
    }
    function level() {
      if (spread <= 0) return;
      sc.globalCompositeOperation = 'copy'; sc.drawImage(mask, 0, 0);
      mc.globalCompositeOperation = 'lighten'; mc.globalAlpha = resin ? 0.9 : 0.6;
      const k = resin ? 1.2 : 0.7;
      mc.drawImage(scratch, k, 0); mc.drawImage(scratch, -k, 0); mc.drawImage(scratch, 0, k); mc.drawImage(scratch, 0, -k);
      mc.globalAlpha = 1; mc.globalCompositeOperation = 'source-over'; spread--; dirty = true;
    }
    let lastCure = 0;
    function cure(t) { // the wet sheen dries to satin (resin) / matt (tarmac) over ~2 s
      if (t - lastCure < 0.05) return; lastCure = t;
      mc.globalCompositeOperation = 'multiply'; mc.fillStyle = resin ? 'rgb(255,246,255)' : 'rgb(255,243,255)'; mc.fillRect(0, 0, MW, MH); mc.globalCompositeOperation = 'source-over'; dirty = true;
    }
    let kerbDown = false;
    const L = {
      kind, group: g, pieces: false, start: 0,
      brush(x, z, r, t) {
        if (kerb && !kerbDown) { kerbDown = true; for (let i = 0; i < kerb.n; i++) kerb.aT0[i] = t + (kerb.pz[i] - v.zFar) / (v.zNear - v.zFar) * 0.4; kerb.dirty = true; }
        if (resin) { if (last) { const d = Math.hypot(x - last[0], z - last[1]), st = Math.max(1, Math.ceil(d / (r * 0.3))); for (let i = 1; i <= st; i++) dab(last[0] + (x - last[0]) * i / st, last[1] + (z - last[1]) * i / st, r, 0.6); } else dab(x, z, r * 1.15, 0.92); }
        else { if (last) band(last[0], last[1], x, z, r * 1.5); else band(x - r * 0.4, z, x + r * 0.4, z, r * 1.5); }
        last = [x, z]; return 1;
      },
      lift() { last = null; },
      sweep(t, span) { L.fillAt = t + span; L.fillSpan = span; L.fillT0 = t; },
      laidAbove(sy) { const V = new THREE.Vector3(); for (let y = 0; y < MH; y += 2) { const z = v.zFar + y / ppm; V.set((v.x0 + v.x1) / 2, 0, z).project(cam); if ((1 - V.y) / 2 < sy) { mc.fillStyle = 'rgb(255,0,0)'; mc.fillRect(0, y, MW, 2); } } dirty = true; if (kerb) { kerb.aT0.fill(-100); kerb.dirty = true; kerbDown = true; } },
      fill() { mc.fillStyle = 'rgb(255,0,0)'; mc.fillRect(0, 0, MW, MH); dirty = true; if (kerb) { kerb.aT0.fill(-100); kerb.dirty = true; kerbDown = true; } },
      clear() { mc.fillStyle = '#000'; mc.fillRect(0, 0, MW, MH); dirty = true; last = null; kerbDown = false; L.fillAt = 0; if (kerb) { kerb.aT0.fill(1e9); kerb.dirty = true; } },
      done() { return !L.fillAt && L.filled; },
      tick(t) {
        if (L.fillAt) { // "Lay the rest": rows of pour/roll from the back to the front
          const k = Math.min(1, (t - L.fillT0) / L.fillSpan), rows = resin ? 7 : 9, y = k * MH;
          if (kerb && !kerbDown) L.brush(v.x0, v.zFar, 0.1, t), L.lift();
          mc.globalCompositeOperation = 'lighten'; mc.fillStyle = 'rgb(255,255,0)';
          const edge = resin ? 0.06 * MH : 0; mc.fillRect(0, 0, MW, Math.max(0, y - edge));
          if (resin) { for (let i = 0; i < rows * 3; i++) dab(v.x0 + (i / (rows * 3)) * (v.x1 - v.x0), v.zFar + Math.max(0, y - edge) / ppm, (v.x1 - v.x0) / rows * 0.7, 0.7); }
          mc.globalCompositeOperation = 'source-over'; dirty = true;
          if (k >= 1) { L.fillAt = 0; L.filled = true; }
        }
        level(); cure(t);
        if (dirty && haveTex) { mt.needsUpdate = true; dirty = false; }
        if (kerb && kerb.dirty) { kerb.attr.needsUpdate = true; kerb.dirty = false; }
      },
      dispose() { scene.remove(g); m.geometry.dispose(); mat.dispose(); mt.dispose(); if (kerb) { kerb.geo.dispose(); kerb.mats.forEach((x) => x.dispose()); } },
    };
    return L;
  }

  // ---- surface switching (Wolverhampton's built-once, re-used layers; built in idle time) ----
  const layers = new Map();
  let cur = null, active = null, firstTouch = false;
  const build = (k) => { let L = layers.get(k); if (!L) { L = (k === 'resin' || k === 'tarmac') ? maskLayer(k) : pieceLayer(k); layers.set(k, L); } return L; };
  // mode: 'intro' (far part already laid, then the auto strip), 'reset' (cracked drive + short lay), 'fill' (finished)
  function start(k, mode) {
    const was = camK; camK = k;
    applyPose(poseOf(k)); // layers are laid out for their own camera pose
    const L = build(k);
    layers.forEach((o) => { o.group.visible = o === L; });
    L.clear(); L.filled = false; active = L; cur = k;
    const sk = (globalThis.__hpSK && globalThis.__hpSK[k]) || SK[k] || 1;
    hemi.intensity = 0.95 * LK * sk; sun.intensity = 2.25 * LK * sk; scene.environmentIntensity = 0.16 * sk;
    lamp.intensity = ((k === 'resin' || k === 'tarmac') ? 0.7 : 0.5) * sk;
    if (mode === 'fill' || RM) { L.fill(); L.filled = true; }
    else if (mode === 'intro') L.laidAbove(OPEN[portrait ? 'portrait' : 'landscape'] - 0.09);
    if (was !== k && camT0 >= 0) { /* pose already applied: a new surface starts on a reset drive, so a cut reads cleanly */ }
    return L;
  }

  // ---- input: the brush (Proficient) ----
  let lastPt = null, userStroke = false;
  const brushR = () => FRAME[portrait ? 'portrait' : 'landscape'][cur] * (cur === 'porcelain' ? 0.2 : cur === 'block' ? 0.16 : cur === 'tarmac' ? 0.13 : 0.12);
  function strokeAt(sx, sy, user) {
    if (!active) return;
    const p = hitAt(sx, sy); if (!p) return;
    const n = active.brush(p.x, p.z, brushR(), now());
    if (user && n && !userStroke) { userStroke = true; opts.onFirst && opts.onFirst(); }
  }
  const local = (e) => { const r = host.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  const blocked = (e) => !!(e.target && e.target.closest && e.target.closest('a,button,input,select,label,textarea,dialog,[data-nopour]'));
  const onMove = (e) => {
    if (RM || dead) return;
    if (blocked(e)) { lastPt = null; active && active.lift && active.lift(); return; }
    if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch' || e.pointerType === 'pen') {
      ghost = null; idleSince = performance.now();
      const [x, y] = local(e);
      if (lastPt) { const d = Math.hypot((x - lastPt[0]) * W, (y - lastPt[1]) * H), st = Math.max(1, Math.ceil(d / 14)); for (let i = 1; i <= st; i++) strokeAt(lastPt[0] + (x - lastPt[0]) * i / st, lastPt[1] + (y - lastPt[1]) * i / st, true); }
      else strokeAt(x, y, true);
      lastPt = [x, y];
    }
  };
  const onDown = (e) => { if (RM || blocked(e)) return; lastPt = null; onMove(e); };
  const onLeave = () => { lastPt = null; active && active.lift && active.lift(); };
  // (no pointer input: the hero lays itself)

  // ---- path player (Proficient's ghost): auto-lays a strip along a gentle curve ----
  let ghost = null, idleSince = performance.now();
  function play(dur, done) {
    const y0 = OPEN[portrait ? 'portrait' : 'landscape'];
    const path = portrait ? (t) => [1.06 - t * 1.12, y0 + Math.sin(t * Math.PI) * 0.035] : (t) => [0.96 - t * 0.62, y0 - 0.03 + Math.sin(t * Math.PI * 1.2) * 0.05];
    ghost = { path, dur, t0: performance.now(), prev: null, done };
    active && active.lift && active.lift();
  }
  function ghostStep() {
    if (!ghost) return;
    const k = Math.min(1, (performance.now() - ghost.t0) / ghost.dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [x, y] = ghost.path(e);
    if (ghost.prev) { const d = Math.hypot((x - ghost.prev[0]) * W, (y - ghost.prev[1]) * H), st = Math.max(1, Math.ceil(d / 14)); for (let i = 1; i <= st; i++) strokeAt(ghost.prev[0] + (x - ghost.prev[0]) * i / st, ghost.prev[1] + (y - ghost.prev[1]) * i / st, false); }
    else strokeAt(x, y, false);
    ghost.prev = [x, y];
    if (k >= 1) { const d = ghost.done; ghost = null; active && active.lift && active.lift(); d && d(); }
  }

  // ---- loop: pause off-screen; first frames compile shaders ----
  let raf = 0, visible = true, finishedSent = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { threshold: 0 });
  io.observe(host);
  const lost = (e) => { e.preventDefault(); opts.onLost && opts.onLost(); };
  cv.addEventListener('webglcontextlost', lost);
  const ro = new ResizeObserver(() => frame()); ro.observe(host);
  frame();
  function loop() {
    raf = 0; clock.update();
    if (dead || !visible) return;
    const t = now(); uTime.value = t;
    ghostStep();
    layers.forEach((L) => { if (L.group.visible) L.tick(t); });
    if (active && !finishedSent && userStroke && active.done && active.done()) { finishedSent = true; opts.onFinished && opts.onFinished(); }
    renderer.render(scene, cam);
    raf = requestAnimationFrame(loop);
  }

  const SPAN = { block: 2.0, resin: 2.1, tarmac: 2.1, porcelain: 1.6 }; // sweep seconds; + drop/fill time stays under 3 s
  const idle = (f) => (window.requestIdleCallback ? window.requestIdleCallback(f, { timeout: 1500 }) : setTimeout(f, 150));
  const api = {
    loaded: false, _dbg: { renderer, scene, cam, layers, tileTex },
    // first show: far drive already laid in this surface, near part cracked; after \`wait\` ms with no touch, a strip goes down
    intro(k, wait = 1500, onPlayed) {
      start(k, 'intro');
      if (RM) return;
      const t0 = performance.now();
      const tryPlay = () => { if (dead) return; if (userStroke) return; if (performance.now() - t0 < wait) return setTimeout(tryPlay, 120); play(portrait ? 1500 : 1900, onPlayed); };
      setTimeout(tryPlay, 120);
      // build the other surfaces while nobody is watching, then render each once hidden so their shaders compile now
      const todo = ['block', 'resin', 'tarmac', 'porcelain'].filter((x) => x !== k);
      const next = () => { if (dead) return; const n = todo.shift(); if (!n) return; if (n === 'resin' || n === 'tarmac') tileTex(n); idle(next); };
      setTimeout(() => idle(next), wait + 2400);
    },
    // a tile tap: reset to the cracked drive and auto-lay a short strip of the new surface across the middle
    surface(k, onPlayed) {
      finishedSent = false; userStroke = false; ghost = null;
      start(k, 'reset');
      if (RM) return;
      play(1200, onPlayed);
    },
    // automatic: reset to the old drive (optionally with the far part already down, matching the poster) and lay everything
    auto(k, above = 0) {
      finishedSent = false; userStroke = true; ghost = null;
      const L = start(k, 'reset');
      if (RM) { L.fill(); return; }
      if (above) L.laidAbove(above === true ? OPEN[portrait ? 'portrait' : 'landscape'] - 0.09 : above);
      if (!globalThis.__hpHold) L.sweep(now(), SPAN[k]); // __hpHold: poster capture only
    },
    // build every surface's textures and shaders straight away (idle time), so a tile tap lays at once
    prebuild(k) {
      const todo = ['block', 'resin', 'tarmac', 'porcelain'].filter((x) => x !== k);
      const next = () => { if (dead) return; const n = todo.shift(); if (!n) return; if (n === 'resin' || n === 'tarmac') tileTex(n); idle(next); };
      idle(next);
    },
    finish() { if (!active) return; active.sweep(now(), cur === 'porcelain' ? 2.2 : 1.8); userStroke = true; finishedSent = false; },
    fill(k) { start(k || cur || 'block', 'fill'); },
    destroy() {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); wk && wk.terminate();
      layers.forEach((L) => L.dispose());
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointerleave', onLeave);
      cv.removeEventListener('webglcontextlost', lost);
      [gMap, gNor, env].forEach((x) => x.dispose()); pm.dispose(); renderer.dispose();
    },
  };
  return api;
}
