// 3D room for the "Design it before we arrive" configurator.
// Procedural, tileable finish textures are rendered on the GPU once, then tinted with
// KT's real colour codes. Bundled with esbuild (tree-shaken three) to js/config3d.js.
import {
  WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, Mesh, Group, PlaneGeometry, BoxGeometry,
  CylinderGeometry, SphereGeometry, TorusGeometry, LatheGeometry, ExtrudeGeometry, TubeGeometry, Shape, Path,
  CatmullRomCurve3, Vector2, Vector3, Color, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial,
  ShaderMaterial, WebGLRenderTarget, RepeatWrapping, LinearMipmapLinearFilter, LinearFilter, HemisphereLight,
  DirectionalLight, PointLight, AmbientLight, PCFSoftShadowMap, ACESFilmicToneMapping, SRGBColorSpace,
  PMREMGenerator, Raycaster, BufferAttribute, MathUtils
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const TEX_FS = `
precision highp float; varying vec2 vUv; uniform int uKind; uniform float uSeed; uniform int uOut;
// periodic value noise so textures tile seamlessly
float h(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33+uSeed);return fract((p.x+p.y)*p.x);}
float pn(vec2 p,float P){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 vec2 a=mod(i,P),b=mod(i+vec2(1,0),P),c=mod(i+vec2(0,1),P),d=mod(i+1.,P);
 return mix(mix(h(a),h(b),u.x),mix(h(c),h(d),u.x),u.y);}
float fb(vec2 p,float P,int o){float s=0.,a=.5;for(int i=0;i<7;i++){if(i>=o)break;s+=a*pn(p,P);p*=2.;P*=2.;a*=.5;}return s;}
void main(){
 vec2 p=vUv; float alb=1.,ht=.5,rg=.5;
 if(uKind==0){ // microcement: clouds + trowel arcs
  float c=fb(p*4.,4.,6);
  float w=fb(p*3.+vec2(fb(p*6.,6.,4),fb(p*6.+5.,6.,4))*1.4,3.,5);
  float arcs=fb(vec2(p.x*8.+w*3.,p.y*48.+w*6.),8.,4);
  float fine=pn(p*512.,512.)*.5+pn(p*256.,256.)*.5;
  alb=.84+(c-.5)*.34+(arcs-.5)*.14+(fine-.5)*.04;
  ht=c*.6+arcs*.3+fine*.1; rg=.44+(1.-c)*.16+(arcs-.5)*.1;
 } else if(uKind==1){ // liquid stone: aggregate flecks on a soft cloud
  float c=fb(p*5.,5.,5);
  float g=pn(p*700.,700.); float g2=pn(p*380.+3.,380.);
  float fleck=smoothstep(.78,.86,g)*.22-smoothstep(.8,.9,g2)*.16;
  alb=.86+(c-.5)*.12+fleck+(pn(p*1024.,1024.)-.5)*.06;
  ht=.5+fleck*1.6+(c-.5)*.2; rg=.62+(c-.5)*.1;
 } else { // natural limewash: layered brushy washes
  float w1=fb(vec2(p.x*6.+fb(p*3.,3.,4)*2.,p.y*6.),6.,6);
  float w2=fb(vec2(p.x*12.,p.y*4.+fb(p*4.+9.,4.,4)*2.5),12.,5);
  float br=fb(vec2(p.x*90.,p.y*14.+w1*4.),90.,3);
  alb=.84+(w1-.5)*.34+(w2-.5)*.2+(br-.5)*.06;
  ht=w1*.5+br*.5; rg=.86+(br-.5)*.08;
 }
 gl_FragColor = uOut==0 ? vec4(vec3(clamp(alb,0.,1.)),1.) : vec4(clamp(ht,0.,1.),clamp(rg,0.,1.),0.,1.);
}`;

export function createRoom(host, { onPick, onReady } = {}) {
  const coarse = matchMedia('(pointer:coarse)').matches;
  const renderer = new WebGLRenderer({ antialias: !coarse, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const pm = new PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(36, 1, 0.1, 60);

  // ---------- procedural finish textures ----------
  const texScene = new Scene(); const texCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const texMat = new ShaderMaterial({ vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}', fragmentShader: TEX_FS, uniforms: { uKind: { value: 0 }, uSeed: { value: 1 }, uOut: { value: 0 } } });
  texScene.add(new Mesh(new PlaneGeometry(2, 2), texMat));
  const SIZE = coarse ? 512 : 1024;
  function bake(kind, out) {
    const rt = new WebGLRenderTarget(SIZE, SIZE, { generateMipmaps: true, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter, wrapS: RepeatWrapping, wrapT: RepeatWrapping });
    rt.texture.wrapS = rt.texture.wrapT = RepeatWrapping; rt.texture.anisotropy = 8;
    texMat.uniforms.uKind.value = kind; texMat.uniforms.uOut.value = out; texMat.uniforms.uSeed.value = kind * 7.1 + 3;
    renderer.setRenderTarget(rt); renderer.render(texScene, texCam); renderer.setRenderTarget(null);
    return rt.texture;
  }
  const TEX = { mc: [bake(0, 0), bake(0, 1)], ls: [bake(1, 0), bake(1, 1)], nl: [bake(2, 0), bake(2, 1)] };
  const PROPS = { mc: { bump: 1.0, env: 0.5 }, ls: { bump: 1.6, env: 0.25 }, nl: { bump: 0.9, env: 0.12 } };
  function finishMat() {
    const m = new MeshStandardMaterial({ color: 0xe6decb, roughness: 1, metalness: 0 });
    return m;
  }
  const mats = { floor: finishMat(), walls: finishMat(), feature: finishMat() };
  function applyFinish(group, kind, hex) {
    const m = mats[group]; const [alb, dat] = TEX[kind];
    m.map = alb; m.roughnessMap = dat; m.bumpMap = dat; m.bumpScale = PROPS[kind].bump; m.envMapIntensity = PROPS[kind].env;
    m.userData.target = new Color(hex).multiplyScalar(1.06);
    m.needsUpdate = true;
  }

  // world-space UVs so every surface shares one texture scale (1 repeat = 1.8 m)
  function worldUV(mesh, scale = 1 / 1.8) {
    mesh.updateMatrixWorld(true);
    const g = mesh.geometry; const pos = g.attributes.position, nor = g.attributes.normal;
    const uv = new Float32Array(pos.count * 2); const v = new Vector3(), n = new Vector3();
    const nm = new Matrix3Lite(mesh.matrixWorld);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      n.fromBufferAttribute(nor, i); nm.apply(n);
      const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
      let u, w;
      if (ay >= ax && ay >= az) { u = v.x; w = v.z; } else if (ax >= az) { u = v.z; w = v.y; } else { u = v.x; w = v.y; }
      uv[i * 2] = u * scale; uv[i * 2 + 1] = w * scale;
    }
    g.setAttribute('uv', new BufferAttribute(uv, 2));
  }
  class Matrix3Lite { constructor(m) { this.e = m.elements; } apply(v) { const e = this.e; const x = v.x, y = v.y, z = v.z; v.set(e[0] * x + e[4] * y + e[8] * z, e[1] * x + e[5] * y + e[9] * z, e[2] * x + e[6] * y + e[10] * z).normalize(); } }

  const pickables = [];
  function surf(geo, group, pos, rot) {
    const m = new Mesh(geo, mats[group]); m.position.set(...pos); if (rot) m.rotation.set(...rot);
    m.castShadow = true; m.receiveShadow = true; m.userData.group = group; pickables.push(m);
    m.updateMatrixWorld(); worldUV(m); return m;
  }

  // ---------- architecture ----------
  const RW = 7, RD = 5, RH = 3.1, T = 0.18;
  const arch = new Group(); scene.add(arch);
  arch.add(surf(new BoxGeometry(RW + T, 0.12, RD + T), 'floor', [0, -0.06, 0]));
  // back wall with arched niche (extruded shape)
  const NX = 1.55, NW = 1.0, NH = 2.05, NB = 0.45;
  const bw = new Shape(); bw.moveTo(-RW / 2 - T, 0); bw.lineTo(RW / 2, 0); bw.lineTo(RW / 2, RH); bw.lineTo(-RW / 2 - T, RH); bw.lineTo(-RW / 2 - T, 0);
  const hole = new Path(); hole.moveTo(NX - NW / 2, NB); hole.lineTo(NX + NW / 2, NB); hole.lineTo(NX + NW / 2, NB + NH - NW / 2);
  hole.absarc(NX, NB + NH - NW / 2, NW / 2, 0, Math.PI, false); hole.lineTo(NX - NW / 2, NB); bw.holes.push(hole);
  const backG = new ExtrudeGeometry(bw, { depth: T, bevelEnabled: false, curveSegments: 40 });
  arch.add(surf(backG, 'walls', [0, 0, -RD / 2 - T]));
  // niche recess: back panel + floor shelf
  arch.add(surf(new BoxGeometry(NW + 0.1, NH + 0.1, 0.06), 'walls', [NX, NB + NH / 2, -RD / 2 - T - 0.32]));
  const nicheShelf = surf(new BoxGeometry(NW, 0.04, 0.36), 'walls', [NX, NB + 0.02, -RD / 2 - T / 2 - 0.12]); arch.add(nicheShelf);
  // LED strip in niche (evening glow)
  const led = new Mesh(new BoxGeometry(NW - 0.1, 0.02, 0.02), new MeshBasicMaterial({ color: 0xffd9a0 }));
  led.position.set(NX, NB + NH - NW / 2 + 0.1, -RD / 2 - T - 0.26); arch.add(led);
  const nicheLight = new PointLight(0xffc98a, 0, 2.6, 2); nicheLight.position.set(NX, NB + 1.2, -RD / 2 - 0.25); scene.add(nicheLight);
  // left wall with window opening
  const WZ0 = -1.35, WZ1 = 0.75, WY0 = 0.55, WY1 = 2.55, LX = -RW / 2 - T / 2;
  const lw = new Shape(); lw.moveTo(-RD / 2 - T, 0); lw.lineTo(RD / 2, 0); lw.lineTo(RD / 2, RH); lw.lineTo(-RD / 2 - T, RH); lw.lineTo(-RD / 2 - T, 0);
  const wh = new Path(); wh.moveTo(WZ0, WY0); wh.lineTo(WZ1, WY0); wh.lineTo(WZ1, WY1); wh.lineTo(WZ0, WY1); wh.lineTo(WZ0, WY0); lw.holes.push(wh);
  const leftG = new ExtrudeGeometry(lw, { depth: T, bevelEnabled: false });
  const left = surf(leftG, 'walls', [LX + T / 2, 0, 0], [0, Math.PI / 2, 0]); arch.add(left);
  // window frame + sky
  const frameM = new MeshStandardMaterial({ color: 0x1d1c1a, roughness: 0.5, metalness: 0.4 });
  const fr = new Group();
  [[0, WY0, 0.04, (WZ1 - WZ0)], [0, WY1, 0.04, (WZ1 - WZ0)]].forEach(([, y, th, len]) => { const b = new Mesh(new BoxGeometry(0.06, th, len), frameM); b.position.set(LX, y, (WZ0 + WZ1) / 2); fr.add(b); });
  [WZ0, (WZ0 + WZ1) / 2, WZ1].forEach(z => { const b = new Mesh(new BoxGeometry(0.06, WY1 - WY0, 0.04), frameM); b.position.set(LX, (WY0 + WY1) / 2, z); fr.add(b); });
  scene.add(fr);
  const skyM = new MeshBasicMaterial({ color: 0xf6efe2 });
  const sky = new Mesh(new PlaneGeometry(3.2, 2.6), skyM); sky.position.set(LX - 1.0, 1.55, (WZ0 + WZ1) / 2); sky.rotation.y = Math.PI / 2; scene.add(sky);
  // skirting shadow gap for realism
  const gapM = new MeshStandardMaterial({ color: 0x2a2724, roughness: 0.9 });
  const gap = new Mesh(new BoxGeometry(RW, 0.012, 0.012), gapM); gap.position.set(0, 0.006, -RD / 2 + 0.006); scene.add(gap);

  // ---------- lights ----------
  const hemi = new HemisphereLight(0xffffff, 0xcfc4b0, 0.55); scene.add(hemi);
  const amb = new AmbientLight(0xffffff, 0.08); scene.add(amb);
  const sun = new DirectionalLight(0xfff2e0, 2.4); sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 30 });
  scene.add(sun, sun.target);
  const warm = [new PointLight(0xffb870, 0, 5, 2), new PointLight(0xffb870, 0, 5, 2)]; warm.forEach(l => scene.add(l));

  // ---------- shared props materials ----------
  const white = new MeshPhysicalMaterial({ color: 0xf7f5f1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const black = new MeshStandardMaterial({ color: 0x151412, roughness: 0.35, metalness: 0.6 });
  const oak = new MeshStandardMaterial({ color: 0xb08a62, roughness: 0.62 });
  const linen = new MeshStandardMaterial({ color: 0xe9e2d6, roughness: 0.95 });
  const glass = new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 1.4 });
  const mirror = new MeshStandardMaterial({ color: 0xdfe3e6, roughness: 0.03, metalness: 1, envMapIntensity: 1.3 });
  const ceramic = new MeshStandardMaterial({ color: 0xd8cbb8, roughness: 0.45 });
  const glow = new MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd49a, emissiveIntensity: 0 });
  const plant = new MeshStandardMaterial({ color: 0xc9b48e, roughness: 0.9 });
  const brass = new MeshStandardMaterial({ color: 0xc2a06a, roughness: 0.3, metalness: 1 });
  const rb = (w, h, d, r = 0.04, s = 4) => new RoundedBoxGeometry(w, h, d, s, r);
  const add = (g, geo, mat, p, r, cast = true) => { const m = new Mesh(geo, mat); m.position.set(...p); if (r) m.rotation.set(...r); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m; };
  function stems(g, x, y, z, n, col = plant) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random(); const lean = 0.12 + Math.random() * 0.22; const hgt = 0.7 + Math.random() * 0.5;
      const c = new CatmullRomCurve3([new Vector3(x, y, z), new Vector3(x + Math.cos(a) * lean * 0.4, y + hgt * 0.5, z + Math.sin(a) * lean * 0.4), new Vector3(x + Math.cos(a) * lean, y + hgt, z + Math.sin(a) * lean)]);
      add(g, new TubeGeometry(c, 16, 0.006, 5), col, [0, 0, 0]);
      const plume = add(g, new SphereGeometry(0.05, 10, 8), col, [x + Math.cos(a) * lean, y + hgt + 0.05, z + Math.sin(a) * lean]); plume.scale.set(0.7, 2.2, 0.7);
    }
  }

  // ---------- spaces ----------
  const spaces = {};
  // wet room
  {
    const g = new Group();
    const prof = [[0, 0.06], [0.42, 0.06], [0.58, 0.12], [0.66, 0.36], [0.68, 0.56], [0.64, 0.58], [0.6, 0.38], [0.52, 0.18], [0.38, 0.13], [0, 0.13]].map(([x, y]) => new Vector2(x, y));
    const tub = add(g, new LatheGeometry(prof, 64), white, [-0.6, 0, -1.3]); tub.scale.set(1.62, 1, 0.74);
    add(g, new CylinderGeometry(0.014, 0.014, 1.05, 10), black, [0.42, 0.52, -1.25]);
    add(g, new TorusGeometry(0.1, 0.012, 8, 20, Math.PI), black, [0.32, 1.04, -1.25], [0, 0, 0]);
    // vanity (feature)
    const van = surf(rb(1.25, 0.42, 0.52, 0.05), 'feature', [-2.35, 0.82, -RD / 2 + 0.26]); g.add(van);
    const bas = add(g, new LatheGeometry([[0, 0.0], [0.17, 0.0], [0.2, 0.05], [0.21, 0.13], [0.19, 0.13], [0.17, 0.04], [0, 0.03]].map(([x, y]) => new Vector2(x, y)), 48), white, [-2.35, 1.03, -RD / 2 + 0.3]);
    add(g, new CylinderGeometry(0.012, 0.012, 0.22, 10), black, [-2.35, 1.3, -RD / 2 + 0.06], [Math.PI / 2, 0, 0]);
    add(g, new TorusGeometry(0.38, 0.016, 10, 64), black, [-2.35, 1.82, -RD / 2 + 0.02]);
    add(g, new CylinderGeometry(0.37, 0.37, 0.01, 64), mirror, [-2.35, 1.82, -RD / 2 + 0.015], [Math.PI / 2, 0, 0], false);
    // shower glass + head
    add(g, new BoxGeometry(0.012, 2.05, 1.4), glass, [0.82, 1.03, -RD / 2 + 0.7], null, false);
    add(g, new BoxGeometry(0.025, 2.05, 0.025), black, [0.82, 1.03, -RD / 2 + 1.4]);
    add(g, new CylinderGeometry(0.15, 0.15, 0.015, 32), black, [NX, 2.62, -RD / 2 + 0.42]);
    add(g, new CylinderGeometry(0.01, 0.01, 0.42, 8), black, [NX, 2.63, -RD / 2 + 0.21], [Math.PI / 2, 0, 0]);
    add(g, rb(0.06, 0.12, 0.03, 0.01, 2), black, [NX + 0.75, 1.15, -RD / 2 + 0.015]);
    // niche bottles + vase
    [[-0.22, 0.2, 0x2a2622], [0, 0.26, 0xc7b79e], [0.2, 0.16, 0x7a6a58]].forEach(([dx, hh, c]) => add(g, new CylinderGeometry(0.04, 0.045, hh, 20), new MeshStandardMaterial({ color: c, roughness: 0.3 }), [NX + dx, NB + 0.04 + hh / 2, -RD / 2 - T - 0.12]));
    add(g, new LatheGeometry([[0, 0], [0.1, 0], [0.13, 0.12], [0.08, 0.3], [0.06, 0.34], [0, 0.34]].map(([x, y]) => new Vector2(x, y)), 32), ceramic, [-1.4, 0, -RD / 2 + 0.3]);
    stems(g, -1.4, 0.3, -RD / 2 + 0.3, 7);
    // bath mat
    add(g, rb(0.9, 0.012, 0.55, 0.005, 2), linen, [-0.5, 0.006, -0.4], null, false);
    spaces.bath = { g, feature: 'Vanity', focus: new Vector3(-0.4, 1.0, -1.2) };
  }
  // kitchen
  {
    const g = new Group();
    g.add(surf(rb(2.3, 0.88, 0.95, 0.03), 'feature', [0.1, 0.44, -0.35]));
    g.add(surf(rb(2.5, 0.06, 1.08, 0.02), 'feature', [0.1, 0.91, -0.35]));
    const run = add(g, rb(3.6, 0.9, 0.62, 0.02), oak, [-1.3, 0.45, -RD / 2 + 0.31]);
    g.add(surf(rb(3.62, 0.05, 0.64, 0.015), 'feature', [-1.3, 0.925, -RD / 2 + 0.32]));
    add(g, rb(1.6, 0.04, 0.26, 0.01), oak, [-1.6, 1.75, -RD / 2 + 0.13]);
    [[-2.2, 0.2], [-1.9, 0.14], [-1.2, 0.26]].forEach(([x, hh]) => add(g, new LatheGeometry([[0, 0], [0.08, 0], [0.1, hh * 0.6], [0.06, hh], [0, hh]].map(([a, b]) => new Vector2(a, b)), 24), ceramic, [x, 1.77, -RD / 2 + 0.13]));
    [-0.6, 0.1, 0.8].forEach(x => {
      add(g, new CylinderGeometry(0.19, 0.17, 0.05, 32), oak, [x, 0.7, 0.32]);
      add(g, new CylinderGeometry(0.015, 0.015, 0.68, 8), black, [x, 0.34, 0.32]);
      add(g, new TorusGeometry(0.15, 0.008, 6, 24), black, [x, 0.22, 0.32], [Math.PI / 2, 0, 0]);
    });
    [-0.45, 0.65].forEach((x, i) => {
      add(g, new CylinderGeometry(0.004, 0.004, 1.3, 6), black, [x, RH - 0.65, -0.35], null, false);
      const s = add(g, new SphereGeometry(0.16, 32, 20), glow, [x, 1.72, -0.35], null, false);
      warm[i].position.set(x, 1.55, -0.35);
    });
    add(g, new LatheGeometry([[0, 0], [0.16, 0.01], [0.22, 0.1], [0.2, 0.11], [0, 0.03]].map(([a, b]) => new Vector2(a, b)), 32), ceramic, [0.5, 0.94, -0.3]);
    [[0.46, -0.28], [0.56, -0.34], [0.5, -0.22]].forEach(([x, z]) => add(g, new SphereGeometry(0.045, 16, 12), new MeshStandardMaterial({ color: 0xe8c547, roughness: 0.5 }), [x, 1.0, z]));
    spaces.kitchen = { g, feature: 'Island', focus: new Vector3(0, 0.9, -0.6) };
  }
  // living
  {
    const g = new Group();
    g.add(surf(rb(2.7, 0.42, 0.58, 0.05), 'feature', [-1.25, 0.21, -RD / 2 + 0.29]));
    add(g, rb(2.5, 0.38, 0.98, 0.12, 5), linen, [0.95, 0.24, -1.15]);
    add(g, rb(2.5, 0.5, 0.26, 0.12, 5), linen, [0.95, 0.62, -1.56]);
    [0.35, 1.55].forEach(x => add(g, rb(1.15, 0.16, 0.8, 0.07, 4), linen, [x, 0.5, -1.08]));
    add(g, rb(0.26, 0.42, 0.98, 0.1, 4), linen, [-0.26, 0.42, -1.15]);
    add(g, rb(0.26, 0.42, 0.98, 0.1, 4), linen, [2.16, 0.42, -1.15]);
    add(g, new CylinderGeometry(0.55, 0.5, 0.32, 64), mats.feature, [0.9, 0.16, 0.1]);
    add(g, new CylinderGeometry(1.25, 1.25, 0.012, 64), new MeshStandardMaterial({ color: 0xcbbfa9, roughness: 1 }), [0.9, 0.006, -0.2], null, false);
    add(g, new LatheGeometry([[0, 0], [0.12, 0], [0.16, 0.2], [0.09, 0.42], [0.07, 0.46], [0, 0.46]].map(([x, y]) => new Vector2(x, y)), 32), ceramic, [-2.0, 0.42, -RD / 2 + 0.3]);
    stems(g, -2.0, 0.85, -RD / 2 + 0.3, 8);
    add(g, new LatheGeometry([[0, 0], [0.1, 0], [0.12, 0.08], [0, 0.08]].map(([x, y]) => new Vector2(x, y)), 24), ceramic, [0.95, 0.32, 0.05]);
    // arc floor lamp
    const arcC = new CatmullRomCurve3([new Vector3(2.75, 0.02, 0.2), new Vector3(2.75, 1.6, 0.2), new Vector3(2.4, 2.15, -0.1), new Vector3(1.9, 2.05, -0.4)]);
    add(g, new TubeGeometry(arcC, 40, 0.014, 8), brass, [0, 0, 0]);
    add(g, new CylinderGeometry(0.16, 0.18, 0.03, 32), black, [2.75, 0.015, 0.2]);
    add(g, new SphereGeometry(0.2, 32, 20), glow, [1.9, 1.86, -0.4], null, false);
    warm[0].position.set(1.9, 1.7, -0.4); warm[1].position.set(NX, 1.2, -2.2);
    spaces.living = { g, feature: 'Bench', focus: new Vector3(0, 0.8, -1.2) };
  }
  Object.values(spaces).forEach(s => { s.g.visible = false; scene.add(s.g); s.g.traverse(o => { if (o.isMesh && o.userData.group) { o.updateMatrixWorld(); worldUV(o); } }); });
  let cur = null;

  // ---------- lighting presets ----------
  const LIGHTS = {
    day: { sun: [0xfff1de, 3.0], dir: [-7, 6.2, 2.4], hemi: [0xf4f1ec, 0xbfb29c, 0.32], env: 0.38, warm: 0, glow: 0, sky: 0xf8f2e6, exp: 0.92, led: 0 },
    golden: { sun: [0xffa860, 3.4], dir: [-8, 3.2, -1.6], hemi: [0xffe3c4, 0xb9a080, 0.32], env: 0.38, warm: 0.6, glow: 0.6, sky: 0xffc78a, exp: 1.05, led: 0.4 },
    evening: { sun: [0x8a9ac8, 0.25], dir: [-7, 6, 2], hemi: [0x4a5068, 0x2a241c, 0.12], env: 0.12, warm: 6, glow: 3.2, sky: 0x232a40, exp: 1.18, led: 2.6 }
  };
  const L = { c: { ...flat(LIGHTS.day) }, t: { ...flat(LIGHTS.day) } };
  function flat(p) { const s = new Color(p.sun[0]), h1 = new Color(p.hemi[0]), h2 = new Color(p.hemi[1]), sk = new Color(p.sky); return { sr: s.r, sg: s.g, sb: s.b, si: p.sun[1], dx: p.dir[0], dy: p.dir[1], dz: p.dir[2], hr: h1.r, hg: h1.g, hb: h1.b, gr: h2.r, gg: h2.g, gb: h2.b, hi: p.hemi[2], env: p.env, warm: p.warm, glow: p.glow, kr: sk.r, kg: sk.g, kb: sk.b, exp: p.exp, led: p.led }; }
  function applyLights() {
    const c = L.c;
    sun.color.setRGB(c.sr, c.sg, c.sb); sun.intensity = c.si; sun.position.set(c.dx, c.dy, c.dz); sun.target.position.set(0, 0, -0.5);
    hemi.color.setRGB(c.hr, c.hg, c.hb); hemi.groundColor.setRGB(c.gr, c.gg, c.gb); hemi.intensity = c.hi;
    scene.environmentIntensity = c.env; warm.forEach(w => w.intensity = c.warm * 0.9); glow.emissiveIntensity = c.glow;
    skyM.color.setRGB(c.kr, c.kg, c.kb); renderer.toneMappingExposure = c.exp; nicheLight.intensity = c.led; { const k = Math.min(1, c.led / 2); led.material.color.setRGB(MathUtils.lerp(.86, 1, k), MathUtils.lerp(.84, .82, k), MathUtils.lerp(.8, .55, k)); }
  }

  // ---------- camera rig ----------
  const rig = { az: 0.62, el: 0.2, dist: 8.6, taz: 0.62, tel: 0.2, target: new Vector3(0, 1, -0.8), tt: new Vector3(0, 1, -0.8) };
  let dragging = false, px = 0, py = 0, idle = performance.now(), downAt = 0, moved = 0;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { dragging = true; px = e.clientX; py = e.clientY; downAt = performance.now(); moved = 0; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!dragging) return; const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    rig.taz = MathUtils.clamp(rig.taz - dx * 0.005, 0.05, 1.25); rig.tel = MathUtils.clamp(rig.tel + dy * 0.003, 0.05, 0.55); idle = performance.now();
  });
  const ray = new Raycaster(); const ndc = new Vector2();
  el.addEventListener('pointerup', e => {
    dragging = false;
    if (moved < 8) {
      const r = el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables.filter(m => m.visible && (!m.parent || m.parent.visible)), false)[0];
      if (hit) { onPick && onPick(hit.object.userData.group); pulse(hit.object.userData.group); }
    }
  });
  el.addEventListener('pointercancel', () => dragging = false);
  let pulseG = null, pulseT = 0;
  function pulse(g) { pulseG = g; pulseT = performance.now(); }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false);
    const a = w / h; camera.aspect = a; camera.fov = 38; rig.dist = 9.4 + Math.max(0, 1.55 - a) * (a < 1.1 ? 4.2 : 6.5); camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();

  let visible = false, raf = 0, t0 = performance.now();
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }, { rootMargin: '100px' }).observe(host);
  function start() { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  function tick(now) {
    if (!visible) return;
    const t = (now - t0) / 1000;
    if (!dragging && now - idle > 2500) { rig.taz = 0.62 + Math.sin(t * 0.18) * 0.26; rig.tel = 0.2 + Math.sin(t * 0.13) * 0.06; }
    rig.az += (rig.taz - rig.az) * 0.06; rig.el += (rig.tel - rig.el) * 0.06; rig.target.lerp(rig.tt, 0.05);
    const d = rig.dist; camera.position.set(rig.target.x + Math.sin(rig.az) * Math.cos(rig.el) * d, rig.target.y + Math.sin(rig.el) * d + 0.6, rig.target.z + Math.cos(rig.az) * Math.cos(rig.el) * d);
    camera.lookAt(rig.target);
    for (const k in L.c) L.c[k] += (L.t[k] - L.c[k]) * 0.07;
    applyLights();
    for (const g in mats) { const m = mats[g]; if (m.userData.target) m.color.lerp(m.userData.target, 0.12); m.emissive.setRGB(0, 0, 0); }
    if (pulseG) { const k = (now - pulseT) / 700; if (k < 1) { const v = Math.sin(k * Math.PI) * 0.18; mats[pulseG].emissive.setRGB(v * 0.9, v * 0.75, v * 0.45); } else pulseG = null; }
    for (const s of Object.values(spaces)) { if (s.g.userData.anim) { const k = Math.min(1, (now - s.g.userData.anim) / 900); const e = 1 - Math.pow(1 - k, 3); s.g.position.y = (1 - e) * -0.6; s.g.children.forEach((c, i) => { c.scale.setScalar(Math.max(0.001, Math.min(1, e * 1.6 - i * 0.012))); }); if (k >= 1) s.g.userData.anim = 0; } }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  const api = {
    setSpace(k) {
      Object.entries(spaces).forEach(([n, s]) => s.g.visible = n === k);
      cur = spaces[k]; cur.g.userData.anim = performance.now(); rig.tt.copy(cur.focus);
    },
    setFinish(group, kind, hex) { applyFinish(group, kind, hex); },
    setLight(k) { Object.assign(L.t, flat(LIGHTS[k])); },
    focus(group) {
      const f = cur ? cur.focus.clone() : new Vector3(0, 1, -0.8);
      if (group === 'floor') { f.y = 0.4; rig.tel = 0.42; } else if (group === 'walls') { f.y = 1.5; f.z = -1.6; rig.tel = 0.12; } else { rig.tel = 0.26; }
      rig.tt.copy(f); idle = performance.now(); pulse(group);
    },
    snapshot() { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/jpeg', 0.92); }
  };
  applyLights();
  onReady && onReady(api);
  return api;
}
