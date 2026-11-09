// Pour & self-level: drag resin across cracked concrete. It spreads, levels flat, turns glossy,
// and a reflection sweeps across it.
// Pattern from KT's trowel hero (2D mask canvas + one fragment shader) and Gafflow's metallic flow field.
// Mask channels: R = resin coverage, G = wetness (fresh resin ripples, then levels to a mirror).
// Vanilla WebGL1: no library, so it boots fast on phones.

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FS = `
precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform float uTime; uniform vec2 uLight;
uniform vec3 uBase; uniform vec3 uMetal; uniform vec3 uConc; uniform float uKind; uniform float uSweep;
uniform sampler2D uMask; uniform vec2 uTexel; uniform float uSeed;

float h(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
vec2 h2(vec2 p){ return vec2(h(p),h(p+19.19)); }
float n(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<4;i++){ v+=a*n(p); p=m*p; a*=.5; } return v; }
// voronoi: x = distance to edge, y = cell id hash
vec2 vor(vec2 p){ vec2 i=floor(p),f=fract(p); float d1=8.,d2=8.; float id=0.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){ vec2 g=vec2(x,y); vec2 o=h2(i+g); vec2 r=g+o-f; float d=dot(r,r);
    if(d<d1){ d2=d1; d1=d; id=h(i+g+7.); } else if(d<d2){ d2=d; } }
  return vec2(sqrt(d2)-sqrt(d1), id); }

vec3 concrete(vec2 fp, out float crack){
  float big=fbm(fp*.55+3.), mid=fbm(fp*2.3), fine=n(fp*38.)*.5+n(fp*71.)*.5;
  vec3 c=uConc*(.78+.32*big)*(.93+.1*mid)*(.95+.08*fine);
  // oil / damp stains
  float st=smoothstep(.62,.8,fbm(fp*.42+11.));
  c*=1.-st*.22;
  // aggregate speckle
  vec2 sp=vor(fp*26.); c*=1.-smoothstep(.07,.0,sp.x)*.0+ (sp.y>.86? -.07:.0);
  // cracks: warped voronoi edges, only some of them
  vec2 w=fp*.9+vec2(fbm(fp*1.7),fbm(fp*1.7+5.))*.55;
  vec2 cv=vor(w);
  float keep=smoothstep(.56,.68,fbm(w*1.3+2.));
  crack=(1.-smoothstep(.0,.009+.008*n(fp*9.),cv.x))*keep;
  c*=1.-crack*.5;
  // saw-cut control joint
  float j=abs(fract(fp.x*.18+.5)-.5); c*=1.-(1.-smoothstep(.0,.006,j))*.4;
  return c;
}

float field(vec2 p,float t,out vec2 r){
  vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));
  r=vec2(fbm(p+2.6*q+vec2(1.7,9.2)+.1*t),fbm(p+2.6*q+vec2(8.3,2.8)-.08*t));
  return fbm(p+3.*r);
}

vec3 resin(vec2 fp, float t, vec3 L, out vec3 nrm){
  nrm=vec3(0,0,1);
  vec3 col=uBase;
  if(uKind<.5){ // metallic
    vec2 p=fp*.38+uSeed; vec2 r; float f=field(p,t*.03,r);
    float m=smoothstep(.5,.64,f), wash=smoothstep(.45,.7,r.x);
    vec2 gp=p*1.3+r*1.6; float e=.03; float g0=fbm(gp),gx=fbm(gp+vec2(e,0.)),gy=fbm(gp+vec2(0.,e));
    nrm=normalize(vec3(-(gx-g0)/e*.16,-(gy-g0)/e*.16,1.));
    float sh=.38+.85*max(dot(nrm,L),0.);
    vec3 metal=uMetal*sh*(.82+.3*g0);
    col=mix(uBase,uMetal*.32*sh,wash*.35);
    col=mix(col,metal,m);
    float lace=exp(-pow((f-.5)/.012,2.))*(1.-m*.3);
    col+=mix(uMetal,vec3(1.),.55)*lace*.3*sh;
  } else if(uKind<1.5){ // flake
    vec2 v=vor(fp*30.); vec2 v2=vor(fp*30.+7.3);
    float chip=smoothstep(.0,.05,v.x); float id=v.y;
    vec3 a=uBase, b=uMetal, c=mix(uBase,vec3(.92),.75);
    vec3 fc=id<.45?a:(id<.8?b:c);
    fc=mix(fc,(v2.y<.5?b:a),.35*step(.5,h(floor(fp*30.+7.3))));
    col=fc*(.9+.15*n(fp*40.))*mix(.75,1.,chip);
    nrm=normalize(vec3((h2(floor(fp*30.))-.5)*.25,1.));
  } else if(uKind<2.5){ // solid
    col=uBase*(.96+.06*fbm(fp*1.2));
  } else { // quartz
    float g=n(fp*60.)*.5+n(fp*120.)*.5;
    col=mix(uBase,uMetal,smoothstep(.4,.8,g))*(.9+.15*n(fp*240.));
    nrm=normalize(vec3((vec2(n(fp*90.),n(fp*90.+3.))-.5)*.35,1.));
  }
  return col;
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  // mild perspective: we look down a garage floor; depth grows towards the top of the screen
  float z=1./(1.-uv.y*.42);
  vec2 fp=vec2((uv.x-.5)*asp*z, z*1.8)*3.2+vec2(uSeed*.3,0.);
  vec2 muv=vec2(uv.x,1.-uv.y);
  vec4 mk=texture2D(uMask,muv);
  float mR=texture2D(uMask,muv+vec2(uTexel.x*1.5,0.)).r, mL=texture2D(uMask,muv-vec2(uTexel.x*1.5,0.)).r;
  float mU=texture2D(uMask,muv-vec2(0.,uTexel.y*1.5)).r, mD=texture2D(uMask,muv+vec2(0.,uTexel.y*1.5)).r;
  float edgeN=fbm(fp*2.2+uTime*.05);
  float cov=smoothstep(.40,.47,mk.r+(edgeN-.5)*.08);
  float wet=mk.g;
  vec2 lp=vec2(uLight.x*asp,uLight.y);
  vec2 sp=vec2(uv.x*asp,uv.y);
  vec3 L=normalize(vec3(lp-sp,.7));

  // ---------- concrete ----------
  float crack; vec3 con=concrete(fp,crack);
  float damp=smoothstep(.08,.4,mk.r)*(1.-cov); // resin creeping in darkens the slab ahead of it
  con*=1.-damp*.42;
  con*=.8+.28*max(dot(vec3(0,0,1),L),0.);
  con+=pow(max(1.-length(sp-lp)*1.4,0.),3.)*.06;

  // ---------- resin ----------
  vec3 rn; vec3 rc=resin(fp,uTime,L,rn);
  // fresh resin ripples, then levels flat
  vec2 rip=vec2(n(fp*6.+uTime*.6),n(fp*6.+9.-uTime*.5))-.5;
  vec2 lip=vec2(mR-mL,mU-mD);
  vec3 N=normalize(vec3(rn.xy+rip*wet*.22-lip*1.2,1.));
  vec3 V=vec3(0,0,1); vec3 H=normalize(L+V);
  float spec=pow(max(dot(N,H),0.),mix(220.,60.,wet));
  rc+=spec*mix(uMetal,vec3(1.),.7)*.5;
  // ceiling light reflections: long streaks, as on a real gloss floor
  float refl=0.;
  for(int i=0;i<4;i++){
    float fi=float(i);
    float lx=(.14+.24*fi)*asp+(uLight.x-.5)*.08;
    vec2 q=sp-vec2(lx,.92-.05*mod(fi,2.));
    q+=N.xy*.06;
    refl+=exp(-q.x*q.x*1400.-q.y*q.y*6.)*.42+exp(-q.x*q.x*60.-q.y*q.y*1.2)*.03;
  }
  rc+=refl*mix(vec3(1.),uMetal,.15)*(1.-wet*.6);
  // reflection sweep after the floor is finished
  float band=uv.x*.8+uv.y*.6-uSweep*2.4+.6;
  rc+=exp(-band*band*90.)*.32*step(0.,uSweep)*(1.-wet);
  // meniscus: bright lip on the leading edge
  float rim=clamp(length(lip)*3.,0.,1.)*cov;
  rc+=rim*.25*mix(uMetal,vec3(1.),.5);

  vec3 col=mix(con,rc,cov);
  // cracks show through very slightly while still wet (not once levelled)
  col*=1.-crack*cov*wet*.15;
  // vignette + dither
  vec2 vg=uv-.5; col*=1.-dot(vg,vg)*.7;
  col+=(h(gl_FragCoord.xy+fract(uTime)*61.)-.5)/255.;
  gl_FragColor=vec4(pow(max(col,0.),vec3(.95)),1.);
}`;

