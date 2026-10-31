// Real-time 3D: a UK house in architectural-model style. Panels are lowered onto the
// south roof, the survey scan sweeps the slope, energy flows to the battery.
// One state object drives everything, so the hero intro and the scroll story share code.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, PlaneGeometry, CircleGeometry,
  ExtrudeGeometry, Shape, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial, ShadowMaterial,
  DirectionalLight, HemisphereLight, AmbientLight, Color, Vector3, CanvasTexture, SRGBColorSpace,
  ACESFilmicToneMapping, PCFShadowMap, PMREMGenerator, EdgesGeometry, LineSegments, LineBasicMaterial,
  CatmullRomCurve3, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, AdditiveBlending,
  Sprite, SpriteMaterial, RepeatWrapping, MathUtils, DoubleSide,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const outQuart = (x) => 1 - Math.pow(1 - clamp01(x), 4);
const range = (p, a, b) => clamp01((p - a) / (b - a));
const AMBER = new Color('#f2b33d');

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Monocrystalline cell texture: 6x10 half-cut cells, fine busbars, thin gaps.
function panelTexture() {
  return canvasTex(512, 820, (g, w, h) => {
    g.fillStyle = '#d7dbe0'; g.fillRect(0, 0, w, h);
    const cols = 6, rows = 10, gap = 5, pad = 10;
    const cw = (w - pad * 2 - gap * (cols - 1)) / cols;
    const ch = (h - pad * 2 - gap * (rows - 1)) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = pad + c * (cw + gap), y = pad + r * (ch + gap);
      const grd = g.createLinearGradient(x, y, x + cw, y + ch);
      grd.addColorStop(0, '#0b1424'); grd.addColorStop(1, '#101c33');
      g.fillStyle = grd; g.fillRect(x, y, cw, ch);
      g.strokeStyle = 'rgba(170,185,210,0.28)'; g.lineWidth = 1;
      for (let b = 1; b <= 3; b++) { g.beginPath(); g.moveTo(x + (cw * b) / 4, y); g.lineTo(x + (cw * b) / 4, y + ch); g.stroke(); }
      g.strokeStyle = 'rgba(170,185,210,0.07)';
      for (let f = 6; f < ch; f += 6) { g.beginPath(); g.moveTo(x, y + f); g.lineTo(x + cw, y + f); g.stroke(); }
    }
    // half-cut divider
    g.fillStyle = '#c9ced6'; g.fillRect(0, h / 2 - 2, w, 4);
  });
}

function tileTexture() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#4a4f57'; g.fillRect(0, 0, w, h);
    const rowH = 32;
    for (let y = 0, r = 0; y < h; y += rowH, r++) {
      const off = (r % 2) * 24;
      for (let x = -off; x < w; x += 48) {
        const l = 40 + Math.random() * 10;
        g.fillStyle = `hsl(215 6% ${l}%)`;
        g.fillRect(x + 1, y + 1, 46, rowH - 3);
      }
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, y + rowH - 3, w, 3);
    }
  });
}

function glowTexture(inner = 'rgba(255,214,140,1)') {
  return canvasTex(128, 128, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grd.addColorStop(0, inner); grd.addColorStop(0.25, 'rgba(255,190,90,0.55)'); grd.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, w);
  });
}

function groundTexture() {
  return canvasTex(512, 512, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grd.addColorStop(0, '#ffffff'); grd.addColorStop(0.62, '#ffffff'); grd.addColorStop(1, '#000000');
    g.fillStyle = grd; g.fillRect(0, 0, w, w);
  }, false);
}

