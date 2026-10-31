// Real-time garage: a stained, cracked slab is covered by a polyaspartic pour that
// spreads from a tipping bucket. Every finish (concrete, flake, metallic, solid)
// is generated in the floor shader, so swapping colourways costs nothing.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, PlaneGeometry, LatheGeometry,
  CylinderGeometry, TorusGeometry, MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial,
  Color, Vector2, Vector3, CanvasTexture, SRGBColorSpace, ACESFilmicToneMapping, PMREMGenerator,
  RectAreaLight, HemisphereLight, PointLight, Raycaster, Plane, BackSide, DoubleSide, WebGLRenderTarget, Matrix4, HalfFloatType,
} from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const outPow = (x, p) => 1 - Math.pow(1 - clamp01(x), p);
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

export const FINISHES = {
  flake: {
    graphite: { name: 'Graphite', colors: ['#3a3c40', '#16181b', '#62666c', '#c9ccce'] },
    tidal: { name: 'Tidal', colors: ['#2a3442', '#1a2c45', '#7d8d9e', '#d9dee3'] },
    sandstone: { name: 'Sandstone', colors: ['#6e6152', '#3d362f', '#a8987f', '#e6dfd2'] },
  },
  metallic: {
    pewter: { name: 'Pewter', colors: ['#55595f', '#b4b9bf', '#26292d', '#8a9097'] },
    midnight: { name: 'Midnight', colors: ['#141a2e', '#3f63b8', '#070910', '#25346a'] },
    copper: { name: 'Copper', colors: ['#3d2318', '#b8724a', '#1c110c', '#7a4329'] },
  },
  solid: {
    slate: { name: 'Slate', colors: ['#4b5058', '#4b5058', '#4b5058', '#4b5058'] },
    fog: { name: 'Fog', colors: ['#a9adb2', '#a9adb2', '#a9adb2', '#a9adb2'] },
    onyx: { name: 'Onyx', colors: ['#1d1e21', '#1d1e21', '#1d1e21', '#1d1e21'] },
  },
};
const TYPE = { concrete: 0, flake: 1, metallic: 2, solid: 3 };

const GLSL_COMMON = /* glsl */`
uniform int uTypeA; uniform vec3 uColA[4];
uniform int uTypeB; uniform vec3 uColB[4];
uniform vec2 uOrigin; uniform float uPour; uniform float uTime; uniform float uSeed;
uniform sampler2D uMirror; uniform vec2 uMirrorTexel; uniform float uMirrorOn;
varying vec3 vWPos; varying vec4 vMirrorUv;
float gRough; float gCoat; float gMetal; float gRim; float gMask;

float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec2 h22(vec2 p){ float n = h21(p); return vec2(n, h21(p+n*19.19)); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+17.1; a*=.5; } return s; }

// voronoi: returns (F1, F2-F1, cell id hash)
vec3 voro(vec2 p){
  vec2 g=floor(p), f=fract(p); float d1=8., d2=8.; vec2 id=vec2(0);
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
    vec2 o=vec2(x,y); vec2 r=o+h22(g+o)-f; float d=dot(r,r);
    if(d<d1){ d2=d1; d1=d; id=g+o; } else if(d<d2){ d2=d; }
  }
  return vec3(sqrt(d1), sqrt(d2)-sqrt(d1), h21(id));
}

vec3 pickChip(float r, vec3 c[4]){
  return r < .42 ? c[1] : r < .74 ? c[2] : r < .93 ? c[0]*1.25 : c[3];
}

vec3 finish(int t, vec3 c[4], vec2 p, out float rough, out float coat, out float metal){
  if(t==0){ // concrete slab: mottling, stains, saw-cut joints, hairline cracks
    rough=.86; coat=0.; metal=0.;
    float m = fbm(p*1.3);
    vec3 col = mix(vec3(.24,.24,.23), vec3(.42,.41,.39), m);
    col *= .92 + .14*vnoise(p*18.);
    col *= .9 + .1*h21(floor(p*220.));
    float stain = smoothstep(.55,.8, fbm(p*.45+3.));
    col = mix(col, col*.42, stain*.75);
    float oil = smoothstep(.62,.95, fbm(p*1.1+11.)) * smoothstep(2.2, .4, length(p-vec2(.3,-3.4)));
    col = mix(col, vec3(.05,.05,.05), oil*.85);
    float crack = 1.-smoothstep(.0,.005, abs(fbm(p*.55+7.)-.5));
    crack *= smoothstep(.4,.7, fbm(p*.9+2.));
    col = mix(col, col*.45, crack);
    float jx = 1.-smoothstep(.0,.012, abs(p.x));
    float jz = 1.-smoothstep(.0,.012, abs(fract(p.y/3.+.5)-.5)*3.);
    col = mix(col, col*.35, max(jx, 0.)*.9);
    col = mix(col, col*.35, clamp(jz,0.,1.)*.9);
    return col;
  }
  coat = 1.;
  if(t==1){ // full flake broadcast, two chip scales
    rough=.1; metal=0.;
    vec3 v = voro(p*64.);
    vec3 col = pickChip(v.z, c) * (.82 + .32*h21(vec2(v.z*91.)));
    col = mix(col*.6, col, smoothstep(.0,.08,v.y));
    vec3 v2 = voro(p*34.+5.3);
    if(v2.z > .8 && v2.y > .07) col = pickChip(fract(v2.z*7.3), c) * (.85+.3*fract(v2.z*13.1));
    vec3 avg = (c[1]*.42 + c[2]*.32 + c[0]*1.25*.19 + c[3]*.07) * .88;
    float px = length(fwidth(p*64.));
    return mix(col, avg, smoothstep(.45, 2.2, px));
  }
  if(t==2){ // metallic epoxy: warped flow with lap lines
    rough=.14; metal=.32;
    vec2 q = p*.32;
    float w = fbm(q + vec2(fbm(q*1.6+1.7), fbm(q*1.6+9.2))*1.8);
    float band = sin(w*16. + fbm(p*.8)*4.)*.5+.5;
    vec3 col = mix(c[0], c[3], smoothstep(.25,.75,w));
    col = mix(col, c[1], pow(band, 6.)*.75);
    col = mix(col, c[2], smoothstep(.62,.9,fbm(q*2.3+4.))*.6);
    return col;
  }
  rough=.12; metal=0.; // solid
  return c[0] * (.95 + .07*fbm(p*2.5));
}
`;

