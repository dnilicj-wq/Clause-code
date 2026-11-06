// "Design your driveway": a small UK frontage in three.js. The drive surface is a
// CanvasTexture from tex.js and is re-laid with a moving clip plane whenever the design
// changes. Bundled with esbuild (tree-shaken three) to public/js/config3d.js.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Mesh, Group, PlaneGeometry, BoxGeometry, CylinderGeometry,
  ExtrudeGeometry, Shape, Vector3, Plane, Color, MeshStandardMaterial, MeshBasicMaterial, CanvasTexture,
  RepeatWrapping, SRGBColorSpace, HemisphereLight, DirectionalLight, PointLight, PCFShadowMap,
  ACESFilmicToneMapping, PMREMGenerator, Fog, MathUtils
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function createScene(host, { tex, BLENDS, BLOCK_COLOURS, PORCELAIN, onReady } = {}) {
  const coarse = matchMedia('(pointer:coarse)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try { renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: /posterRender/.test(location.search) }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.6 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace; renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFShadowMap;
  host.appendChild(renderer.domElement);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new Scene();
  scene.background = new Color('#c9d0d3'); scene.fog = new Fog('#c9d0d3', 28, 70);
  const pm = new PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
  scene.add(new HemisphereLight('#e9eef2', '#6f6a5c', 0.9));
  const sun = new DirectionalLight('#fff1dc', 2.6); sun.position.set(-9, 14, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 });
  scene.add(sun);

  const cam = new PerspectiveCamera(34, 1, 0.1, 200);
  const T = (canvas, rep = 1, srgb = true) => { const t = new CanvasTexture(canvas); t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = maxAniso; if (srgb) t.colorSpace = SRGBColorSpace; t.repeat.set(rep, rep); return t; };
  const std = (o) => new MeshStandardMaterial(o);
  const add = (m, parent = scene, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m; };

  // ---- ground: lawn + pavement
  const lawnTex = T(tex.lawn(256), 1); lawnTex.repeat.set(30, 30);
  add(new Mesh(new PlaneGeometry(120, 120), std({ map: lawnTex, roughness: 1 })), scene, false).rotation.x = -Math.PI / 2;
  const pav = add(new Mesh(new BoxGeometry(80, .06, 2.2), std({ color: '#9c9890', roughness: .95 })), scene, false); pav.position.set(0, .03, 2.2);
  const kerb = add(new Mesh(new BoxGeometry(80, .14, .16), std({ color: '#b3aea4', roughness: .9 })), scene, false); kerb.position.set(0, .05, 3.35);
  const road = add(new Mesh(new PlaneGeometry(80, 7), std({ map: T(tex.tarmac(false, 256), 1), roughness: .95 })), scene, false); road.rotation.x = -Math.PI / 2; road.position.set(0, .005, 6.9); road.material.map.repeat.set(40, 3.5);

  // ---- house (semi-detached style frontage), back edge of drive at z = -D
  const house = new Group(); scene.add(house);
  const brickTex = T(tex.brick(512), 1); brickTex.repeat.set(3.2, 2.6);
  const HW = 9.6, HH = 5.4, HD = 7;
  add(new Mesh(new BoxGeometry(HW, HH, HD), [std({ map: brickTex, roughness: .92 }), std({ map: brickTex, roughness: .92 }), std({ color: '#3a3a3e' }), std({ color: '#3a3a3e' }), std({ map: brickTex, roughness: .92 }), std({ map: brickTex, roughness: .92 })]), house).position.set(0, HH / 2, -HD / 2);
  // roof: extruded gable
  const rs = new Shape(); rs.moveTo(-HD / 2 - .35, 0); rs.lineTo(0, 3.1); rs.lineTo(HD / 2 + .35, 0); rs.lineTo(-HD / 2 - .35, 0);
  const roof = add(new Mesh(new ExtrudeGeometry(rs, { depth: HW + .5, bevelEnabled: false }), std({ color: '#3b3d42', roughness: .75 })), house);
  roof.rotation.y = Math.PI / 2; roof.position.set(-HW / 2 - .25, HH, -HD / 2);
  // tile courses on the roof via a thin stripe texture
  { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#44474d'; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 64; i += 8) x.fillRect(0, i, 64, 2); const t = T(c, 1); t.repeat.set(1, 8); roof.material.map = t; roof.material.color.set('#ffffff'); }
  const white = std({ color: '#f1f0ec', roughness: .4 }), glass = std({ color: '#1d2730', roughness: .08, metalness: .4, envMapIntensity: 1.3 }), sill = std({ color: '#d9d5cc', roughness: .8 });
  const win = (x, y, w, h) => {
    const g = new Group(); g.position.set(x, y, .02); house.add(g);
    add(new Mesh(new BoxGeometry(w, h, .1), white), g);
    add(new Mesh(new BoxGeometry(w - .14, h - .14, .06), glass), g).position.z = .04;
    add(new Mesh(new BoxGeometry(.06, h - .14, .1), white), g).position.z = .04;
    add(new Mesh(new BoxGeometry(w + .2, .08, .22), sill), g).position.set(0, -h / 2 - .04, .08);
  };
  win(-2.9, 1.5, 1.9, 1.3); win(-2.9, 4, 1.9, 1.2); win(2.9, 4, 1.9, 1.2); win(0, 4, 1, 1.0);
  // composite front door + canopy
  const doorG = new Group(); doorG.position.set(.1, 0, .02); house.add(doorG);
  add(new Mesh(new BoxGeometry(1.25, 2.3, .1), white), doorG).position.y = 1.15;
  add(new Mesh(new BoxGeometry(1.0, 2.1, .08), std({ color: '#2f3a40', roughness: .5 })), doorG).position.set(0, 1.07, .03);
  add(new Mesh(new BoxGeometry(.04, .3, .06), std({ color: '#c7b07a', metalness: 1, roughness: .3 })), doorG).position.set(.36, 1.05, .1);
  add(new Mesh(new BoxGeometry(1.8, .12, .9), std({ color: '#3b3d42' })), doorG).position.set(0, 2.55, .45);
  const porch = new PointLight('#ffcf8a', 0, 5, 2); porch.position.set(.1, 2.3, .6); house.add(porch);
  // garage
  add(new Mesh(new BoxGeometry(2.6, 2.2, .08), std({ color: '#e7e5e0', roughness: .55 })), house).position.set(2.9, 1.1, .03);
  for (let i = 0; i < 8; i++) add(new Mesh(new BoxGeometry(2.5, .02, .1), std({ color: '#cfccc5' })), house, false).position.set(2.9, .2 + i * .26, .05);
  // hedge + fence either side
  const hedgeTex = T(tex.lawn(256), 1); hedgeTex.repeat.set(2, 6); const hedge = std({ map: hedgeTex, color: '#7f9a6a', roughness: 1 });
  const fence = std({ color: '#7a5a3c', roughness: .9 });
  const sideL = add(new Mesh(new RoundedBoxGeometry(1, 1.1, 1, 3, .35), hedge), scene); const sideR = add(new Mesh(new BoxGeometry(.08, 1.2, 1), fence), scene);

  // ---- drive group
  const drive = new Group(); scene.add(drive);
  const clip = new Plane(new Vector3(-1, 0, 0), 0);
  let cur = null, next = null, lay = null;
  const border = std({ color: '#3a3a3d', roughness: .85 });
  const edgeMat = std({ color: '#8f8b84', roughness: .9 });
  const extras = new Group(); scene.add(extras);
  const stepsG = new Group(); scene.add(stepsG);
  const lightsG = new Group(); scene.add(lightsG);
  const drainG = new Group(); scene.add(drainG);
  const skip = new Group(); scene.add(skip);
  const cars = new Group(); scene.add(cars);
  { // skip bin for "remove old surface"
    const y = std({ color: '#e0a21a', roughness: .6 });
    const s = new Shape(); s.moveTo(-1.6, 0); s.lineTo(1.6, 0); s.lineTo(2.1, 1.1); s.lineTo(-2.1, 1.1); s.lineTo(-1.6, 0);
    const m = add(new Mesh(new ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: false }), y), skip); m.position.z = -.85;
    add(new Mesh(new BoxGeometry(3.9, .4, 1.5), std({ color: '#6a6052', roughness: 1 })), skip).position.y = .95;
  }
  function car(colour) {
    const g = new Group(); const paint = std({ color: colour, roughness: .25, metalness: .6, envMapIntensity: 1.2 });
    add(new Mesh(new RoundedBoxGeometry(1.8, .7, 4.3, 4, .22), paint), g).position.y = .62;
    add(new Mesh(new RoundedBoxGeometry(1.6, .6, 2.2, 4, .2), glass), g).position.set(0, 1.14, -.2);
    const tyre = std({ color: '#151516', roughness: .8 });
    for (const [x, z] of [[-.82, 1.35], [.82, 1.35], [-.82, -1.35], [.82, -1.35]]) { const w = add(new Mesh(new CylinderGeometry(.34, .34, .24, 20), tyre), g); w.rotation.z = Math.PI / 2; w.position.set(x, .34, z); }
    return g;
  }
  const carCols = ['#2c3540', '#b9bcc0', '#6d1f22', '#1d1d20'];

  const texCache = new Map();
  function surfaceMat(s, W, D) {
    const key = [s.surface, s.blend, s.pattern, s.bcol, s.tcol, s.pcol].join('|');
    let base = texCache.get(key);
    if (!base) {
      let c, m;
      if (s.surface === 'resin') { c = tex.aggregate(BLENDS.find(b => b.id === s.blend).c, 512, 7, 3); m = { tile: .32, rough: .42, rot: 0 }; }
      else if (s.surface === 'block') { c = tex.blocks(s.pattern, BLOCK_COLOURS.find(b => b.id === s.bcol).c, 512, 5); m = { tile: 1.2, rough: .82, rot: s.pattern === 'herringbone' ? Math.PI / 4 : 0 }; }
      else if (s.surface === 'tarmac') { c = tex.tarmac(s.tcol === 'red', 512, 9); m = { tile: .9, rough: .9, rot: 0 }; }
      else { c = tex.porcelain(PORCELAIN.find(b => b.id === s.pcol).c, 512, 11); m = { tile: 1.8, rough: .38, rot: 0 }; }
      base = { c, ...m }; texCache.set(key, base);
    }
    const t = T(base.c, 1); t.repeat.set(W / base.tile, D / base.tile); t.center.set(.5, .5); t.rotation = base.rot;
    return std({ map: t, roughness: base.rough, metalness: 0, envMapIntensity: s.surface === 'resin' || s.surface === 'porcelain' ? .9 : .4, clippingPlanes: [clip] });
  }

  let dims = { W: 6, D: 5.5, px: 1 };
  let state = null, stamp = '';
  function dimsFor(m2) { const W = MathUtils.clamp(Math.sqrt(m2) * 1.1, 3.6, 15), D = MathUtils.clamp(m2 / W, 3.4, 12); return { W, D }; }

  function build(s, animate) {
    const { W, D } = dimsFor(s.m2);
    const cx = W > HW - .4 ? 0 : 1.2 + (W - 6) * .1; // keep drive in front of garage and door
    const px = MathUtils.clamp(cx, -HW / 2 + W / 2 - 1, HW / 2 - W / 2 + 2);
    dims = { W, D, px }; house.position.set(0, 0, -D);
    sideL.scale.set(.9, 1, D); sideL.position.set(px - W / 2 - .7, .55, -D / 2);
    sideR.scale.set(1, 1, D); sideR.position.set(px + W / 2 + .45, .6, -D / 2);
    const g = new Group(); g.position.set(px, 0, -D / 2);
    const bw = (s.surface === 'resin' || (s.surface === 'tarmac' && s.tedge) || s.surface === 'porcelain') ? .22 : 0;
    const surf = new Mesh(new PlaneGeometry(W - bw * 2, D - bw * 2), surfaceMat(s, W - bw * 2, D - bw * 2));
    surf.rotation.x = -Math.PI / 2; surf.position.y = .035; surf.receiveShadow = true; g.add(surf);
    if (bw) { // block border: charcoal for resin/tarmac, matching edge for porcelain
      const bm = s.surface === 'porcelain' ? edgeMat : border; const bt = T(tex.blocks('stretcher', s.surface === 'tarmac' && s.tcol === 'red' ? ['#7a7672', '#6c6865', '#8a8681'] : ['#47474a', '#3a3a3d', '#545356'], 256, 2), 1);
      const mat = std({ map: bt, roughness: .85, clippingPlanes: [clip] });
      for (const [w, d, x, z] of [[W, bw, 0, D / 2 - bw / 2], [W, bw, 0, -D / 2 + bw / 2], [bw, D - bw * 2, -W / 2 + bw / 2, 0], [bw, D - bw * 2, W / 2 - bw / 2, 0]]) {
        const m = new Mesh(new PlaneGeometry(w, d), mat.clone()); m.material.map = bt.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(Math.max(w, d) / 1.2, .2); if (d > w) { m.material.map.rotation = Math.PI / 2; m.material.map.repeat.set(d / 1.2, .2); }
        m.rotation.x = -Math.PI / 2; m.position.set(x, .036, z); m.receiveShadow = true; g.add(m);
      }
      void bm;
    }
    // sub-base edge visible as a thin slab
    const slab = new Mesh(new BoxGeometry(W, .06, D), std({ color: '#7d786f', roughness: 1, clippingPlanes: [clip] })); slab.position.y = .0; slab.receiveShadow = true; g.add(slab);
    if (cur && animate && !reduce) {
      next && drive.remove(next); next = g; g.position.y = .006; drive.add(g); clip.constant = px - W / 2 - .3; // start hidden
      g.traverse(o => { if (o.material) o.material.clippingPlanes = [clip]; });
      const prev = cur; prev.traverse(o => { if (o.material) o.material.clippingPlanes = []; });
      lay = { t0: performance.now(), from: px - W / 2 - .3, to: px + W / 2 + .3, prev, g };
    } else {
      cur && drive.remove(cur); cur = g; drive.add(g); clip.constant = 1e4; lay = null;
      if (next) { drive.remove(next); next = null; }
    }
    // extras
    const E = s.extras || {};
    extras.clear();
    if (E.edging) { for (const [w, d, x, z] of [[.15, D, px - W / 2 - .07, -D / 2], [.15, D, px + W / 2 + .07, -D / 2]]) { const k = add(new Mesh(new BoxGeometry(w, .16, d), edgeMat), extras); k.position.set(x, .08, z); } }
    drainG.clear();
    if (E.drainage) { const c = document.createElement('canvas'); c.width = 64; c.height = 8; const x = c.getContext('2d'); x.fillStyle = '#2a2b2d'; x.fillRect(0, 0, 64, 8); x.fillStyle = '#8b8d90'; for (let i = 0; i < 64; i += 4) x.fillRect(i, 1, 2, 6); const t = T(c, 1, true); t.repeat.set(W * 2, 1); const d = add(new Mesh(new BoxGeometry(W, .02, .16), std({ map: t, metalness: .8, roughness: .4 })), drainG, false); d.position.set(px, .045, -.14); }
    stepsG.clear();
    if (E.steps) { const sm = s.surface === 'block' ? std({ map: T(tex.blocks('stretcher', BLOCK_COLOURS.find(b => b.id === s.bcol).c, 256), 1), roughness: .85 }) : std({ color: '#5d5c5a', roughness: .8 }); for (let i = 0; i < 2; i++) { const st = add(new Mesh(new BoxGeometry(1.9 - i * .25, .16, .45 - i * .1), sm), stepsG); st.position.set(.1, .08 + i * .16, -D + .45 - i * .2); } }
    lightsG.clear(); porch.intensity = 0;
    if (E.lighting) {
      const n = Math.max(2, Math.round(D / 2.4)); for (let i = 0; i < n; i++) for (const side of [-1, 1]) {
        const x = px + side * (W / 2 + .25), z = -D + 1 + i * (D - 1.6) / Math.max(1, n - 1);
        add(new Mesh(new CylinderGeometry(.06, .07, .55, 12), std({ color: '#262628', metalness: .7, roughness: .4 })), lightsG).position.set(x, .28, z);
        add(new Mesh(new CylinderGeometry(.065, .065, .08, 12), new MeshBasicMaterial({ color: '#ffd9a0' })), lightsG, false, false).position.set(x, .5, z);
      }
      porch.intensity = 3;
    }
    skip.visible = !!E.removal; skip.position.set(px + W / 2 + 2.6, 0, 1.0); skip.rotation.y = -.25;
    // cars for scale: one per ~16 m², up to what fits across the width
    cars.clear();
        // one car for scale, parked to the right so the new surface stays in view
    { const c = car(carCols[0]); c.position.set(px + W / 2 - 1.35, .04, -D + 2.5); c.rotation.y = Math.PI - .04; cars.add(c); }
    fitCam();
  }

  // ---- camera: gentle three-quarter view, drag to orbit a little
  let yaw = -.42, tYaw = yaw, pitch = .72, dist = 18;
  function fitCam() { const { W, D } = dims; dist = (Math.max(W * 1.15, D * 1.4) + 7.5) * (host.clientWidth / host.clientHeight < 1.1 ? 1.3 : 1); kick(); }
  function placeCam() {
    const tgt = new Vector3(dims.px, .3, -dims.D * .5 - .4);
    cam.position.set(tgt.x + Math.sin(yaw) * Math.cos(pitch) * dist, tgt.y + Math.sin(pitch) * dist, tgt.z + Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.lookAt(tgt);
  }
  let drag = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: tYaw, id: e.pointerId, moved: false }; });
  addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; tYaw = MathUtils.clamp(drag.yaw - dx * .006, -1.1, .9); el.style.cursor = 'grabbing'; kick(); });
  addEventListener('pointerup', () => { drag = null; el.style.cursor = ''; });

  function resize() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); fitCam(); }
  new ResizeObserver(resize).observe(host);

  let visible = true, raf = 0, until = 0, firstFrame = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(host);
  function kick(ms = 1200) { until = Math.max(until, performance.now() + ms); if (!raf && visible) raf = requestAnimationFrame(loop); }
  function loop(t) {
    raf = 0;
    yaw += (tYaw - yaw) * .12;
    if (lay) {
      const k = MathUtils.clamp((t - lay.t0) / 1100, 0, 1), e = 1 - Math.pow(1 - k, 3);
      clip.constant = MathUtils.lerp(lay.from, lay.to, e); // plane normal -x: keep x < constant
      if (k >= 1) { drive.remove(lay.prev); cur = lay.g; cur.position.y = 0; next = null; cur.traverse(o => { if (o.material) o.material.clippingPlanes = []; }); lay = null; }
      else until = Math.max(until, t + 50);
    }
    placeCam(); renderer.render(scene, cam);
    if (firstFrame) { firstFrame = false; onReady && onReady(); }
    if (t < until || Math.abs(tYaw - yaw) > .0005) raf = requestAnimationFrame(loop);
  }

  return {
    set(s) {
      const key = JSON.stringify([s.surface, s.blend, s.pattern, s.bcol, s.tcol, s.tedge, s.pcol, s.m2, s.extras]);
      if (key === stamp) return; const surfOnly = state && state.m2 === s.m2 && JSON.stringify(state.extras) === JSON.stringify(s.extras);
      stamp = key; const first = !state; state = JSON.parse(JSON.stringify(s));
      build(state, !first && surfOnly);
      if (first) resize();
      kick(1600);
    },
  };
}
