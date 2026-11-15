// Driveway pour: drag resin-bound stone over a cracked, mossy old tarmac drive. It spreads, levels,
// and cures from a wet gloss to a finished stone surface. Seen in perspective, with a charcoal sett
// border and a lawn verge so it reads as a drive, not a floor.
// Textures are CC0 photo scans (Poly Haven: asphalt_02, clean_pebbles, concrete_moss) baked by scripts/prep-tex.mjs.
// Mask channels (screen space): R = resin coverage, G = wetness. Engine pattern from the master pour hero.

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FS = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uLight; uniform float uSweep; uniform float uView;
uniform sampler2D uMask; uniform vec2 uTexel;
uniform sampler2D uBefore; uniform sampler2D uCrack; uniform sampler2D uMoss; uniform sampler2D uStone; uniform sampler2D uPick;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uFog;

float h(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float n(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }

const vec3 SUN=vec3(1.,.9,.76);
const vec3 SKY=vec3(.62,.7,.82);

vec3 blend(float id){
  // proportions: ~45% / 35% / 20% of the stones
  vec3 c=mix(uC1,uC2,smoothstep(.43,.47,id));
  return mix(c,uC3,smoothstep(.78,.82,id));
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  // ground plane in perspective: d = distance down the drive
  float d=1./(uView-uv.y);
  vec2 w=vec2((uv.x-.5)*asp*d, d)*clamp(1.05/asp,1.,2.3);   // narrow screens see the same drive, not a zoomed-in patch
  float topDown=step(4.,uView);               // swatch mode: looking straight down, everything sharp
  if(topDown>.5) w=(uv-.5)*vec2(asp,1.)*.32+vec2(0.,2.);
  // photographic depth of field: sharp band in the lower-middle, softer near and far
  float dof=clamp(abs(uv.y-.38)*5.-.35,0.,3.2)*(1.-topDown);
  vec2 muv=vec2(uv.x,1.-uv.y);
  vec4 mk=texture2D(uMask,muv);
  float mR=texture2D(uMask,muv+vec2(uTexel.x*1.5,0.)).r, mL=texture2D(uMask,muv-vec2(uTexel.x*1.5,0.)).r;
  float mU=texture2D(uMask,muv-vec2(0.,uTexel.y*1.5)).r, mD=texture2D(uMask,muv+vec2(0.,uTexel.y*1.5)).r;

  float B=.86;                          // half width of the resin area (a wide 2-car drive)
  float ax=abs(w.x);
  float aa=.004*d+.002*dof;
  float inDrive=1.-smoothstep(B-aa,B+aa,ax);
  float bw=.09;
  float inBorder=(1.-inDrive)*(1.-smoothstep(B+bw-aa,B+bw+aa,ax));
  float inLawn=smoothstep(B+bw-aa,B+bw+aa,ax);

  // light: low warm sun from the far right; dappled shade from a tree off-frame, moving in the breeze
  vec2 lp=vec2(uLight.x*asp,uLight.y); vec2 sp=vec2(uv.x*asp,uv.y);
  float pool=pow(max(1.-length(sp-lp)*1.1,0.),2.);
  vec3 Ld=normalize(vec3(.55,.75,.62));
  vec2 lw=w*vec2(1.,.8)+vec2(.06*sin(uTime*.6),.03*sin(uTime*.45+1.));
  float leaf=fbm(lw*3.1+vec2(4.,1.))*.65+fbm(lw*9.+uTime*.05)*.35;
  float shadeZone=smoothstep(.15,-.5,w.x-w.y*.35);  // shade falls from the left side
  float shade=mix(1.,mix(.58,1.,smoothstep(.42,.6,leaf)),shadeZone);
  vec3 sunCol=mix(vec3(.58,.62,.72),SUN,shade);      // shade is cooler

  // ---------- stone (needed first: it shapes the pour edge) ----------
  vec2 ts=w/.52;
  float s=texture2D(uStone,ts,dof).r;
  float id=texture2D(uPick,ts,dof).r;

  float edgeN=fbm(w*9.+uTime*.05);
  float field=mk.r+(edgeN-.5)*.08+(s-.5)*.16;
  float cov=smoothstep(.43,.47,field)*inDrive;
  float lipShadow=smoothstep(.30,.43,field)*(1.-cov)*inDrive;
  float wet=mk.g;

  // ---------- old tarmac ----------
  vec2 ta=w/1.0+vec2(.13,0.);
  vec3 tar=texture2D(uBefore,ta,dof).rgb;
  tar=mix(tar,vec3(dot(tar,vec3(.3,.59,.11))),.35)*.86;
  float stain=smoothstep(.5,.8,fbm(w*1.3+3.));
  tar*=1.-stain*.3;
  float crack=texture2D(uCrack,ta,dof).r;
  float spread=clamp(texture2D(uCrack,ta,2.6+dof).r*7.,0.,1.);
  vec3 moss=texture2D(uMoss,w*2.2,dof).rgb*vec3(.55,.62,.36);
  float tuft=smoothstep(.45,.85,n(w*vec2(90.,40.)))*smoothstep(.2,.7,spread);
  float mz=clamp(spread*(.35+.9*fbm(w*11.))-.22,0.,1.);
  float edgeWeed=smoothstep(B-.06,B,ax)*smoothstep(.4,.72,fbm(w*14.+7.));
  mz=max(mz,edgeWeed*.85);
  vec3 old=mix(tar,moss*(.6+.55*tuft),smoothstep(.0,.6,mz));
  old+=vec3(.05,.08,.015)*tuft*mz*shade;
  old*=1.-.25*smoothstep(.0,.35,spread)*(1.-mz);   // damp, dirty halo either side of each crack
  old*=1.-crack*(.7-.35*mz);
  float damp=smoothstep(.06,.4,mk.r)*(1.-cov)*inDrive;
  old*=1.-damp*.32;
  old*=1.-lipShadow*.45;                 // the fresh resin stands proud and shades the tarmac ahead of it
  old*=sunCol*(.78+.22*pool);

  // ---------- resin-bound stone ----------
  float e=1./1024.;
  float sx=texture2D(uStone,ts+vec2(e,0.),dof).r, sy=texture2D(uStone,ts+vec2(0.,e),dof).r;
  vec2 ripple=(vec2(n(w*30.+uTime*.7),n(w*30.+9.-uTime*.6))-.5)*wet;
  vec2 lip=vec2(mR-mL,mD-mU);
  vec3 N=normalize(vec3(-(sx-s)*4.-lip.x*2.+ripple.x*.4, -(sy-s)*4.-lip.y*2.+ripple.y*.4, 1.));
  // far/soft areas: blurred stone IDs would make blotches, so fade to the blend's average colour
  float soft=smoothstep(.6,2.2,dof);
  vec3 avg=uC1*.45+uC2*.35+uC3*.2;
  vec3 base=mix(blend(id),avg,soft);
  s=mix(s,.55,soft*.6);
  float gap=smoothstep(.1,.4,s);
  vec3 rc=base*(.18+.95*s)*mix(.42,1.,gap);
  float lam=max(dot(N,Ld),0.);
  rc*=(.5+.62*lam)*sunCol;
  rc*=1.-wet*.25;
  vec3 V=normalize(vec3(0.,-.55,.85));
  vec3 H=normalize(Ld+V);
  float spec=pow(max(dot(N,H),0.),mix(30.,160.,wet))*mix(.18,1.2,wet)*shade;
  rc+=SUN*spec*gap;
  rc+=SUN*pow(max(dot(N,H),0.),70.)*step(.84,s)*.3*(1.-wet)*shade;
  float fres=pow(1.-uv.y*.5,2.);
  rc=mix(rc,rc*.78+SKY*.2*fres,wet*.55);
  float rim=clamp(length(lip)*3.,0.,1.)*cov;
  rc+=rim*.22*mix(base,vec3(1.),.5)*shade;
  float band=uv.x*.7+uv.y*.7-uSweep*2.4+.5;
  rc+=exp(-band*band*70.)*.14*step(0.,uSweep)*SUN*gap*shade;
  rc*=.84+.22*pool;

  vec3 drive=mix(old,rc,cov);

  // ---------- sett border ----------
  float bx=(ax-B)/bw*2.;
  float by=w.y/.13+step(1.,bx)*.5;
  vec2 cell=vec2(floor(bx),floor(by));
  vec2 f=vec2(fract(bx),fract(by));
  float joint=smoothstep(.0,.06,f.x)*smoothstep(1.,.94,f.x)*smoothstep(.0,.08,f.y)*smoothstep(1.,.92,f.y);
  vec3 sett=vec3(.16,.16,.17)*(.85+.3*h(cell))*(.75+.5*texture2D(uBefore,w*1.7,dof).r);
  sett*=.5+.5*joint;
  sett*=sunCol*(.85+.2*pool);

  // ---------- lawn verge (kept dark and soft: it frames, it doesn't compete) ----------
  vec3 grass=texture2D(uMoss,w*1.3,dof+1.).rgb;
  grass=mix(grass,vec3(dot(grass,vec3(.3,.59,.11))),.45)*vec3(.62,.72,.5);
  grass*=.85+.15*step(.5,fract(w.x*1.1))+.12*fbm(w*16.);
  grass*=sunCol*.8;

  vec3 col=drive*inDrive+sett*inBorder+grass*inLawn;

  col*=1.32;                               // exposure
  float far=smoothstep(.5,1.,uv.y)*(1.-topDown);
  col=mix(col,uFog,far*.6);
  vec2 vg=uv-vec2(.5,.45); col*=1.-dot(vg,vg)*.6;
  col+=(h(gl_FragCoord.xy+fract(uTime)*61.)-.5)/255.;
  gl_FragColor=vec4(pow(max(col,0.),vec3(.97)),1.);
}`;

export type Blend = { c1: string; c2: string; c3: string };
export type DriveOpts = {
  blend: Blend; fog: string; tex: string; // tex: folder with the baked textures, e.g. '/tex/'
  view?: number;
  onFirst?: () => void; onCoverage?: (c: number) => void; onFinished?: () => void; onReady?: () => void; onLost?: () => void;
};

const lin = (s: string) => [1, 3, 5].map((i) => Math.pow(parseInt(s.slice(i, i + 2), 16) / 255, 2.0)) as [number, number, number];

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export function initDrive(host: HTMLElement, cv: HTMLCanvasElement, opts: DriveOpts) {
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false }) as WebGLRenderingContext | null;
  if (!gl) return null;
  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) || 'shader'); return o; };
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { console.warn('drive shader', e); return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {};
  ['uRes', 'uTime', 'uLight', 'uSweep', 'uView', 'uMask', 'uTexel', 'uBefore', 'uCrack', 'uMoss', 'uStone', 'uPick', 'uC1', 'uC2', 'uC3', 'uFog'].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));

  // ---- textures ----
  const maskTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, maskTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const files: [string, string, boolean][] = [['uBefore', 'before-v1.webp', false], ['uCrack', 'crack-v1.jpg', false], ['uMoss', 'moss-v1.webp', false], ['uStone', 'stone-v1.jpg', false], ['uPick', 'pick-v1.png', true]];
  let texLoaded = false, dead = false;
  Promise.all(files.map(([, f]) => loadImg(opts.tex + f))).then((imgs) => {
    if (dead) return;
    gl.useProgram(prog);
    imgs.forEach((img, i) => {
      gl.activeTexture(gl.TEXTURE1 + i);
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, files[i][2] ? gl.NEAREST : gl.LINEAR);
      gl.uniform1i(U[files[i][0]], 1 + i);
    });
    gl.activeTexture(gl.TEXTURE0);
    texLoaded = true;
  }).catch((e) => console.warn('drive textures', e));

  const mask = document.createElement('canvas');
  const mctx = mask.getContext('2d')!;
  const scratch = document.createElement('canvas');
  const sctx = scratch.getContext('2d')!;
  const probe = document.createElement('canvas'); probe.width = 40; probe.height = 24;
  const pctx = probe.getContext('2d', { willReadFrequently: true })!;

  const coarse = matchMedia('(pointer:coarse)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, dirty = true, spread = 0;
  const MS = coarse ? 0.4 : 0.25;

  function resize() {
    const r = host.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 1.75);
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

  let c1 = lin(opts.blend.c1), c2 = lin(opts.blend.c2), c3 = lin(opts.blend.c3);
  let from = [c1, c2, c3], to = [c1, c2, c3], mixT = 1;
  const fog = lin(opts.fog);
  const view = opts.view ?? 1.62;
  const light = { x: .66, y: .55, tx: .66, ty: .55 };
  let last: [number, number] | null = null, idleAt = performance.now();
  let userPoured = false, sweep = -1, sweepPhase = 0, finished = false, finishing = false, coverage = 0;
  let ghost: null | { path: (t: number) => [number, number]; dur: number; t0: number; prev: [number, number] | null; done?: () => void } = null;

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
  // brush shrinks with distance down the drive, so a stroke looks like the same width of resin
  const radius = (y = H * 0.7) => { const base = Math.max(54, Math.min(150, W * 0.085)); const uvy = 1 - y / H; return base * Math.max(.45, Math.min(1.25, (view - .1) / (view - uvy) * .62)); };

  function level() {
    if (spread <= 0) return;
    sctx.globalCompositeOperation = 'copy'; sctx.drawImage(mask, 0, 0);
    mctx.globalCompositeOperation = 'lighten'; mctx.globalAlpha = 0.9;
    mctx.drawImage(scratch, 1, 0); mctx.drawImage(scratch, -1, 0); mctx.drawImage(scratch, 0, 1); mctx.drawImage(scratch, 0, -1);
    mctx.globalAlpha = 0.84; mctx.drawImage(scratch, 0.7, 0.7); mctx.drawImage(scratch, -0.7, 0.7); mctx.drawImage(scratch, 0.7, -0.7); mctx.drawImage(scratch, -0.7, -0.7);
    mctx.globalAlpha = 1; mctx.globalCompositeOperation = 'source-over';
    spread--; dirty = true;
  }
  function cure() {
    mctx.globalCompositeOperation = 'multiply'; mctx.fillStyle = 'rgb(255,247,255)';
    mctx.fillRect(0, 0, mask.width, mask.height); mctx.globalCompositeOperation = 'source-over'; dirty = true;
  }

  function local(e: PointerEvent): [number, number] { const r = host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    light.tx = x / W; light.ty = 1 - y / H; idleAt = performance.now();
    if (finished) return;
    if ((e.target as HTMLElement).closest('a,button,input,select,label,[data-nopour]')) { last = null; return; }
    if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch' || e.pointerType === 'pen') {
      if (last) { pourLine(last[0], last[1], x, y, radius(y)); userPoured = true; if (opts.onFirst) { opts.onFirst(); opts.onFirst = undefined; } }
      last = [x, y];
    }
  };
  const onLeave = () => { last = null; };
  const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('a,button,input,select,label,[data-nopour]')) { last = local(e); if (!finished) pour(last[0], last[1], radius(last[1]) * 1.2); } };
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
    if (ghost.prev) pourLine(ghost.prev[0], ghost.prev[1], x, y, radius(y) * 1.1); else pour(x, y, radius(y) * 1.4);
    ghost.prev = [x, y]; light.tx = x / W; light.ty = 1 - y / H;
    if (k >= 1) { const d = ghost.done; ghost = null; d && d(); }
  }
  // Opening state: the far half of the drive is already laid (so the first frame shows the finished look),
  // then a pour sweeps across the near, cracked half.
  function prefill() {
    let sd = 3; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) { const x = W * (-0.08 + r() * 1.16), y = H * (0.0 + r() * 0.32 + (i < 8 ? 0 : 0.06 * r())); pour(x, y, Math.max(W, H) * (0.1 + r() * 0.1), 0.95); }
    for (let i = 0; i < 6; i++) pour(W * (i / 5), H * 0.05, Math.max(W, H) * 0.2, 0.95);
  }
  function demo() {
    prefill();
    if (W < 700) runGhost((t) => [W * (1.05 - t * 0.85), H * (0.56 + Math.sin(t * Math.PI) * 0.05)], 1100);
    else runGhost((t) => [W * (0.98 - t * 0.5), H * (0.5 + Math.sin(t * Math.PI * 1.2) * 0.06)], 1800);
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
      mctx.globalCompositeOperation = 'lighten'; mctx.fillStyle = 'rgba(255,170,0,1)'; mctx.fillRect(0, 0, mask.width, mask.height);
      mctx.globalCompositeOperation = 'source-over'; dirty = true; finished = true; sweep = 0; opts.onFinished && opts.onFinished();
    });
  }
  function reset() {
    mctx.fillStyle = '#000'; mctx.fillRect(0, 0, mask.width, mask.height); dirty = true;
    finished = false; finishing = false; sweep = -1; sweepPhase = 0; spread = 0; ghost = null;
  }

  function measure() {
    pctx.clearRect(0, 0, probe.width, probe.height);
    pctx.drawImage(mask, 0, 0, probe.width, probe.height);
    const d = pctx.getImageData(0, 0, probe.width, probe.height).data;
    let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] > 140 ? 1 : 0;
    coverage = s / (d.length / 4);
    opts.onCoverage && opts.onCoverage(finished ? 1 : coverage);
    if (userPoured && coverage > 0.72 && !finished && !finishing && !ghost) finish();
  }
  const mt = setInterval(() => { if (visible) measure(); }, 300);

  let visible = true, raf = 0, ready = false, lastLevel = 0, lastFrame = 0;
  const FPS = coarse ? 40 : 60;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); });
  io.observe(host);
  const t0 = performance.now();
  function frame(now: number) {
    if (!texLoaded || dead) return;
    gl!.useProgram(prog);
    ghostStep(now);
    if (now - lastLevel > 32) { level(); cure(); lastLevel = now; }
    if (!ghost && now - idleAt > 2600) { const t = now / 2800; light.tx = .6 + Math.cos(t) * .22; light.ty = .55 + Math.sin(t * 1.3) * .15; }
    light.x += (light.tx - light.x) * .08; light.y += (light.ty - light.y) * .08;
    if (mixT < 1) {
      mixT = Math.min(1, mixT + 0.035); const e = 1 - Math.pow(1 - mixT, 3);
      [c1, c2, c3] = from.map((f, j) => f.map((v, i) => v + (to[j][i] - v) * e)) as any;
    }
    if (finished) { sweepPhase += 0.006; const s = sweepPhase % 2.8; sweep = s < 1.4 ? s : -1; }
    gl!.activeTexture(gl!.TEXTURE0);
    if (dirty) { gl!.bindTexture(gl!.TEXTURE_2D, maskTex); gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, mask); dirty = false; }
    gl!.uniform2f(U.uRes, cv.width, cv.height); gl!.uniform1f(U.uTime, (now - t0) / 1000);
    gl!.uniform2f(U.uLight, light.x, light.y); gl!.uniform1f(U.uSweep, sweep); gl!.uniform1f(U.uView, view);
    gl!.uniform1i(U.uMask, 0); gl!.uniform2f(U.uTexel, 1 / mask.width, 1 / mask.height);
    gl!.uniform3fv(U.uC1, c1); gl!.uniform3fv(U.uC2, c2); gl!.uniform3fv(U.uC3, c3); gl!.uniform3fv(U.uFog, fog);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    if (!ready && cv.width > 8 && frameLit()) { ready = true; host.classList.add('gl-on'); opts.onReady && opts.onReady(); }
  }
  const px = new Uint8Array(4);
  function frameLit() {
    let sum = 0;
    for (const [fx, fy] of [[.25, .2], [.5, .3], [.75, .15], [.5, .5], [.3, .4]]) {
      gl!.readPixels(Math.floor(cv.width * fx), Math.floor(cv.height * fy), 1, 1, gl!.RGBA, gl!.UNSIGNED_BYTE, px);
      sum += (px[0] + px[1] + px[2]) / 765;
    }
    return sum / 5 > 0.04;
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
    demo, finish, reset, prefill,
    fillAll(wet = 0) {
      mctx.globalCompositeOperation = 'source-over'; mctx.fillStyle = `rgb(255,${Math.round(wet * 255)},0)`; mctx.fillRect(0, 0, mask.width, mask.height);
      dirty = true; finished = true; finishing = false; sweep = -1; sweepPhase = 1.5; spread = 0;
    },
    light(x: number, y: number) { light.x = light.tx = x; light.y = light.ty = y; idleAt = performance.now() + 1e9; },
    set(b: Blend) {
      from = [c1, c2, c3]; to = [lin(b.c1), lin(b.c2), lin(b.c3)]; mixT = reduce ? 1 : 0;
      if (reduce) [c1, c2, c3] = to as any;
    },
    get finished() { return finished; },
    get loaded() { return texLoaded; },
    destroy() {
      dead = true; cancelAnimationFrame(raf); clearInterval(mt); io.disconnect(); ro.disconnect(); cv.removeEventListener('webglcontextlost', onLost);
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onLeave);
    },
  };
}
export type DriveApi = NonNullable<ReturnType<typeof initDrive>>;
