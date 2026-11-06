// Hero: a real house photo (sharp, no fake depth of field). Only the driveway is redrawn, in true
// perspective: a homography maps every drive pixel to ground-plane metres, so the new resin-bound
// stone is the right size everywhere. On a photo-lit scene the old drive is the photo itself and the
// resin takes the photo's own light (lighting map in the mask's B channel); otherwise a tired concrete
// drive is drawn. Move (desktop) or swipe
// (phone) across the drive and fresh resin pours over it. Raw WebGL, one fragment shader.
// Strokes go into a 2D mask canvas plus a "wet" canvas that fades: fresh resin is glossy
// (it reflects the house) and settles to a satin finish.
import { SCENES, glMat, maskDM } from './scenes.js';

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uLight;
uniform sampler2D uPhoto;uniform sampler2D uDrive;uniform sampler2D uMask;uniform sampler2D uWet;
uniform vec4 uCover;uniform vec2 uPS;uniform mat3 uH;uniform vec4 uDM;uniform float uVb;uniform vec3 uSun;
uniform vec2 uTexel;uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;uniform float uDone;
uniform vec4 uLit;uniform vec3 uTint;
uniform sampler2D uSurf;uniform vec4 uMat; // non-resin surface: tile (m), rotation, gloss, kind (0 resin, 1 block, 2 tarmac, 3 porcelain)
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 h22(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){s+=a*vn(p);p=m*p;a*=.5;}return s;}
float fbm3(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<3;i++){s+=a*vn(p);p=m*p;a*=.5;}return s;}
vec4 vor(vec2 p,out float idh){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;vec2 off=vec2(0);vec2 id=vec2(0);
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=h22(i+g);o=.5+.42*sin(6.2831*o);vec2 r=g+o-f;float d=dot(r,r);
  if(d<d1){d2=d1;d1=d;off=r;id=i+g;}else if(d<d2){d2=d;}}
 idh=h21(id*1.37+.11);d1=sqrt(d1);d2=sqrt(d2);return vec4(d1,d2-d1,off);}
