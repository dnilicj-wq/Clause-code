// "Design your driveway": a photo visualiser, the way the big paving brands do it (Tobermore Picture It,
// Marshalls, Nicolock). A real house photo stays untouched; only the drive (or the patio in the back
// garden) is re-laid. A homography maps each pixel to ground-plane metres, so blocks, slabs and stones
// are the right size and in true perspective. Lighting comes from the photo's sun: daylight, contact
// shade where the drive meets walls and beds, a soft shadow under the car. One fragment shader.
import { SCENES, glMat, applyH, maskDM } from './scenes.js';

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;uniform float uTime;
uniform sampler2D uPhoto;uniform sampler2D uArea;uniform sampler2D uCar;uniform sampler2D uTexA;uniform sampler2D uTexB;
uniform vec4 uCover;uniform vec2 uPS;uniform mat3 uH;uniform vec4 uDM;uniform float uVb;uniform vec3 uSun;
uniform vec4 uMatA;uniform vec4 uMatB; // tile (m), rotation, gloss, kind (0 resin,1 block,2 tarmac,3 porcelain)
uniform float uProg;uniform vec2 uLayV;
uniform vec4 uSeg[14];uniform float uSegT[14];
uniform vec3 uX; // edging, drainage, lights
uniform vec4 uCarR;uniform float uCarOn;uniform vec4 uShC;uniform vec4 uShA;
uniform vec4 uLit;uniform vec3 uTint; // photo-lit scenes: on, exposure, texture blur (to match the photo's softness)
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
vec2 puvAt(vec2 fc){return uCover.xy+vec2(fc.x/uRes.x,1.-fc.y/uRes.y)*uCover.zw;}
vec3 plane3(vec2 puv){return uH*vec3(puv*uPS,1.);}
vec2 plane(vec2 puv){vec3 q=plane3(puv);return q.xy/q.z;}
vec2 rot(vec2 g,float a){float c=cos(a),s=sin(a);return vec2(c*g.x-s*g.y,s*g.x+c*g.y);}
void main(){
 vec2 fc=gl_FragCoord.xy;vec2 uv=fc/uRes;
 vec2 puv=puvAt(fc);
 vec3 photo=texture2D(uPhoto,puv).rgb;
 vec4 dm=texture2D(uArea,uDM.xy+puv*uDM.zw);
 float area=dm.r;
 vec3 col=photo;
 vec3 q3=plane3(puv);vec2 g=q3.xy/q3.z;
 vec3 sunD=normalize(uSun);
 vec3 sunC=vec3(1.,.965,.91)*.9,skyC=vec3(.62,.67,.76)*.46;
 // car shadow (plane space): soft box plus a darker core under the body
 float carSh=1.;
 if(uCarOn>.0){
  vec2 r=g-uShC.xy;vec2 ax=uShA.xy;vec2 rr=vec2(dot(r,ax),dot(r,vec2(-ax.y,ax.x)));
  vec2 dd=abs(rr)-uShC.zw;float k=length(max(dd,0.))+min(max(dd.x,dd.y),0.);
  carSh=1.-uCarOn*((1.-smoothstep(-.2,.55,k))*.35+(1.-smoothstep(-.45,.08,k))*.4)*smoothstep(.02,.3,dm.g);
 }
 if(area>.003){
  float ao=mix(.6,1.,smoothstep(.3,.97,dm.g));
  // laying sweep: from the house outwards
  float t=(puv.y-uLayV.x)/(uLayV.y-uLayV.x);
  float wob=(vn(vec2(g.x*1.3,0.))-.5)*.06;
  float lay=1.-smoothstep(uProg-.012,uProg+.012,t+wob);
  vec4 a=texture2D(uTexA,rot(g,uMatA.y)/uMatA.x,uLit.z);
  vec4 b=texture2D(uTexB,rot(g,uMatB.y)/uMatB.x,uLit.z);
  vec3 alb=mix(b.rgb,a.rgb,lay);
  float gloss=mix(uMatB.z,uMatA.z,lay);
  // distance to kerb / house edges (plane metres) for edging, drainage and lights
  float dK=99.,tK=0.,dHs=99.,tHs=0.;
  for(int i=0;i<14;i++){
   if(uSegT[i]<.5)continue;
   vec2 A=uSeg[i].xy,B=uSeg[i].zw;vec2 ab=B-A;float L=length(ab);
   float h=clamp(dot(g-A,ab)/(L*L),0.,1.);float d=length(g-A-ab*h);
   if(uSegT[i]<1.5){if(d<dK){dK=d;tK=h*L+float(i)*7.3;}}
   else if(d<dHs){dHs=d;tHs=h*L;}
  }
  float edgeOn=uX.x*lay;
  float bw=.2;
  if(edgeOn>.0&&min(dK,dHs)<bw+.03){
   float d=min(dK,dHs);float tt=dK<dHs?tK:tHs;
   float j=abs(fract(tt/.1)-.5)*2.;float jl=abs(d-bw*.5);
   vec3 eb=vec3(.16,.155,.15)*(.8+.4*h21(vec2(floor(tt/.1),3.)));
   eb*=mix(.55,1.,smoothstep(.0,.08,1.-j));
   eb=mix(eb,vec3(.42,.39,.33),(1.-smoothstep(.0,.006,abs(d-bw)))*.8);
   alb=mix(alb,eb,(1.-smoothstep(bw-.006,bw+.006,d))*edgeOn);
  }
  // channel drain along the house
  float dr=uX.y*lay*(1.-smoothstep(.0,.006,abs(dHs-.42)-.065));
  if(dr>0.){float s=step(.5,fract(tHs/.03));vec3 dc=mix(vec3(.08,.08,.085),vec3(.55,.56,.58),s*step(abs(dHs-.42),.05));alb=mix(alb,dc,dr);gloss=mix(gloss,.6,dr);}
  // light: sun + sky, contact shade
  vec3 lit=alb*(skyC+sunC*.86)*ao*1.08;
  // photo-lit: the old drive's own light and shade (mask B, 0.5 = its median brightness), under the photo's sky colour
  if(uLit.x>.5){
   float lm=dm.b*2.;
   vec3 lin=pow(alb,vec3(2.2))*lm*uLit.y*uTint;
   lin=mix(vec3(dot(lin,vec3(.2126,.7152,.0722))),lin,.8); // overcast: muted colour, like the rest of the photo
   lit=pow(lin,vec3(1./2.2))*mix(1.,ao,.25);
  }
  // sheen: sun glint on resin / porcelain, sky reflection at grazing angles
  vec2 rv=vec2(puv.x,clamp(2.*uVb-puv.y,.002,.998));
  vec3 refl=texture2D(uPhoto,rv,mix(4.5,2.,gloss)).rgb;
  float graze=smoothstep(.0,.5,uVb/max(puv.y,.01)-.5);
  lit=mix(lit,refl*ao,gloss*(.03+.09*graze)*(1.-uLit.x*.4));
  float spark=step(.985,h21(floor(rot(g,uMatA.y)/.006)))*gloss*lay*step(uMatA.w,.5)*(1.-uLit.x*.75);
  lit+=sunC*spark*.35*(.6+.4*sin(uTime*2.+g.x*40.));
  // lights: small stainless in-ground LEDs along the kerb
  if(uX.z>0.){float ph=fract(tK/1.8);float dl=length(vec2((ph-.5)*1.8,dK-.38));float led=1.-smoothstep(.028,.036,dl);
   float glow=exp(-dl*dl*60.)*.35;lit=mix(lit,vec3(.75,.74,.7),led*uX.z*lay);lit+=vec3(1.,.82,.55)*glow*uX.z*lay;
   lit=mix(lit,vec3(1.,.93,.78),(1.-smoothstep(.0,.018,dl))*uX.z*lay);}
  // the fresh line of the lay catches the light
  float edgeL=exp(-pow((t+wob-uProg)*60.,2.))*step(.001,uProg)*step(uProg,.999);
  lit+=vec3(1.,.96,.9)*edgeL*.25;
  col=mix(photo,lit,area*(uMatB.w<-.5?lay:1.));
 }
 col*=carSh;
 // the car sits on top, with a contact shadow that hugs the tyres and sills
 if(uCarOn>.0){
  vec2 cu=(puv-uCarR.xy)/uCarR.zw;
  if(cu.x>-.05&&cu.x<1.05&&cu.y>.4&&cu.y<1.12){
   float occ=0.;
   for(int i=1;i<9;i++){float fi=float(i);vec2 o=vec2(0.,fi*.009);
    float a=texture2D(uCar,cu-o).a*.5+texture2D(uCar,cu-o+vec2(.006,0.)).a*.25+texture2D(uCar,cu-o-vec2(.006,0.)).a*.25;
    occ=max(occ,a*(1.-fi/9.)*smoothstep(.55,.85,cu.y-o.y));}
   col*=1.-occ*.62*uCarOn;
  }
  if(cu.x>0.&&cu.x<1.&&cu.y>0.&&cu.y<1.){vec4 c=texture2D(uCar,cu);col=mix(col,c.rgb/max(c.a,.001),c.a*uCarOn);}
 }
 vec2 c=uv-.5;col*=1.-dot(c,c)*.22;
 gl_FragColor=vec4(col,1.);
}`;

const loadImg = src => { const i = new Image(); i.decoding = 'async'; i.src = src; return i.decode().then(() => i); };

export function createScene(host, { tex, BLENDS, BLOCK_COLOURS, PORCELAIN, onReady, onScene } = {}) {
  const cv = document.createElement('canvas');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: /posterRender/.test(location.search) });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  let prog;
  try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link'); }
  catch (e) { console.warn('viz shader', e); return null; }
  gl.useProgram(prog);
  cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Photo preview of the chosen surface on a house');
  host.appendChild(cv);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uRes', 'uTime', 'uPhoto', 'uArea', 'uCar', 'uTexA', 'uTexB', 'uCover', 'uPS', 'uH', 'uDM', 'uVb', 'uSun', 'uMatA', 'uMatB', 'uProg', 'uLayV', 'uSeg', 'uSegT', 'uX', 'uCarR', 'uCarOn', 'uShC', 'uShA', 'uLit', 'uTint'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  const maxA = aniso ? gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
  const UNIT = { photo: 0, area: 1, car: 2, a: 3, b: 4 };
  const texs = {};
  function upload(name, src, { mip = false, repeat = false } = {}) {
    gl.activeTexture(gl.TEXTURE0 + UNIT[name]);
    const t = texs[name] || (texs[name] = gl.createTexture()); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, name === 'car');
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const w = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
    if (mip) { gl.generateMipmap(gl.TEXTURE_2D); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, maxA)); }
  }

  // ---- surfaces from tex.js (tileable, power of two) ----
  const texCache = new Map();
  function material(s) {
    const key = [s.surface, s.blend, s.pattern, s.bcol, s.tcol, s.pcol].join('|');
    let m = texCache.get(key);
    if (!m) {
      if (s.surface === 'resin') m = { c: tex.aggregate(BLENDS.find(b => b.id === s.blend).c, 512, 7, 3), tile: .34, rot: 0, gloss: .55, kind: 0 };
      else if (s.surface === 'block') m = { c: tex.blocks(s.pattern, BLOCK_COLOURS.find(b => b.id === s.bcol).c, 512, 5), tile: 1.2, rot: s.pattern === 'herringbone' ? Math.PI / 4 : 0, gloss: .12, kind: 1 };
      else if (s.surface === 'tarmac') m = { c: tex.tarmac(s.tcol === 'red', 512, 9), tile: .9, rot: 0, gloss: .08, kind: 2 };
      else m = { c: tex.porcelain(PORCELAIN.find(b => b.id === s.pcol).c, 512, 11), tile: 1.8, rot: 0, gloss: .7, kind: 3 };
      texCache.set(key, m);
    }
    return m;
  }

  // ---- scene geometry ----
  let sc = null, scName = '', DM = null, segs = new Float32Array(56), segT = new Float32Array(14), layV = [0, 1], carR = [0, 0, 0, 0], shC = [0, 0, 0, 0], shA = [1, 0, 0, 0], carImg = null;
  const photoCache = {};
  async function loadScene(name) {
    const S = SCENES[name]; scName = name;
    const [img, mask] = photoCache[name] || (photoCache[name] = await Promise.all([loadImg(S.src), loadImg(S.mask)]));
    sc = S; const [pw, ph] = S.size;
    upload('photo', img, { mip: true });
    upload('area', mask); DM = maskDM(S);
    // kerb and house edges in plane metres
    segs.fill(0); segT.fill(0);
    S.edges.forEach(([i, type], n) => { const a = S.poly[i], b = S.poly[(i + 1) % S.poly.length]; const A = applyH(S.H, ...a), B = applyH(S.H, ...b); segs.set([...A, ...B], n * 4); segT[n] = type === 'house' ? 2 : 1; });
    const ys = S.poly.map(p => p[1]); layV = [Math.min(...ys) / ph, Math.min(1, Math.max(...ys) / ph)];
    // car: image rect in photo uv + a shadow box on the ground from the two near-side tyre contacts
    if (S.car) {
      carImg = carImg || await loadImg(S.car.src);
      upload('car', carImg);
      const cw = S.car.w, chh = cw * carImg.naturalHeight / carImg.naturalWidth, x0 = S.car.x, y0 = S.car.bottom - chh;
      carR = [x0 / pw, y0 / ph, cw / pw, chh / ph];
      const P = S.car.foot.map(([fx, fy]) => applyH(S.H, x0 + fx * cw, y0 + fy * chh));
      const mid2 = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      const F = mid2(P[0], P[1]), R = mid2(P[2], P[3]), ax = [R[0] - F[0], R[1] - F[1]], L = Math.hypot(...ax); ax[0] /= L; ax[1] /= L;
      const c = [(P[0][0] + P[1][0] + P[2][0] + P[3][0]) / 4, (P[0][1] + P[1][1] + P[2][1] + P[3][1]) / 4];
      shC = [c[0], c[1], L / 2 + .1, (dist(P[0], P[1]) + dist(P[2], P[3])) / 4 * 1.3]; shA = [ax[0], ax[1], 0, 0];
    }
    fit(); onScene && onScene(name, !!S.car);
  }

  // ---- render loop ----
  let W = 0, H = 0, raf = 0, until = 0, visible = true, cover = [0, 0, 1, 1];
  const coarse = matchMedia('(pointer:coarse)').matches;
  function fit() {
    if (!sc) return;
    const a = W / H, [pw, ph] = sc.size, pa = pw / ph;
    let fw = 1, fh = 1; if (a > pa) fh = pa / a; else fw = a / pa;
    const [fx, fy] = sc.focus;
    cover = [Math.min(1 - fw, Math.max(0, fx - fw / 2)), Math.min(1 - fh, Math.max(0, fy - fh / 2)), fw, fh];
  }
  function resize() { W = host.clientWidth; H = host.clientHeight; if (!W || !H) return; const d = Math.min(devicePixelRatio || 1, coarse ? 2 : 1.75); cv.width = Math.round(W * d); cv.height = Math.round(H * d); gl.viewport(0, 0, cv.width, cv.height); fit(); kick(); }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(host);
  let state = null, cur = null, prev = null, lay = null, carOn = 1, carT = 1, X = [0, 0, 0], ready = false;
  const t0 = performance.now();
  function kick(ms = 1200) { until = Math.max(until, performance.now() + ms); if (!raf && visible) raf = requestAnimationFrame(loop); }
  function loop(t) {
    raf = 0; if (!sc || !cur) return;
    let p = 1;
    if (lay) { const k = Math.max(0, Math.min(1, (t - lay.t0) / 1300)); p = 1 - Math.pow(1 - k, 3); if (k >= 1) { lay = null; prev = cur; upload('b', prev.c, { mip: true, repeat: true }); } }
    if (lay && t < lay.t0) p = 0;
    carOn += (carT - carOn) * .14;
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uTime, (t - t0) / 1000);
    [['uPhoto', 'photo'], ['uArea', 'area'], ['uCar', 'car'], ['uTexA', 'a'], ['uTexB', 'b']].forEach(([u, n]) => gl.uniform1i(U[u], UNIT[n]));
    gl.uniform4fv(U.uCover, cover); gl.uniform2f(U.uPS, ...sc.size); gl.uniformMatrix3fv(U.uH, false, glMat(sc.H));
    gl.uniform4fv(U.uDM, DM); gl.uniform1f(U.uVb, sc.vb / sc.size[1]); gl.uniform3fv(U.uSun, sc.sun);
    gl.uniform4f(U.uMatA, cur.tile, cur.rot, cur.gloss, cur.kind); gl.uniform4f(U.uMatB, prev.tile, prev.rot, prev.gloss, prev.kind);
    gl.uniform1f(U.uProg, lay ? p * 1.06 : 1.2); gl.uniform2fv(U.uLayV, layV);
    gl.uniform4fv(U.uSeg, segs); gl.uniform1fv(U.uSegT, segT); gl.uniform3fv(U.uX, X);
    const L = sc.lit; gl.uniform4f(U.uLit, L ? 1 : 0, L ? L.exp : 1, L ? L.bias : 0, 0); gl.uniform3fv(U.uTint, L ? L.tint : [1, 1, 1]);
    gl.uniform4fv(U.uCarR, carR); gl.uniform1f(U.uCarOn, sc.car ? carOn : 0); gl.uniform4fv(U.uShC, shC); gl.uniform4fv(U.uShA, shA);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!ready) { ready = true; onReady && onReady(); }
    if (lay || t < until || Math.abs(carT - carOn) > .002) raf = requestAnimationFrame(loop);
  }
  const PHOTO = { tile: 1, rot: 0, gloss: 0, kind: -1 };
  // animate: re-lay from the previous surface; fromPhoto: lay over the original photo (first view, scene change)
  function apply(s, animate, fromPhoto) {
    const m = material(s);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fromPhoto && !reduce) { prev = PHOTO; cur = m; upload('a', m.c, { mip: true, repeat: true }); upload('b', m.c, { mip: true, repeat: true }); lay = { t0: performance.now() + 250 }; }
    else if (m !== cur) {
      if (animate && cur && !reduce) { if (lay) { prev = cur; upload('b', prev.c, { mip: true, repeat: true }); } else { prev = cur; } lay = { t0: performance.now() }; }
      else { prev = m; upload('b', m.c, { mip: true, repeat: true }); lay = null; }
      cur = m; upload('a', m.c, { mip: true, repeat: true });
    }
    const E = s.extras || {}; X = [E.edging || (s.surface === 'tarmac' && s.tedge) ? 1 : 0, E.drainage ? 1 : 0, E.lighting ? 1 : 0];
    kick(lay ? 1900 : 600);
  }
  let loading = null;
  return {
    async set(s) {
      const first = !state; const want = s.scene in SCENES ? s.scene : 'front';
      const surfChanged = !state || ['surface', 'blend', 'pattern', 'bcol', 'tcol', 'pcol'].some(k => state[k] !== s[k]);
      state = JSON.parse(JSON.stringify(s));
      if (want !== scName) {
        const job = loading = (async () => { if (!first) { cv.style.opacity = 0; await new Promise(r => setTimeout(r, 220)); } await loadScene(want); })();
        await job; if (job !== loading) return;
        resize(); apply(state, false, true); cv.style.opacity = 1;
        return;
      }
      apply(state, surfChanged && !first);
    },
    car(on) { carT = on ? 1 : 0; kick(800); },
    get scene() { return scName; }
  };
}