export type PourOpts = {
  base: string; metal: string; kind: 'metallic' | 'flake' | 'solid' | 'quartz'; concrete: string;
  seed?: number;
  onFirst?: () => void; onCoverage?: (c: number) => void; onFinished?: () => void; onReady?: () => void; onLost?: () => void;
};

const KIND = { metallic: 0, flake: 1, solid: 2, quartz: 3 } as const;
const hex = (s: string) => [1, 3, 5].map((i) => Math.pow(parseInt(s.slice(i, i + 2), 16) / 255, 1.5)) as [number, number, number];

export function initPour(host: HTMLElement, cv: HTMLCanvasElement, opts: PourOpts) {
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' }) as WebGLRenderingContext | null;
  if (!gl) return null;
  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) || 'shader'); return o; };
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { console.warn('pour shader', e); return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {};
  ['uRes', 'uDpr', 'uTime', 'uLight', 'uBase', 'uMetal', 'uConc', 'uKind', 'uSweep', 'uMask', 'uTexel', 'uSeed'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));

  const mask = document.createElement('canvas');
  const mctx = mask.getContext('2d')!;
  const scratch = document.createElement('canvas');
  const sctx = scratch.getContext('2d')!;
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const probe = document.createElement('canvas'); probe.width = 40; probe.height = 24;
  const pctx = probe.getContext('2d', { willReadFrequently: true })!;

  const coarse = matchMedia('(pointer:coarse)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, dirty = true, spread = 0;
  // mask scale: small so spreading is cheap; phones get a finer mask so pour edges stay crisp at DPR 1.5
  const MS = coarse ? 0.4 : 0.25;

  function resize() {
    const r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 1.75); // phones: 1.5 (sharp, keeps Lighthouse mobile 85+)
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl!.viewport(0, 0, cv.width, cv.height);
    const old = mask.width ? (() => { const c = document.createElement('canvas'); c.width = mask.width; c.height = mask.height; c.getContext('2d')!.drawImage(mask, 0, 0); return c; })() : null;
    mask.width = Math.max(8, Math.round(W * MS)); mask.height = Math.max(8, Math.round(H * MS));
    scratch.width = mask.width; scratch.height = mask.height;
    mctx.fillStyle = '#000'; mctx.fillRect(0, 0, mask.width, mask.height);
    if (old) mctx.drawImage(old, 0, 0, mask.width, mask.height);
    dirty = true;
  }
  resize();
  const ro = new ResizeObserver(() => { clearTimeout((resize as any).t); (resize as any).t = setTimeout(resize, 120); });
  ro.observe(host);

  let base = hex(opts.base), metal = hex(opts.metal), kind: number = KIND[opts.kind];
  let fromB = base, fromM = metal, toB = base, toM = metal, mixT = 1;
  const conc = hex(opts.concrete);
  const seed = opts.seed ?? 1.7;
  const light = { x: .62, y: .6, tx: .62, ty: .6 };
  let last: [number, number] | null = null, idleAt = performance.now();
  let userPoured = false, sweep = -1, sweepPhase = 0, finished = false, finishing = false, coverage = 0;
  let ghost: null | { path: (t: number) => [number, number]; dur: number; t0: number; prev: [number, number] | null; done?: () => void } = null;

  // pour a soft blob of fresh resin (R = coverage, G = wet)
  function pour(x: number, y: number, r: number, a = 0.9) {
    const s = MS, g = mctx.createRadialGradient(x * s, y * s, 0, x * s, y * s, r * s);
    g.addColorStop(0, `rgba(255,255,0,${a})`); g.addColorStop(0.55, `rgba(255,255,0,${a * 0.75})`); g.addColorStop(1, 'rgba(255,255,0,0)');
    mctx.globalCompositeOperation = 'lighten'; mctx.fillStyle = g;
    mctx.beginPath(); mctx.arc(x * s, y * s, r * s, 0, 7); mctx.fill();
    mctx.globalCompositeOperation = 'source-over';
    spread = Math.min(70, spread + 10); dirty = true;
  }
  function pourLine(x0: number, y0: number, x1: number, y1: number, r: number) {
    const d = Math.hypot(x1 - x0, y1 - y0), steps = Math.max(1, Math.ceil(d / (r * 0.35)));
    for (let i = 1; i <= steps; i++) { const k = i / steps; pour(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r, 0.55); }
  }
  const radius = () => Math.max(56, Math.min(150, W * 0.085));

  // self-levelling: the fresh resin creeps outward (dilation) while there is "volume" left
  function level() {
    if (spread <= 0) return;
    sctx.globalCompositeOperation = 'copy'; sctx.drawImage(mask, 0, 0);
    mctx.globalCompositeOperation = 'lighten'; mctx.globalAlpha = 0.9;
    mctx.drawImage(scratch, 1, 0); mctx.drawImage(scratch, -1, 0); mctx.drawImage(scratch, 0, 1); mctx.drawImage(scratch, 0, -1);
    mctx.globalAlpha = 0.84; mctx.drawImage(scratch, 0.7, 0.7); mctx.drawImage(scratch, -0.7, 0.7); mctx.drawImage(scratch, 0.7, -0.7); mctx.drawImage(scratch, -0.7, -0.7);
    mctx.globalAlpha = 1; mctx.globalCompositeOperation = 'source-over';
    spread--; dirty = true;
  }
  // wetness fades: multiply only the G channel down
  function cure() {
    mctx.globalCompositeOperation = 'multiply'; mctx.fillStyle = 'rgb(255,246,255)';
    mctx.fillRect(0, 0, mask.width, mask.height); mctx.globalCompositeOperation = 'source-over'; dirty = true;
  }

  function local(e: PointerEvent): [number, number] { const r = host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    light.tx = x / W; light.ty = 1 - y / H; idleAt = performance.now();
    if (finished) return;
    if ((e.target as HTMLElement).closest('a,button,[data-nopour]')) { last = null; return; }
    if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch' || e.pointerType === 'pen') {
      if (last) { pourLine(last[0], last[1], x, y, radius()); userPoured = true; if (opts.onFirst) { opts.onFirst(); opts.onFirst = undefined; } }
      last = [x, y];
    }
  };
  const onLeave = () => { last = null; };
  const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('a,button,[data-nopour]')) { last = local(e); if (!finished) pour(last[0], last[1], radius() * 1.2); } };
  const onUp = () => { if (coarse) last = null; };
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerleave', onLeave);
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onLeave);

  function runGhost(path: (t: number) => [number, number], dur: number, done?: () => void) { ghost = { path, dur, t0: performance.now(), prev: null, done }; }
  function ghostStep(now: number) {
    if (!ghost) return;
    const k = Math.min(1, (now - ghost.t0) / ghost.dur);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [x, y] = ghost.path(e);
    if (ghost.prev) pourLine(ghost.prev[0], ghost.prev[1], x, y, radius() * 1.1); else pour(x, y, radius() * 1.4);
    ghost.prev = [x, y]; light.tx = x / W; light.ty = 1 - y / H;
    if (k >= 1) { const d = ghost.done; ghost = null; d && d(); }
  }
  // first-screen demo: a pour already spreading when the page appears
  function demo() {
    if (W < 700) {
      // phones: the floor is already poured across the top 60% on the first frame (matches the poster), then a pour sweeps in
      for (let i = 0; i < 9; i++) pour(W * (0.1 + (i % 3) * 0.4), H * (0.08 + Math.floor(i / 3) * 0.22), Math.max(W, H) * 0.22, 0.95);
      runGhost((t) => [W * (1.05 - t * 0.9), H * (0.62 + Math.sin(t * Math.PI * 1.5) * 0.05)], 900);
    } else {
      runGhost((t) => { const a = t * Math.PI * 2.6; const rr = 20 + t * Math.min(W, H) * 0.17; return [W * 0.74 + Math.cos(a) * rr * 1.25, H * 0.46 + Math.sin(a) * rr * 0.8]; }, 2200);
    }
  }
  function finish() {
    if (finished || finishing) return;
    finishing = true;
    const rows = Math.ceil(H / (radius() * 1.2)) + 1;
    runGhost((t) => {
      const r = t * rows, i = Math.floor(r), fr = r - i;
      const y = (i + 0.5) * (H / rows);
      const x = i % 2 ? W * (1.1 - fr * 1.2) : W * (-0.1 + fr * 1.2);
      return [x, y];
    }, 1700, () => {
      mctx.globalCompositeOperation = 'lighten'; mctx.fillStyle = 'rgba(255,200,0,1)'; mctx.fillRect(0, 0, mask.width, mask.height);
      mctx.globalCompositeOperation = 'source-over'; dirty = true; finished = true; sweep = 0; opts.onFinished && opts.onFinished();
    });
  }
  function reset() {
    mctx.fillStyle = '#000'; mctx.fillRect(0, 0, mask.width, mask.height); dirty = true;
    finished = false; finishing = false; sweep = -1; sweepPhase = 0; spread = 0;
  }

  function measure() {
    pctx.drawImage(mask, 0, 0, probe.width, probe.height);
    const d = pctx.getImageData(0, 0, probe.width, probe.height).data;
    let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] > 140 ? 1 : 0;
    coverage = s / (d.length / 4);
    opts.onCoverage && opts.onCoverage(finished ? 1 : coverage);
    if (userPoured && coverage > 0.62 && !finished && !finishing && !ghost) finish();
  }
  const mt = setInterval(() => { if (visible) measure(); }, 300);

  let visible = true, raf = 0, ready = false, lastLevel = 0, lastFrame = 0;
  const FPS = coarse ? 40 : 60;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); });
  io.observe(host);
  const t0 = performance.now();
  function frame(now: number) {
    ghostStep(now);
    if (now - lastLevel > 32) { level(); cure(); lastLevel = now; }
    if (!ghost && now - idleAt > 2600) { const t = now / 2600; light.tx = .55 + Math.cos(t) * .25; light.ty = .6 + Math.sin(t * 1.3) * .18; }
    light.x += (light.tx - light.x) * .08; light.y += (light.ty - light.y) * .08;
    if (mixT < 1) { mixT = Math.min(1, mixT + 0.035); const e = 1 - Math.pow(1 - mixT, 3);
      base = fromB.map((v, i) => v + (toB[i] - v) * e) as any; metal = fromM.map((v, i) => v + (toM[i] - v) * e) as any; }
    // a reflection sweeps across the finished floor every few seconds
    if (finished) { sweepPhase += 0.006; const s = sweepPhase % 2.6; sweep = s < 1.4 ? s : -1; }
    if (dirty) { gl!.bindTexture(gl!.TEXTURE_2D, tex); gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, mask); dirty = false; }
    gl!.uniform2f(U.uRes, cv.width, cv.height); gl!.uniform1f(U.uDpr, dpr); gl!.uniform1f(U.uTime, (now - t0) / 1000);
    gl!.uniform2f(U.uLight, light.x, light.y); gl!.uniform3fv(U.uBase, base); gl!.uniform3fv(U.uMetal, metal); gl!.uniform3fv(U.uConc, conc);
    gl!.uniform1f(U.uKind, kind); gl!.uniform1f(U.uSweep, sweep); gl!.uniform1i(U.uMask, 0);
    gl!.uniform2f(U.uTexel, 1 / mask.width, 1 / mask.height); gl!.uniform1f(U.uSeed, seed);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    if (!ready && cv.width > 8 && (measure(), coverage >= 0.15) && frameLit()) { ready = true; host.classList.add('gl-on'); opts.onReady && opts.onReady(); }
  }
  // sample a few pixels of the frame just drawn; a black/blank frame never replaces the poster
  const px = new Uint8Array(4);
  function frameLit() {
    let sum = 0;
    for (const [fx, fy] of [[.25, .8], [.5, .7], [.75, .85], [.5, .5], [.3, .6]]) {
      gl!.readPixels(Math.floor(cv.width * fx), Math.floor(cv.height * fy), 1, 1, gl!.RGBA, gl!.UNSIGNED_BYTE, px);
      sum += (px[0] + px[1] + px[2]) / 765;
    }
    return sum / 5 > 0.08;
  }
  const onLost = (e: Event) => { e.preventDefault(); ready = false; host.classList.remove('gl-on'); opts.onLost && opts.onLost(); };
  cv.addEventListener('webglcontextlost', onLost);
  function loop() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function f(now) {
      if (!visible) return;
      raf = requestAnimationFrame(f);
      if (reduce && !ghost && spread <= 0 && ready && !dirty && mixT >= 1) return;
      if (now - lastFrame < 1000 / FPS - 2) return;
      lastFrame = now; frame(now);
    });
  }
  loop();

  return {
    demo, finish, reset,
    // capture / poster helpers
    fillAll(wet = 0) {
      mctx.globalCompositeOperation = 'source-over'; mctx.fillStyle = `rgb(255,${Math.round(wet * 255)},0)`; mctx.fillRect(0, 0, mask.width, mask.height);
      dirty = true; finished = true; finishing = false; sweep = -1; sweepPhase = 1.5; spread = 0;
    },
    light(x: number, y: number) { light.x = light.tx = x; light.y = light.ty = y; idleAt = performance.now() + 1e9; },
    set(next: { base: string; metal: string; kind: PourOpts['kind'] }) {
      fromB = base; fromM = metal; toB = hex(next.base); toM = hex(next.metal); mixT = reduce ? 1 : 0; kind = KIND[next.kind];
      if (reduce) { base = toB; metal = toM; }
    },
    get finished() { return finished; },
    destroy() {
      cancelAnimationFrame(raf); clearInterval(mt); io.disconnect(); ro.disconnect(); cv.removeEventListener('webglcontextlost', onLost);
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onLeave);
      // don't lose the context here: React StrictMode re-mounts on the same canvas
    },
  };
}
export type PourApi = NonNullable<ReturnType<typeof initPour>>;