vec2 rot2(vec2 g,float a){float c=cos(a),s=sin(a);return vec2(c*g.x-s*g.y,s*g.x+c*g.y);}
vec2 puvAt(vec2 fc){return uCover.xy+vec2(fc.x/uRes.x,1.-fc.y/uRes.y)*uCover.zw;}
vec2 plane(vec2 puv){vec3 q=uH*vec3(puv*uPS,1.);return q.xy/q.z;}
void main(){
 vec2 fc=gl_FragCoord.xy;vec2 uv=fc/uRes;
 vec2 puv=puvAt(fc);
 vec3 photo=texture2D(uPhoto,puv).rgb;
 vec4 dm=texture2D(uDrive,uDM.xy+puv*uDM.zw);
 float drive=dm.r;
 vec3 col=photo;
 if(drive>.003){
  vec2 g=plane(puv);
  float eff=max(length(plane(puvAt(fc+vec2(1.,0.)))-g),length(plane(puvAt(fc+vec2(0.,1.)))-g));
  float X=g.x,z=g.y;
  vec4 mk=texture2D(uMask,vec2(uv.x,1.-uv.y));
  float nEdge=fbm3(fc*.01);
  float m=smoothstep(.36,.68,mk.r+(nEdge-.5)*.22);
  float det=1.-smoothstep(.002,.02,eff);
  // ----- old surface: tired concrete slabs, cracks, moss, oil -----
  vec3 oldc=vec3(0.);float oldRough=1.;
  if(m<.999&&uLit.x<.5){
   float n=fbm(g*2.2);
   float grit=vn(g*90.)*.5+vn(g*190.)*.5;
   vec3 conc=vec3(.60,.585,.55)*(.7+.45*n)*(1.+(grit-.5)*.3*det);
   float jz=abs(fract(z/2.4)-.5)*2.4;float jx=abs(fract((X+.6)/2.4)-.5)*2.4;
   float jw=.006+.012*fbm3(g*8.);float joint=1.-smoothstep(.0,.006+eff,1.2-max(jx,jz)-jw);
   float jnear=1.-smoothstep(.0,.06,1.2-max(jx,jz)-jw);
   float idc;vec4 cr=vor(g*1.6+vec2(fbm3(g*3.)*.5,fbm3(g*3.+4.)*.5),idc);
   float crackA=smoothstep(.4,.62,fbm3(g*.9+3.));
   float crack=(1.-smoothstep(.0,.012+eff*1.4,cr.y*.6))*crackA;
   float chip=smoothstep(.62,.8,fbm(g*6.))*.6;
   float near=max(crack,joint);
   float moss=(1.-smoothstep(.0,.012+eff,cr.y*.6-.006))*crackA*smoothstep(.55,.75,vn(g*7.));
   moss=max(moss,joint*smoothstep(.62,.8,vn(g*5.+9.)))*.85;
   float blades=smoothstep(.55,.8,vn(g*vec2(160.,60.)))*det;
   float oil=smoothstep(.56,.78,fbm(g*.7+vec2(1.7,5.)))*smoothstep(1.6,.3,length((g-vec2(2.2,3.))*vec2(.6,.35)));
   float stain=smoothstep(.5,.85,fbm(g*.35+9.))*.35;
   float grime=fbm(g*1.3+7.);conc*=.74+.42*grime;
   float algae=max(jnear,(1.-smoothstep(.0,.05,cr.y*.6))*crackA)*smoothstep(.3,.7,fbm3(g*4.));
   conc=mix(conc,vec3(.20,.23,.13)*(.7+.5*n),algae*.5);
   conc=mix(conc,conc*.72,stain);
   conc=mix(conc,vec3(.10,.095,.09),oil*.7);
   conc=mix(conc,conc*1.12,chip);
   conc=mix(conc,vec3(.07,.065,.06),near*.88);
   vec3 mossC=mix(vec3(.13,.2,.06),vec3(.3,.38,.11),blades);
   conc=mix(conc,mossC*(.7+.6*vn(g*30.)),moss);
   float tuft=max(near,jnear*.8)*smoothstep(.58,.82,vn(g*vec2(70.,26.)+vec2(0.,fbm3(g*20.)*2.)))*smoothstep(.4,.6,vn(g*3.+2.))*det;
   conc=mix(conc,mix(vec3(.16,.29,.07),vec3(.42,.55,.17),vn(g*140.)),tuft);
   oldc=mix(conc,vec3(.5,.49,.46)*(.8+.3*n),(1.-det)*.6);
   oldRough=mix(1.,.35,oil);
  }
  // ----- new surface: resin-bound aggregate -----
  vec3 newc=vec3(0.);vec3 N=vec3(0,1,0);float glint=0.;float gap=0.;
  if(m>.001&&uMat.w>.5){
   newc=texture2D(uSurf,rot2(g,uMat.y)/uMat.x).rgb;
  }else if(m>.001){
   float s=.0095;float idh;vec4 st=vor(g/s,idh);
   float lod=smoothstep(.35,1.1,eff/s);
   vec3 sc=idh<.42?uC0:(idh<.8?uC1:uC2);
   sc*=.62+.62*fract(idh*13.7);
   sc=mix(sc,sc*vec3(1.05,1.,.92),vn(g/s*.7+idh*9.)*.5);
   vec3 avg=uC0*.42+uC1*.38+uC2*.2;
   gap=(1.-smoothstep(.05,.2,st.y))*(1.-lod);
   vec3 far=avg*(.84+.3*vn(g*22.))*(.82+.36*h21(floor(g/(s*1.4))));
   newc=mix(mix(sc,avg*.32,gap),far,lod);
   vec2 o=st.zw*(1.-lod);N=normalize(vec3(-o.x*1.8,1.,-o.y*1.8));
   glint=step(.9,fract(idh*31.7))*(1.-lod)*(1.-gap);
  }
  float wet=texture2D(uWet,vec2(uv.x,1.-uv.y)).r*m;
  float edgeSh=smoothstep(.08,.34,mk.r)*(1.-m);
  vec3 alb=mix(oldc,newc,m)*(1.-edgeSh*.4);
  // ----- daylight: sun + sky, contact shade where the drive meets walls and beds -----
  vec3 sunD=normalize(uSun+vec3((uLight.x-.5)*.6,0.,(uLight.y-.3)*.4));
  vec3 sunC=vec3(1.,.96,.9)*.86,skyC=vec3(.62,.67,.76)*.5;
  float ao=mix(.62,1.,smoothstep(.35,.97,dm.g));
  float nl=max(dot(N,sunD),0.);
  vec3 lit=alb*(skyC+sunC*mix(.75,1.,nl))*ao;
  if(uLit.x>.5){
   // overcast photo: the resin gets the old drive's own light and shade; outside the pour the photo stays as it is
   float lm=dm.b*2.;float sky=.84+.2*clamp(dot(N,normalize(vec3(.15,1.,.35))),0.,1.);
   vec3 ln=pow(newc,vec3(2.2))*lm*uLit.y*uTint*sky;
   ln=mix(vec3(dot(ln,vec3(.2126,.7152,.0722))),ln,.85);
   lit=mix(photo*(1.-edgeSh*.3),pow(ln,vec3(1./2.2))*mix(1.,ao,.25),m);
  }
  vec3 V=normalize(vec3(0.,.55,-1.));
  float hs=max(dot(N,normalize(sunD+V)),0.);
  float gloss=mix(24.,120.,wet);
  lit+=sunC*pow(hs,gloss)*m*(1.-gap)*mix(.3,1.2,wet)*ao*(1.-uLit.x*.75);
  // wet resin mirrors the house; settled resin keeps a soft sheen
  vec2 rv=vec2(puv.x+N.x*(1.-wet)*.02,clamp(2.*uVb-puv.y+N.z*(1.-wet)*.03,.002,.998));
  vec3 refl=texture2D(uPhoto,rv,mix(3.,.6,wet)).rgb;
  float fres=.5;
  float rk=m*((.02+.42*wet*wet)*(1.-gap*.9))*(uMat.w>.5?uMat.z+.15:1.)+(1.-m)*(1.-oldRough)*.2;
  lit=mix(lit,refl*ao,clamp(rk*(.6+fres),0.,.85));
  float tw=.55+.45*sin(uTime*2.6+X*61.+z*47.);
  lit+=glint*m*sunC*.5*tw*ao*(1.-uLit.x*.7)*step(uMat.w,.5);
  // pour lip catches the light
  vec2 mu=vec2(uv.x,1.-uv.y);
  float mR=texture2D(uMask,mu+vec2(uTexel.x*2.,0)).r,mL=texture2D(uMask,mu-vec2(uTexel.x*2.,0)).r;
  float mU=texture2D(uMask,mu-vec2(0,uTexel.y*2.)).r,mD=texture2D(uMask,mu+vec2(0,uTexel.y*2.)).r;
  float lip=clamp((mU-mD)*2.2+abs(mR-mL)*.8,0.,1.);
  lit+=lip*sunC*.3*(.4+wet);
  // haze with distance so the far drive sits in the photo's air
  lit=mix(lit,photo*.35+lit*.65,smoothstep(8.,20.,length(g))*.4);
  col=mix(photo,lit,drive);
 }
 vec2 c=uv-vec2(.5,.55);col*=1.-dot(c,c)*.35;
 col+=(h21(fc+fract(uTime))-.5)*.01;
 gl_FragColor=vec4(col,1.);
}`;

const scene = SCENES.front;

// Compile the shader without blocking the main thread (KHR_parallel_shader_compile),
// so the page stays responsive while the GPU builds the hero.
export async function prepareHero() {
  const cv = document.getElementById('heroGL');
  const gl = cv && cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: /posterRender/.test(location.search) });
  if (!gl) return false;
  const ext = gl.getExtension('KHR_parallel_shader_compile');
  const mk = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  // fetch the photo while the shader compiles
  cv.__img = Promise.all([loadImg(scene.src), loadImg(scene.mask)]);
  if (ext) await new Promise(res => { const t0 = performance.now(); (function poll() { if (gl.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR) || performance.now() - t0 > 8000) res(); else setTimeout(poll, 50); })(); });
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('hero shader', gl.getShaderInfoLog && gl.getProgramInfoLog(prog)); return false; }
  cv.__prog = prog;
  try { [cv.__photo, cv.__mask] = await cv.__img; } catch { return false; }
  return true;
}
const loadImg = src => { const i = new Image(); i.decoding = 'async'; i.src = src; return i.decode().then(() => i); };

export function initHero(opts = {}) {
  const hero = document.getElementById('hero');
  const cv = document.getElementById('heroGL');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.poster });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  let prog = cv.__prog;
  if (!prog) try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { console.warn('hero shader', e); return null; }
  if (!cv.__photo) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uRes', 'uTime', 'uLight', 'uPhoto', 'uDrive', 'uMask', 'uWet', 'uCover', 'uPS', 'uH', 'uDM', 'uVb', 'uSun', 'uTexel', 'uC0', 'uC1', 'uC2', 'uDone', 'uLit', 'uTint', 'uSurf', 'uMat'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  const mkTex = (mip = false) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); [[gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v)); return t; };
  // static textures: photo (unit 2) and drive mask (unit 3)
  gl.activeTexture(gl.TEXTURE2); const tPhoto = mkTex(true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cv.__photo); gl.generateMipmap(gl.TEXTURE_2D);
  const DM = { dm: maskDM(scene) };
  gl.activeTexture(gl.TEXTURE3); const tDrive = mkTex(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cv.__mask);
  gl.activeTexture(gl.TEXTURE0);

  const mask = document.createElement('canvas'), mctx = mask.getContext('2d');
  const wet = document.createElement('canvas'), wctx = wet.getContext('2d');
  const tMask = mkTex(), tWet = mkTex();
  const probe = document.createElement('canvas'); probe.width = 40; probe.height = 24;
  const pctx = probe.getContext('2d', { willReadFrequently: true });

  const coarse = matchMedia('(pointer:coarse)').matches;
  let W = 0, H = 0, dpr = 1, MS = 0.5, dirty = true;
  const [PW, PH] = scene.size;
  // object-fit: cover, with a focus point (photo uv) kept in view
  const cover = [0, 0, 1, 1];
  function fit() {
    const a = W / H, pa = PW / PH;
    let fw = 1, fh = 1; if (a > pa) fh = pa / a; else fw = a / pa;
    const fx = a < 1 ? (scene.heroFocusM || .54) : scene.focus[0], fy = scene.focus[1];
    cover[0] = Math.min(1 - fw, Math.max(0, fx - fw / 2)); cover[1] = Math.min(1 - fh, Math.max(0, fy - fh / 2) + (a > pa ? (1 - fh) * .25 : 0));
    cover[1] = Math.min(1 - fh, cover[1]); cover[2] = fw; cover[3] = fh;
  }
  // screen y (px from top) of the far edge of the drive
  const wallBaseY = () => H * ((scene.vb / PH) - cover[1]) / cover[3];
  function resize() {
    const r = hero.getBoundingClientRect();
    W = r.width || innerWidth; H = r.height || innerHeight;
    if (!W || !H) return;
    dpr = opts.poster ? (opts.posterDpr || 2) : Math.min(devicePixelRatio || 1, coarse ? 1.5 : 1.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    fit();
    for (const [c, ctx, bg] of [[mask, mctx, 'rgb(0,128,128)'], [wet, wctx, '#000']]) {
      const old = c.width && c.height ? (() => { const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; o.getContext('2d').drawImage(c, 0, 0); return o; })() : null;
      c.width = Math.round(W * MS); c.height = Math.round(H * MS);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
      if (old) ctx.drawImage(old, 0, 0, c.width, c.height);
    }
    dirty = true; kick();
  }

  let blend = (opts.blend || ['#b9b8b2', '#8d8c88', '#e3e1da']).map(hexToRgb);
  // surface: resin is drawn stone by stone in the shader; block, tarmac and porcelain use the designer's textures
  let mat = [1, 0, 0, 0]; const tSurf = gl.createTexture();
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  let done = 0, doneT = -1, finished = false, coverage = 0;
  const light = { x: .62, y: .3, tx: .62, ty: .3 };
  let last = null, ghost = null, lastPaint = 0;

  function blade() { return Math.max(90, Math.min(200, W * 0.13)); }
  function stroke(x0, y0, x1, y1, alpha = 0.9) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const s = MS;
    const c = `rgba(255,128,128,${alpha})`;
    for (const [ctx, col, blur] of [[mctx, c, 16], [wctx, 'rgba(255,255,255,.95)', 22]]) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = blade() * s; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = blur * s;
      ctx.beginPath(); ctx.moveTo(x0 * s, y0 * s); ctx.lineTo(x1 * s, y1 * s); ctx.stroke(); ctx.shadowBlur = 0;
    }
    lastPaint = performance.now();
    dirty = true; kick();
  }

  function local(e) { const r = hero.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  const onDrive = y => y > wallBaseY() - 10;
  hero.addEventListener('pointermove', e => {
    const [x, y] = local(e);
    light.tx = x / W; light.ty = 1 - y / H; kick();
    if (finished) return;
    if (e.target.closest('a,button,.hero-dock,.hero-copy')) { last = null; return; }
    if (!onDrive(y)) { last = null; return; }
    if (last) { stroke(last[0], last[1], x, y); opts.onFirst && (opts.onFirst(), opts.onFirst = null); }
    last = [x, y];
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { last = null; });
  hero.addEventListener('pointerdown', e => { if (!e.target.closest('a,button,.hero-dock,.hero-copy')) { const [x, y] = local(e); last = onDrive(y) ? [x, y] : null; } });
  hero.addEventListener('pointerup', () => { if (coarse) last = null; });
  hero.addEventListener('pointercancel', () => last = null);

  function runGhost(path, dur, done) { ghost = { path, dur, t0: performance.now(), prev: null, done }; kick(); }
  function ghostStep(now) {
    if (!ghost) return;
    const k = Math.min(1, (now - ghost.t0) / ghost.dur);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [x, y] = ghost.path(e);
    if (ghost.prev) stroke(ghost.prev[0], ghost.prev[1], x, y, .92);
    ghost.prev = [x, y]; light.tx = x / W; light.ty = 1 - y / H;
    opts.onGhost && opts.onGhost(x, y, k < 1);
    if (k >= 1) { const d = ghost.done; ghost = null; d && d(); }
  }
  const demoPath = () => {
    const y0 = wallBaseY(), span = H - y0;
    return t => [W * (-0.05 + t * 1.1), y0 + span * (0.55 - 0.2 * t) + Math.sin(t * Math.PI * 2) * span * 0.08];
  };
  function demo(dur = 1700) { runGhost(demoPath(), dur); }
  function finish() {
    if (finished || doneT > 0) return;
    const y0 = wallBaseY(), span = H - y0;
    const rows = Math.max(3, Math.ceil(span / (blade() * 0.7)));
    runGhost(t => {
      const r = t * rows; const i = Math.min(rows - 1, Math.floor(r)); const fr = r - i;
      const y = y0 + (i + 0.5) * (span / rows);
      const x = i % 2 ? W * (1.08 - fr * 1.16) : W * (-0.08 + fr * 1.16);
      return [x, y];
    }, 2000, () => { mctx.fillStyle = 'rgba(255,128,128,.7)'; mctx.fillRect(0, (y0 - 40) * MS, mask.width, mask.height); dirty = true; doneT = performance.now(); kick(); });
  }

  function measure() {
    if (!mask.width || !mask.height) return;
    const y0 = Math.max(0, wallBaseY()) * MS;
    pctx.clearRect(0, 0, probe.width, probe.height);
    pctx.drawImage(mask, 0, y0, mask.width, mask.height - y0, 0, 0, probe.width, probe.height);
    const d = pctx.getImageData(0, 0, probe.width, probe.height).data;
    let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] > 150 ? 1 : 0;
    coverage = s / (d.length / 4);
    opts.onCoverage && opts.onCoverage(finished ? 1 : coverage);
    if (coverage > 0.7 && !finished && doneT < 0 && !ghost) finish();
  }
  let visible = true, raf = 0, running = false, lastDecay = 0;
  const t0 = performance.now();
  function kick() { if (!running && visible) { running = true; raf = requestAnimationFrame(frame); } }
  function frame(now) {
    if (!visible) { running = false; return; }
    ghostStep(now);
    if (coarse && !ghost) { const t = now / 2600; light.tx = .5 + Math.cos(t) * .3; light.ty = .25 + Math.sin(t * 1.2) * .1; }
    light.x += (light.tx - light.x) * .1; light.y += (light.ty - light.y) * .1;
    // wet film settles over ~6s
    if (now - lastDecay > 60) { lastDecay = now; wctx.fillStyle = 'rgba(0,0,0,.035)'; wctx.fillRect(0, 0, wet.width, wet.height); dirty = true; }
    if (doneT > 0) { done = Math.min(1, (now - doneT) / 2400); if (done >= 1 && !finished) { finished = true; opts.onDone && opts.onDone(); } }
    if (dirty) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tMask); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tWet); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wet);
      dirty = false;
    }
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform2f(U.uLight, light.x, light.y);
    gl.uniform1i(U.uMask, 0); gl.uniform1i(U.uWet, 1); gl.uniform1i(U.uPhoto, 2); gl.uniform1i(U.uDrive, 3);
    gl.uniform2f(U.uTexel, 1 / mask.width, 1 / mask.height);
    gl.uniform4fv(U.uCover, cover); gl.uniform2f(U.uPS, PW, PH); gl.uniformMatrix3fv(U.uH, false, glMat(scene.H));
    gl.uniform4fv(U.uDM, DM.dm); gl.uniform1f(U.uVb, scene.vb / PH); gl.uniform3fv(U.uSun, scene.sun);
    gl.uniform3fv(U.uC0, blend[0]); gl.uniform3fv(U.uC1, blend[1]); gl.uniform3fv(U.uC2, blend[2]);
    gl.uniform1f(U.uDone, done);
    gl.uniform1i(U.uSurf, 4); gl.uniform4fv(U.uMat, mat);
    const L = scene.lit; gl.uniform4f(U.uLit, L ? 1 : 0, L ? L.exp : 1, 0, 0); gl.uniform3fv(U.uTint, L ? L.tint : [1, 1, 1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // keep animating while something is moving; otherwise idle at ~12fps for glints
    const busy = ghost || now - lastPaint < 7000 || Math.abs(light.tx - light.x) > .002 || (doneT > 0 && !finished);
    if (busy) raf = requestAnimationFrame(frame);
    else { running = false; setTimeout(kick, 90); }
  }
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(hero);
  setInterval(() => { if (visible && !opts.poster) measure(); }, 300);
  resize();
  addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
  hero.classList.add('gl');
  return {
    demo, finish,
    setBlend(c) { blend = c.map(hexToRgb); dirty = true; kick(); },
    // m: { kind, c: canvas (power of two), tile, rot, gloss }; kind 0 = resin (uses the blend)
    setSurface(m) {
      if (m.kind > 0) {
        gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tSurf);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, m.c);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
        gl.activeTexture(gl.TEXTURE0);
      }
      mat = [m.tile || 1, m.rot || 0, m.gloss || 0, m.kind]; dirty = true; kick();
    },
    // poster: paint the demo stroke instantly and render one frame
    posterFrame() { const p = demoPath(); let prev = p(0); for (let i = 1; i <= 80; i++) { const q = p(i / 80); stroke(prev[0], prev[1], q[0], q[1], .92); prev = q; } wctx.fillStyle = 'rgba(0,0,0,.55)'; wctx.fillRect(0, 0, wet.width, wet.height); dirty = true; },
    get finished() { return finished; }
  };
}

function hexToRgb(h) { const n = parseInt(h.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map(v => Math.pow(v, 1.1)); }