function makeFloorMaterial(uniforms) {
  const mat = new MeshPhysicalMaterial({ color: '#ffffff', roughness: 1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec3 vWPos; varying vec4 vMirrorUv; uniform mat4 uMirrorMatrix;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vMirrorUv = uMirrorMatrix * vec4(transformed, 1.0);');
    shader.fragmentShader = GLSL_COMMON + shader.fragmentShader
      .replace('#include <map_fragment>', /* glsl */`
        #include <map_fragment>
        vec2 fp = vWPos.xz;
        float rA, cA, mA, rB, cB, mB;
        vec3 colA = finish(uTypeA, uColA, fp, rA, cA, mA);
        vec3 colB = finish(uTypeB, uColB, fp, rB, cB, mB);
        float n = fbm(fp*.85 + uSeed)*.9 + fbm(fp*3.3 + uSeed)*.18;
        float d = length(fp - uOrigin) + (n-.55)*min(1.4, uPour*.45);
        float front = uPour - d;
        gMask = smoothstep(0., .025, front);
        gRim = smoothstep(0., .02, front) * (1. - smoothstep(.02, .2, front)) * step(.001, uPour);
        vec3 col = mix(colA, colB, gMask);
        // contact shadow along walls
        float wall = min(min(3.2 - abs(fp.x), fp.y + 7.0), 9.);
        col *= mix(.55, 1., smoothstep(0., .7, wall));
        diffuseColor.rgb = col;
        gRough = mix(rA, rB, gMask); gRough = mix(gRough, .02, gRim);
        gCoat = mix(cA, cB, gMask);
        gMetal = mix(mA, mB, gMask);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = gRough;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\n metalnessFactor = gMetal;')
      .replace('#include <normal_fragment_maps>', /* glsl */`
        #include <normal_fragment_maps>
        { vec2 dir = normalize(vWPos.xz - uOrigin + 1e-4);
          vec3 tilt = vec3(dir.x, 0., dir.y) * gRim * .55;
          normal = normalize(normal + (viewMatrix * vec4(tilt, 0.)).xyz); }`)
      .replace('#include <opaque_fragment>', /* glsl */`
        if (uMirrorOn > .5) {
          vec2 muv = vMirrorUv.xy / vMirrorUv.w + normal.xz * .012;
          vec3 refl = vec3(0.);
          refl += texture2D(uMirror, muv).rgb * .4;
          refl += texture2D(uMirror, muv + vec2(uMirrorTexel.x*2., 0.)).rgb * .15;
          refl += texture2D(uMirror, muv - vec2(uMirrorTexel.x*2., 0.)).rgb * .15;
          refl += texture2D(uMirror, muv + vec2(0., uMirrorTexel.y*2.)).rgb * .15;
          refl += texture2D(uMirror, muv - vec2(0., uMirrorTexel.y*2.)).rgb * .15;
          float ndv = clamp(dot(normal, normalize(vViewPosition)), 0., 1.);
          float fres = mix(.16, .75, pow(1. - ndv, 3.));
          outgoingLight = mix(outgoingLight, outgoingLight + refl, gCoat * fres);
        }
        #include <opaque_fragment>`)
      .replace('#include <lights_physical_fragment>', /* glsl */`
        #include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoat = gCoat;
          material.clearcoatRoughness = .03;
        #endif`);
  };
  mat.customProgramCacheKey = () => 'floor-v2';
  return mat;
}

function labelTexture(company) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#f2f3f4'; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = '#2d55e6'; g.fillRect(0, 40, 1024, 176);
  g.fillStyle = '#ffffff';
  g.font = '800 92px "Big Shoulders Display", Impact, sans-serif';
  g.textBaseline = 'middle';
  g.fillText('POLYASPARTIC', 60, 112);
  g.font = '600 34px Geist, Arial, sans-serif';
  g.fillText((company || 'PRO SYSTEM').toUpperCase() + '  ·  COMMERCIAL GRADE', 64, 178);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function createFloorScene(canvas, opts = {}) {
  const mobile = innerWidth < 760;
  RectAreaLightUniformsLib.init();
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: !!opts.capture, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.capture ? 2 : mobile ? 1.5 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor('#111214');

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.05, 60);

  /* ---------- environment for reflections: dark room + bright strips + open door ---------- */
  const env = new Scene();
  env.add(new Mesh(new BoxGeometry(6.4, 2.8, 8.6), new MeshBasicMaterial({ color: '#17181b', side: BackSide })));
  const ceilEnv = new Mesh(new PlaneGeometry(6.4, 8.6), new MeshBasicMaterial({ color: '#5d6066', side: DoubleSide }));
  ceilEnv.rotation.x = Math.PI / 2; ceilEnv.position.y = 1.39; env.add(ceilEnv);
  const door = new Mesh(new PlaneGeometry(5.4, 2.3), new MeshBasicMaterial({ color: new Color('#cfe0f5').multiplyScalar(1.6), side: DoubleSide }));
  door.position.set(0, 0.1, 4.25); env.add(door);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(env, 0.0).texture;
  scene.environmentIntensity = 0.35;

  /* ---------- room ---------- */
  const W = 6.4, Dz = 7.2, Hh = 2.75;
  const wallMat = new MeshStandardMaterial({ color: '#4a4d52', roughness: 0.92 });
  const ceilMat = new MeshStandardMaterial({ color: '#d4d5d6', roughness: 0.9 });
  const room = new Group(); scene.add(room);
  const plane = (w, h, mat, pos, rot) => { const m = new Mesh(new PlaneGeometry(w, h), mat); m.position.set(...pos); m.rotation.set(...rot); room.add(m); return m; };
  plane(W, Hh, wallMat, [0, Hh / 2, -Dz], [0, 0, 0]);
  plane(Dz + 2, Hh, wallMat, [-W / 2, Hh / 2, -Dz / 2 + 1], [0, Math.PI / 2, 0]);
  plane(Dz + 2, Hh, wallMat, [W / 2, Hh / 2, -Dz / 2 + 1], [0, -Math.PI / 2, 0]);
  plane(W, Dz + 2, ceilMat, [0, Hh, -Dz / 2 + 1], [Math.PI / 2, 0, 0]);
  // baseboard trim
  const trim = new MeshStandardMaterial({ color: '#2a2c30', roughness: 0.6 });
  for (const s of [-1, 1]) { const b = new Mesh(new BoxGeometry(0.02, 0.12, Dz + 2), trim); b.position.set(s * (W / 2 - 0.01), 0.06, -Dz / 2 + 1); room.add(b); }

  // cabinets along the back wall
  const cabMat = new MeshPhysicalMaterial({ color: '#25272b', roughness: 0.35, metalness: 0.4, clearcoat: 0.6 });
  const handleMat = new MeshStandardMaterial({ color: '#c8ccd2', metalness: 1, roughness: 0.25 });
  const topMat = new MeshStandardMaterial({ color: '#6b5a48', roughness: 0.55 });
  for (let i = 0; i < 5; i++) {
    const x = -2.4 + i * 1.2;
    const base = new Mesh(new BoxGeometry(1.16, 0.88, 0.6), cabMat); base.position.set(x, 0.48, -Dz + 0.31); room.add(base);
    const upper = new Mesh(new BoxGeometry(1.16, 0.75, 0.38), cabMat); upper.position.set(x, 1.95, -Dz + 0.2); room.add(upper);
    const h1 = new Mesh(new BoxGeometry(0.4, 0.02, 0.02), handleMat); h1.position.set(x, 0.82, -Dz + 0.62); room.add(h1);
    const h2 = new Mesh(new BoxGeometry(0.4, 0.02, 0.02), handleMat); h2.position.set(x, 1.62, -Dz + 0.4); room.add(h2);
  }
  const top = new Mesh(new BoxGeometry(6.1, 0.05, 0.66), topMat); top.position.set(0, 0.945, -Dz + 0.33); room.add(top);
  const kick = new Mesh(new BoxGeometry(6.1, 0.04, 0.56), new MeshStandardMaterial({ color: '#0d0e10' })); kick.position.set(0, 0.02, -Dz + 0.3); room.add(kick);
  // tall locker on the left wall
  const tall = new Mesh(new BoxGeometry(0.6, 2.1, 1.1), cabMat); tall.position.set(-W / 2 + 0.31, 1.06, -3.6); room.add(tall);
  // wall-mounted tyre rack on the right
  const tyreMat = new MeshStandardMaterial({ color: '#141516', roughness: 0.8 });
  for (let i = 0; i < 2; i++) { const t = new Mesh(new TorusGeometry(0.31, 0.1, 18, 48), tyreMat); t.rotation.y = Math.PI / 2; t.position.set(W / 2 - 0.16, 1.7, -2.8 - i * 0.62); room.add(t); }

  // ceiling strip lights + real area lights
  const stripMat = new MeshBasicMaterial({ color: new Color('#ffffff').multiplyScalar(3) });
  for (const x of [-1.3, 1.3]) for (const z of [-1.9, -5.0]) {
    const s = new Mesh(new BoxGeometry(0.1, 0.03, 2.4), stripMat); s.position.set(x, Hh - 0.02, z); room.add(s);
    const l = new RectAreaLight('#fff6ea', 14, 0.12, 2.4); l.position.set(x, Hh - 0.04, z); l.lookAt(x, 0, z); scene.add(l);
  }
  scene.add(new HemisphereLight('#c9d6ea', '#2a2622', 0.35));
  const doorLight = new PointLight('#d8e6ff', 6, 12, 1.6); doorLight.position.set(0, 1.6, 1.4); scene.add(doorLight);

  /* ---------- floor ---------- */
  const uniforms = {
    uTypeA: { value: 0 }, uColA: { value: [0, 1, 2, 3].map(() => new Color()) },
    uTypeB: { value: 1 }, uColB: { value: [0, 1, 2, 3].map(() => new Color()) },
    uOrigin: { value: new Vector2(0.6, -2.6) }, uPour: { value: 0 }, uTime: { value: 0 }, uSeed: { value: 3.7 },
    uMirror: { value: null }, uMirrorMatrix: { value: new Matrix4() }, uMirrorTexel: { value: new Vector2(1 / 512, 1 / 512) }, uMirrorOn: { value: 1 },
  };
  const floor = new Mesh(new PlaneGeometry(W, Dz + 2.4, 1, 1), makeFloorMaterial(uniforms));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -Dz / 2 + 1.2);
  scene.add(floor);

  // planar mirror: render the room from a camera reflected in the floor plane
  const mirrorRT = new WebGLRenderTarget(512, 512, { type: HalfFloatType });
  uniforms.uMirror.value = mirrorRT.texture;
  const mirrorCam = new PerspectiveCamera();
  const bias = new Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
  const lookTarget = new Vector3();
  function renderMirror() {
    mirrorCam.copy(camera);
    mirrorCam.position.set(camera.position.x, -camera.position.y, camera.position.z);
    camera.getWorldDirection(lookTarget);
    lookTarget.y *= -1; lookTarget.add(mirrorCam.position);
    mirrorCam.up.set(0, -1, 0);
    mirrorCam.lookAt(lookTarget);
    mirrorCam.updateMatrixWorld();
    mirrorCam.projectionMatrix.copy(camera.projectionMatrix);
    uniforms.uMirrorMatrix.value.copy(bias).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse).multiply(floor.matrixWorld);
    floor.visible = false;
    renderer.setRenderTarget(mirrorRT);
    renderer.clear();
    renderer.render(scene, mirrorCam);
    renderer.setRenderTarget(null);
    floor.visible = true;
  }

  function setLayer(which, type, colors) {
    uniforms[which === 'A' ? 'uTypeA' : 'uTypeB'].value = TYPE[type];
    const arr = uniforms[which === 'A' ? 'uColA' : 'uColB'].value;
    (colors || ['#000', '#000', '#000', '#000']).forEach((c, i) => arr[i].set(c));
  }

  /* ---------- bucket ---------- */
  const bucket = new Group();
  const pivot = new Group(); pivot.add(bucket); scene.add(pivot);
  const profile = [[0, 0], [0.135, 0], [0.142, 0.01], [0.165, 0.37], [0.172, 0.375], [0.176, 0.385], [0.168, 0.39]].map(([x, y]) => new Vector2(x, y));
  const pailMat = new MeshPhysicalMaterial({ color: '#eceef0', roughness: 0.38, clearcoat: 0.4, side: DoubleSide });
  const pail = new Mesh(new LatheGeometry(profile, 48), pailMat);
  bucket.add(pail);
  const label = new Mesh(new CylinderGeometry(0.1585, 0.1475, 0.2, 48, 1, true), new MeshStandardMaterial({ map: labelTexture(opts.company), roughness: 0.5 }));
  label.position.y = 0.18; label.rotation.y = -0.6; bucket.add(label);
  const handle = new Mesh(new TorusGeometry(0.17, 0.006, 8, 40, Math.PI), new MeshStandardMaterial({ color: '#9aa0a6', metalness: 1, roughness: 0.3 }));
  handle.position.y = 0.37; handle.rotation.y = Math.PI / 2; bucket.add(handle);
  // liquid surface inside the pail + pour stream
  const liquidMat = new MeshPhysicalMaterial({ color: '#30343a', roughness: 0.05, clearcoat: 1, metalness: 0.1 });
  const surface = new Mesh(new CylinderGeometry(0.158, 0.158, 0.01, 40), liquidMat); surface.position.y = 0.3; bucket.add(surface);
  const stream = new Mesh(new CylinderGeometry(0.022, 0.034, 1, 20, 1, true), liquidMat);
  scene.add(stream);
  // bucket hangs so its rim edge sits on the pivot; tilting about z pours toward -x
  bucket.position.set(0.168, -0.385, 0);

  function setLiquidColor(colors) {
    const c = new Color(colors[0]).lerp(new Color(colors[2] || colors[0]), 0.35);
    liquidMat.color.copy(c);
  }

  /* ---------- camera ---------- */
  const camBase = { p: new Vector3(0.15, 1.55, 1.25), t: new Vector3(-0.15, 0.15, -3.6) };
  if (opts.mode === 'config') { camBase.p.set(-0.4, 1.35, 0.6); camBase.t.set(0.1, 0, -3.2); }
  if (opts.capture?.cam) { camBase.p.set(...opts.capture.cam.p); camBase.t.set(...opts.capture.cam.t); }
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scrollP = 0, portrait = false;
  const camPortrait = { p: new Vector3(0.25, 2.25, 0.9), t: new Vector3(0.1, -0.2, -2.7) };
  function placeCamera() {
    const cb = portrait && !opts.capture ? camPortrait : camBase;
    pointer.sx += (pointer.x - pointer.sx) * 0.05; pointer.sy += (pointer.y - pointer.sy) * 0.05;
    camera.position.set(cb.p.x + pointer.sx * 0.35, cb.p.y - pointer.sy * 0.15 + scrollP * 0.5, cb.p.z - scrollP * 0.9);
    camera.lookAt(cb.t.x + pointer.sx * 0.2, cb.t.y, cb.t.z);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    portrait = w / h < 0.85 && opts.mode !== 'config';
    camera.fov = w / h < 0.85 ? 62 : w / h < 1.3 ? 50 : 42;
    camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio() * 0.5;
    mirrorRT.setSize(Math.round(w * pr), Math.round(h * pr));
    uniforms.uMirrorTexel.value.set(1 / (w * pr), 1 / (h * pr));
  }

  /* ---------- timelines ---------- */
  const POUR_ORIGIN = new Vector3(0.55, 0, -2.5);
  const RMAX = 10.5;
  let tl = null; // { start, kind }
  let running = false, raf = 0, visible = true;

  function heroPour(t) {
    // t in ms since start
    const hold = 0.55 + 0.12;
    const drop = outPow(t / 650, 3);
    const tilt = smooth((t - 500) / 750) * (1 - smooth((t - 3700) / 650));
    const lift = smooth((t - 4300) / 800);
    pivot.visible = t < 5200;
    pivot.position.set((portrait ? 0.05 : POUR_ORIGIN.x) + 0.42, hold + (1 - drop) * 1.6 + lift * 1.6, POUR_ORIGIN.z);
    pivot.rotation.z = tilt * 1.95;
    surface.visible = tilt < 0.6;
    // stream
    const sOn = smooth((t - 1050) / 220), sOff = smooth((t - 3450) / 300);
    const lip = new Vector3(); pivot.getWorldPosition(lip);
    stream.visible = sOn > 0 && sOff < 1;
    const top = lip.y - 0.02, len = Math.max(0.001, top * sOn);
    stream.scale.set(1 - sOff * 0.7, len, 1 - sOff * 0.7);
    stream.position.set(lip.x - 0.05, top - len / 2 - sOff * top * 0.5, lip.z);
    uniforms.uOrigin.value.set(lip.x - 0.05, lip.z);
    const u = clamp01((t - 1200) / 4200);
    uniforms.uPour.value = RMAX * (1 - Math.pow(1 - u, 2.6)) * (u > 0 ? 1 : 0);
    return t < 5600;
  }

  function wipe(t) {
    const u = clamp01(t / 1500);
    uniforms.uPour.value = RMAX * (1 - Math.pow(1 - u, 2.4));
    return u < 1;
  }

  function frame(now) {
    if (!running) return;
    uniforms.uTime.value = now * 0.001;
    if (tl) {
      const t = now - tl.start;
      const more = tl.kind === 'hero' ? heroPour(t) : wipe(t);
      if (!more) tl = null;
    }
    placeCamera();
    camera.updateMatrixWorld();
    renderMirror();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || !visible) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const current = { type: 'flake', key: 'graphite' };
  const ray = new Raycaster();
  const groundPlane = new Plane(new Vector3(0, 1, 0), 0);

  const api = {
    resize, start, stop, uniforms, scene, floor,
    setPointer(x, y) { pointer.x = x; pointer.y = y; },
    setScroll(p) { scrollP = p; },
    renderOnce() { placeCamera(); camera.updateMatrixWorld(); renderMirror(); renderer.render(scene, camera); },
    setVisible(v) { visible = v; v ? start() : stop(); },
    playHero(type = 'flake', key = 'graphite') {
      setLayer('A', 'concrete'); setLayer('B', type, FINISHES[type][key].colors);
      setLiquidColor(FINISHES[type][key].colors);
      Object.assign(current, { type, key });
      uniforms.uPour.value = 0;
      tl = { start: performance.now(), kind: 'hero' };
    },
    showStatic(type, key, poured = true) {
      pivot.visible = false; stream.visible = false;
      setLayer('A', 'concrete');
      if (type === 'concrete') { setLayer('B', 'concrete'); }
      else setLayer('B', type, FINISHES[type][key].colors);
      uniforms.uPour.value = poured ? RMAX + 4 : 0;
      Object.assign(current, { type, key });
    },
    // Configurator: pour the new finish over the current one, from a floor point
    pourFinish(type, key, origin) {
      if (current.type === type && current.key === key) return;
      setLayer('A', current.type, current.type === 'concrete' ? null : FINISHES[current.type][current.key].colors);
      setLayer('B', type, FINISHES[type][key].colors);
      uniforms.uOrigin.value.copy(origin || new Vector2(0.1, -2.4));
      uniforms.uSeed.value = Math.random() * 40;
      Object.assign(current, { type, key });
      if (opts.reduceMotion) { uniforms.uPour.value = RMAX + 4; api.renderOnce(); return; }
      uniforms.uPour.value = 0;
      tl = { start: performance.now(), kind: 'wipe' };
      start();
    },
    floorPointFromClient(cx, cy) {
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera(new Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
      const hit = new Vector3();
      return ray.ray.intersectPlane(groundPlane, hit) ? new Vector2(hit.x, hit.z) : null;
    },
    dispose() { stop(); renderer.dispose(); pmrem.dispose(); },
  };

  pivot.visible = false; stream.visible = false;
  resize();
  new ResizeObserver(resize).observe(canvas);
  if (!opts.capture) new IntersectionObserver(([e]) => api.setVisible(e.isIntersecting), { rootMargin: '100px' }).observe(canvas);
  return api;
}