export function createSolarScene(canvas, opts = {}) {
  const mobile = innerWidth < 760;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.capture, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.capture ? 2 : mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(30, 1, 0.5, 200);

  /* ---------- lights ---------- */
  const hemi = new HemisphereLight('#dfe9ff', '#b9b2a4', 0.9);
  scene.add(hemi);
  const amb = new AmbientLight('#ffffff', 0.15);
  scene.add(amb);
  const sun = new DirectionalLight('#fff3df', 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  /* ---------- materials ---------- */
  const wallMat = new MeshStandardMaterial({ color: '#ecebe8', roughness: 0.92 });
  const trimMat = new MeshStandardMaterial({ color: '#f7f7f6', roughness: 0.6 });
  const baseMat = new MeshStandardMaterial({ color: '#c9c6c0', roughness: 0.95 });
  const tiles = tileTexture(); tiles.wrapS = tiles.wrapT = RepeatWrapping; tiles.repeat.set(3, 2);
  const roofMat = new MeshStandardMaterial({ color: '#ffffff', map: tiles, roughness: 0.82 });
  const glassMat = new MeshPhysicalMaterial({ color: '#3a4a5e', roughness: 0.04, metalness: 0.35, envMapIntensity: 2.2, emissive: new Color('#ffb85c'), emissiveIntensity: 0 });
  const doorMat = new MeshStandardMaterial({ color: '#23324a', roughness: 0.5 });
  const frameMat = new MeshStandardMaterial({ color: '#16191e', metalness: 0.75, roughness: 0.35 });
  const railMat = new MeshStandardMaterial({ color: '#8d939b', metalness: 0.8, roughness: 0.4 });
  const pTex = panelTexture();
  const panelFace = new MeshPhysicalMaterial({
    map: pTex, roughness: 0.32, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.06,
    envMapIntensity: 1.6, emissive: AMBER.clone(), emissiveIntensity: 0,
  });

  const house = new Group();
  scene.add(house);
  const box = (w, h, d, mat, x, y, z, cast = true) => {
    const m = new Mesh(new BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true;
    house.add(m); return m;
  };

  // Dimensions (metres). South = +z, east = +x.
  const W = 7.4, D = 6, H = 5.3, RISE = 2.7, OVER = 0.38;
  const run = D / 2 + OVER;
  const pitch = Math.atan2(RISE, run);
  const slope = Math.hypot(run, RISE);

  box(W, H, D, wallMat, 0, H / 2, 0);
  box(W + 0.12, 0.35, D + 0.12, baseMat, 0, 0.175, 0);

  // gable infill
  const gShape = new Shape();
  const eaveY = RISE * (OVER / run);
  gShape.moveTo(-D / 2, 0); gShape.lineTo(D / 2, 0); gShape.lineTo(D / 2, eaveY); gShape.lineTo(0, RISE - 0.02); gShape.lineTo(-D / 2, eaveY); gShape.closePath();
  const gable = new Mesh(new ExtrudeGeometry(gShape, { depth: W - 0.02, bevelEnabled: false }), wallMat);
  gable.rotation.y = Math.PI / 2; gable.position.set(-W / 2 + 0.01, H, 0); gable.castShadow = gable.receiveShadow = true;
  house.add(gable);

  // roof planes
  const roofW = W + 0.6;
  // Roof line: y = H + RISE * (1 - |z| / run). Planes are offset by half their thickness along the normal.
  const nY = 0.07 * Math.cos(pitch), nZ = 0.07 * Math.sin(pitch);
  const roofS = new Group();
  roofS.position.set(0, H + RISE / 2 + nY, run / 2 + nZ);
  roofS.rotation.x = pitch;
  house.add(roofS);
  const roofSMesh = new Mesh(new BoxGeometry(roofW, 0.14, slope + 0.05), roofMat);
  roofSMesh.castShadow = roofSMesh.receiveShadow = true; roofS.add(roofSMesh);

  const roofN = new Group();
  roofN.position.set(0, H + RISE / 2 + nY, -run / 2 - nZ);
  roofN.rotation.x = -pitch;
  house.add(roofN);
  const roofNMesh = new Mesh(new BoxGeometry(roofW, 0.14, slope + 0.05), roofMat);
  roofNMesh.castShadow = roofNMesh.receiveShadow = true; roofN.add(roofNMesh);

  // ridge + fascia
  const ridge = box(roofW, 0.16, 0.34, new MeshStandardMaterial({ color: '#3b4047', roughness: 0.7 }), 0, H + RISE + 0.12, 0);
  ridge.rotation.x = Math.PI / 4;
  box(roofW, 0.2, 0.06, trimMat, 0, H + 0.02, run + 0.02, false);

  // chimney
  box(0.8, 2.6, 0.7, wallMat, 2.3, H + RISE - 0.2, -0.9);
  box(0.95, 0.14, 0.85, baseMat, 2.3, H + RISE + 1.12, -0.9);
  box(0.16, 0.36, 0.16, new MeshStandardMaterial({ color: '#8a6a55', roughness: 0.9 }), 2.15, H + RISE + 1.36, -0.9);
  box(0.16, 0.36, 0.16, new MeshStandardMaterial({ color: '#8a6a55', roughness: 0.9 }), 2.45, H + RISE + 1.36, -0.9);

  // windows (south facade)
  const windows = [];
  const win = (x, y, w = 1.25, h = 1.35, face = 'S') => {
    const z = D / 2 + 0.005;
    if (face === 'S') {
      box(w + 0.16, h + 0.16, 0.08, trimMat, x, y, z, false);
      const g = box(w, h, 0.1, glassMat, x, y, z + 0.005, false);
      box(0.06, h, 0.11, trimMat, x, y, z + 0.01, false);
      box(w + 0.3, 0.08, 0.2, trimMat, x, y - h / 2 - 0.12, z + 0.06, false);
      windows.push(g);
    } else {
      const xx = W / 2 + 0.005;
      box(0.08, h + 0.16, w + 0.16, trimMat, xx, y, x, false);
      const g = box(0.1, h, w, glassMat, xx + 0.005, y, x, false);
      windows.push(g);
    }
  };
  win(-2.4, 1.75); win(2.4, 1.75);
  win(-2.4, 4.0); win(0, 4.0, 0.9); win(2.4, 4.0);
  win(-1.2, 4.0, 0.9, 1.35, 'E'); win(1.2, 1.75, 0.9, 1.35, 'E');
  // door + canopy
  box(1.05, 2.15, 0.1, doorMat, 0, 1.43, D / 2 + 0.02);
  box(1.3, 2.35, 0.06, trimMat, 0, 1.5, D / 2 + 0.005, false);
  const canopy = box(1.8, 0.12, 0.85, trimMat, 0, 2.85, D / 2 + 0.42);
  canopy.rotation.x = 0.12;

  // west single-storey wing with flat roof
  box(3.1, 3.0, 4.6, wallMat, -W / 2 - 1.55, 1.5, -0.6);
  box(3.35, 0.16, 4.85, new MeshStandardMaterial({ color: '#5a5f66', roughness: 0.8 }), -W / 2 - 1.55, 3.06, -0.6);
  box(2.4, 2.1, 0.08, new MeshStandardMaterial({ color: '#d9d8d5', roughness: 0.6 }), -W / 2 - 1.55, 1.1, 1.7);

  // battery + inverter on east wall
  const batt = new Group();
  batt.position.set(W / 2 + 0.16, 0, 1.9);
  house.add(batt);
  const battBody = new Mesh(new BoxGeometry(0.24, 1.15, 0.72), new MeshStandardMaterial({ color: '#f4f5f6', roughness: 0.35, metalness: 0.05 }));
  battBody.position.y = 1.0; battBody.castShadow = true; batt.add(battBody);
  const ledMat = new MeshBasicMaterial({ color: AMBER.clone().multiplyScalar(0.25) });
  const led = new Mesh(new BoxGeometry(0.02, 0.6, 0.04), ledMat);
  led.position.set(0.125, 1.05, 0); batt.add(led);
  const inv = new Mesh(new BoxGeometry(0.18, 0.55, 0.45), new MeshStandardMaterial({ color: '#dfe2e6', roughness: 0.4 }));
  inv.position.set(0, 2.3, 0); inv.castShadow = true; batt.add(inv);

  // ground: shadow catcher + soft disc that fades into the page
  const groundDisc = new Mesh(new CircleGeometry(19, 64), new MeshStandardMaterial({ color: '#dfe3dc', roughness: 1, transparent: true, alphaMap: groundTexture() }));
  groundDisc.rotation.x = -Math.PI / 2; groundDisc.receiveShadow = true; scene.add(groundDisc);
  const shadowCatcher = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.18 }));
  shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = 0.005; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);

  /* ---------- panels ---------- */
  const PW = 1.13, PL = 1.76, PT = 0.035, GAP = 0.03;
  const cols = 5, rows = 2;
  const panels = [];
  const ghosts = new Group();
  roofS.add(ghosts);
  const ghostFill = new MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide });
  const ghostLine = new LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0 });
  const totalW = cols * PW + (cols - 1) * GAP;
  const totalL = rows * PL + (rows - 1) * GAP;
  const startZ = -totalL / 2 + PL / 2 - 0.05;
  // rails
  for (let r = 0; r < rows; r++) for (const k of [-0.32, 0.32]) {
    const rail = new Mesh(new BoxGeometry(totalW + 0.1, 0.04, 0.05), railMat);
    rail.position.set(0, 0.09, startZ + r * (PL + GAP) + k * PL);
    rail.castShadow = true; rail.visible = false; roofS.add(rail);
    rail.userData.rail = true;
  }
  const rails = roofS.children.filter((c) => c.userData.rail);

  let idx = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = -totalW / 2 + PW / 2 + c * (PW + GAP);
    const z = startZ + r * (PL + GAP);
    const g = new Group();
    const face = new Mesh(new BoxGeometry(PW - 0.02, PT, PL - 0.02), [frameMat, frameMat, panelFace.clone(), frameMat, frameMat, frameMat]);
    face.castShadow = true; face.receiveShadow = true;
    g.add(face);
    const rim = new Mesh(new BoxGeometry(PW, PT * 0.9, PL), frameMat);
    rim.scale.set(1, 1, 1); rim.position.y = -0.004; g.add(rim);
    g.userData = { x, z, y: 0.135, order: idx, side: c % 2 ? 1 : -1, flash: face.material[2] };
    g.position.set(x, 0.135, z);
    roofS.add(g); panels.push(g);
    // ghost outline for the quote step
    const gf = new Mesh(new PlaneGeometry(PW - 0.04, PL - 0.04), ghostFill);
    gf.rotation.x = -Math.PI / 2; gf.position.set(x, 0.1, z); ghosts.add(gf);
    const gl = new LineSegments(new EdgesGeometry(new BoxGeometry(PW - 0.04, 0.001, PL - 0.04)), ghostLine);
    gl.position.set(x, 0.11, z); ghosts.add(gl);
    idx++;
  }
  // landing order: top row first, from the ridge outward, like a real crew
  const order = [2, 1, 3, 0, 4, 7, 6, 8, 5, 9];

  /* ---------- survey scan ---------- */
  const scanMat = new MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending });
  const scan = new Mesh(new PlaneGeometry(roofW - 0.1, 0.22), scanMat);
  scan.rotation.x = -Math.PI / 2; scan.position.y = 0.1; roofS.add(scan);
  const roofEdge = new LineSegments(new EdgesGeometry(new BoxGeometry(roofW - 0.1, 0.001, slope - 0.05)), new LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0 }));
  roofEdge.position.y = 0.09; roofS.add(roofEdge);

  /* ---------- energy flow ---------- */
  scene.updateMatrixWorld(true);
  const roofPt = new Vector3(1.8, 0.2, 0.4).applyMatrix4(roofS.matrixWorld);
  const curve = new CatmullRomCurve3([
    roofPt,
    new Vector3(W / 2 - 0.2, H + 0.6, 1.8),
    new Vector3(W / 2 + 0.35, H - 1.4, 1.9),
    new Vector3(W / 2 + 0.35, 2.3, 1.9),
    new Vector3(W / 2 + 0.3, 1.2, 1.9),
  ]);
  const N = 46;
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new Float32BufferAttribute(new Float32Array(N * 3), 3));
  const pMat = new PointsMaterial({ size: mobile ? 0.34 : 0.28, map: glowTexture(), transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, color: '#ffc562' });
  const flow = new Points(pGeo, pMat);
  scene.add(flow);

  const sunSprite = new Sprite(new SpriteMaterial({ map: glowTexture('rgba(255,236,190,1)'), transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.9 }));
  sunSprite.scale.set(9, 9, 1);
  scene.add(sunSprite);

  /* ---------- camera keyframes ---------- */
  const K = {
    hero: { p: new Vector3(19.5, 8.6, 25.5), t: new Vector3(-5.2, 3.6, 0) },
    heroM: { p: new Vector3(17, 8.5, 23), t: new Vector3(-0.6, 3.9, 0) },
    s0: { p: new Vector3(17, 7.5, 21), t: new Vector3(-0.5, 4, 0) },
    s1: { p: new Vector3(9.5, 16.5, 19.5), t: new Vector3(0, 6.2, 1.4) },
    s2: { p: new Vector3(3.5, 15.5, 20.5), t: new Vector3(0, 6.1, 1.6) },
    s3: { p: new Vector3(14, 10.5, 19.5), t: new Vector3(0, 5.6, 1.2) },
    s4: { p: new Vector3(20, 6, 16), t: new Vector3(1.6, 3.6, 0.5) },
  };
  if (opts.capture?.cam) K.cap = { p: new Vector3(...opts.capture.cam.p), t: new Vector3(...opts.capture.cam.t) };

  const state = {
    land: new Array(panels.length).fill(1), ghost: 0, scan: -1, edge: 0,
    energy: 0, sun: 0.5, dusk: 0, battery: 0, flash: new Array(panels.length).fill(0),
  };
  const camPos = new Vector3(), camTgt = new Vector3();
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let camFrom = mobile && opts.mode === 'hero' ? K.heroM : K.hero, camTo = camFrom, camMix = 0;
  if (opts.mode === 'story') camFrom = camTo = K.s0;
  if (K.cap) camFrom = camTo = K.cap;

  function applyState(time) {
    // panels
    panels.forEach((g, i) => {
      const t = state.land[i];
      const e = outQuart(t);
      const u = g.userData;
      g.visible = t > 0.001;
      g.position.set(u.x + (1 - e) * 0.5 * u.side, u.y + (1 - e) * 4.2, u.z - (1 - e) * 1.2);
      g.rotation.set((1 - e) * -0.22, 0, (1 - e) * 0.18 * u.side);
      u.flash.emissiveIntensity = state.flash[i] * 0.55;
    });
    rails.forEach((r) => (r.visible = state.ghost > 0.3 || state.land.some((v) => v > 0)));
    ghostFill.opacity = state.ghost * 0.32;
    ghostLine.opacity = state.ghost * 0.95;
    scanMat.opacity = state.scan >= 0 && state.scan <= 1 ? 0.85 * Math.sin(Math.PI * clamp01(state.scan)) : 0;
    scan.position.z = -slope / 2 + clamp01(state.scan) * slope;
    roofEdge.material.opacity = state.edge;

    // sun arc: s 0 = morning east, 1 = evening west
    const az = MathUtils.lerp(-1.15, 1.15, state.sun);
    const el = MathUtils.lerp(0.32, 1.0, Math.sin(Math.PI * state.sun)) * (1 - state.dusk * 0.4);
    const dir = new Vector3(Math.sin(az) * Math.cos(el) * -1, Math.sin(el), Math.cos(az) * Math.cos(el));
    sun.position.copy(dir).multiplyScalar(40);
    sunSprite.position.copy(dir).multiplyScalar(70);
    sun.intensity = 2.7 * (1 - state.dusk * 0.7);
    sun.color.set('#fff3df').lerp(new Color('#ffb070'), state.dusk);
    hemi.intensity = 0.9 * (1 - state.dusk * 0.45);
    glassMat.emissiveIntensity = state.dusk * 1.1;
    ledMat.color.copy(AMBER).multiplyScalar(0.25 + state.battery * 1.2);

    // energy particles
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const p = ((time * 0.00012 + i / N) % 1);
      const v = curve.getPointAt(p);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    }
    pGeo.attributes.position.needsUpdate = true;
    pMat.opacity = state.energy;
  }

  function placeCamera() {
    const m = smooth(camMix);
    camPos.lerpVectors(camFrom.p, camTo.p, m);
    camTgt.lerpVectors(camFrom.t, camTo.t, m);
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    camera.position.set(camPos.x + pointer.sx * 1.6, camPos.y - pointer.sy * 0.9, camPos.z);
    camera.lookAt(camTgt);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 40 : 30;
    camera.updateProjectionMatrix();
  }

  let running = false, raf = 0, visible = true;
  let introStart = -1;
  const INTRO = 2600;

  function intro(now) {
    if (introStart < 0) introStart = now;
    const t = now - introStart;
    order.forEach((pi, k) => {
      const lt = (t - 250 - k * 150) / 900;
      state.land[pi] = clamp01(lt);
      state.flash[pi] = lt > 1 ? Math.max(0, 1 - (lt - 1) * 2.2) : 0;
    });
    state.energy = smooth((t - INTRO) / 900) * 0.9;
    state.battery = smooth((t - INTRO - 400) / 900);
    return t < INTRO + 1800;
  }

  function frame(now) {
    if (!running) return;
    if (opts.mode === 'hero') {
      if (opts.animateIntro) intro(now);
      state.sun = 0.42 + Math.sin(now * 0.00005) * 0.08;
    }
    applyState(now);
    placeCamera();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function start() { if (running || !visible) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  /* ---------- public API ---------- */
  const api = {
    renderer, resize, start, stop,
    setPointer(x, y) { pointer.x = x; pointer.y = y; },
    renderOnce() { applyState(performance.now()); placeCamera(); pointer.sx = pointer.x; pointer.sy = pointer.y; renderer.render(scene, camera); },
    setVisible(v) { visible = v; v ? start() : stop(); },
    // Scroll story: p in [0, 1] across five steps
    setStory(p) {
      const seg = [K.s0, K.s1, K.s2, K.s3, K.s4];
      const f = Math.min(3.999, p * 5 - 0.5 < 0 ? 0 : p * 5 - 0.5);
      const i = Math.floor(f);
      camFrom = seg[i]; camTo = seg[i + 1]; camMix = f - i;
      if (p * 5 - 0.5 < 0) { camFrom = camTo = K.s0; camMix = 0; }
      state.edge = Math.sin(Math.PI * range(p, 0.04, 0.42)) * 0.9;
      state.scan = range(p, 0.22, 0.4);
      if (p < 0.2 || p > 0.42) state.scan = -1;
      state.ghost = smooth(range(p, 0.42, 0.52)) * (1 - smooth(range(p, 0.72, 0.8)));
      order.forEach((pi, k) => {
        const lt = range(p, 0.6 + k * 0.014, 0.66 + k * 0.014);
        state.land[pi] = lt;
        state.flash[pi] = lt >= 1 ? Math.max(0, 1 - (p - (0.66 + k * 0.014)) * 18) : 0;
      });
      state.sun = 0.35 + range(p, 0.8, 1) * 0.55;
      state.dusk = smooth(range(p, 0.86, 1));
      state.energy = smooth(range(p, 0.8, 0.86)) * 0.95;
      state.battery = smooth(range(p, 0.84, 0.92));
    },
    setCapture(c) {
      if (c.sun != null) state.sun = c.sun;
      if (c.dusk != null) state.dusk = c.dusk;
      state.energy = c.energy || 0; state.battery = c.battery || 0;
      if (c.panels != null) panels.forEach((_, i) => (state.land[i] = i < c.panels ? 1 : 0));
    },
    dispose() { stop(); renderer.dispose(); pmrem.dispose(); },
  };

  if (opts.mode === 'hero' && opts.animateIntro) state.land.fill(0);
  if (opts.mode === 'story') { state.land.fill(0); api.setStory(0); }

  resize();
  new ResizeObserver(resize).observe(canvas);
  if (!opts.capture) {
    new IntersectionObserver(([e]) => api.setVisible(e.isIntersecting), { rootMargin: '100px' }).observe(canvas);
  }
  return api;
}
