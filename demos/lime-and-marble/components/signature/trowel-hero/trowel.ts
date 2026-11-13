// Trowel engine: a dated tiled wall; move (or swipe) to trowel microcement over it.
// Pattern carried over from the KT trowel hero (raw WebGL, one fragment shader; strokes are painted
// into a 2D mask canvas: R = coverage, G/B = trowel direction, which the shader samples).
// Instance-scoped for React: everything is torn down by destroy(). No KT images or copy are used:
// the wall, grout and microcement are all procedural.

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec2 uLight;uniform vec3 uCol;uniform float uCure;uniform float uTile;
uniform vec3 uTileA;uniform vec3 uTileB;uniform vec3 uBand;uniform vec3 uGrout;
uniform sampler2D uMask;uniform vec2 uMaskTexel;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){s+=a*vn(p);p=m*p;a*=.5;}return s;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;
 vec2 px=gl_FragCoord.xy/uDpr;
 vec2 lp=uLight*uRes/uDpr;
 // ---------- tiles ----------
 vec2 tp=px/uTile; vec2 id=floor(tp); vec2 f=fract(tp);
 float g=2.6/uTile;
 vec2 ed=min(f,1.-f); float d=min(ed.x,ed.y);
 float grout=1.-smoothstep(g*.5,g*.5+1.2/uTile,d);
 float rnd=h21(id);
 vec3 tileC=uTileA*(.95+.07*rnd);
 if(rnd>.88) tileC=uTileB;
 float band=step(abs(id.y-3.),.1); tileC=mix(tileC,uBand*(.95+.1*rnd),band*.85);
 tileC*=.96+.06*fbm(px*.03+id*7.);
 vec3 groutC=uGrout*(.85+.25*fbm(px*.08));
 float bev=1.-smoothstep(0.,.07,d);
 vec2 dirE=ed.x<ed.y?vec2(f.x<.5?-1.:1.,0.):vec2(0.,f.y<.5?-1.:1.);
 vec3 nT=normalize(vec3(dirE*bev*.9,1.));
 vec3 base=mix(tileC,groutC,grout);
 // ---------- microcement ----------
 vec4 mk=texture2D(uMask,vec2(uv.x,1.-uv.y));
 float n1=fbm(px*.012);
 float m=smoothstep(.32,.72,mk.r+(n1-.5)*.22);
 vec2 dir=normalize(mk.gb*2.-1.+1e-4);
 vec2 per=vec2(-dir.y,dir.x);
 vec2 q=vec2(dot(px,dir),dot(px,per));
 float cloud=fbm(px*.0042+vec2(3.1,7.7));
 float streak=fbm(vec2(q.x*.006,q.y*.055));
 float fine=vn(px*.9)*.5+vn(px*1.7)*.5;
 float tone=1.+(cloud-.5)*.2+(streak-.5)*.12+(fine-.5)*.035;
 float dry=smoothstep(uCure*1.5-.35,uCure*1.5,uv.x*.8+n1*.4);
 dry=uCure>0.?1.-dry:0.;
 vec3 mc=pow(uCol,vec3(1.15))*tone*mix(.86,.98,dry);
 // stroke lip from the mask gradient
 float mR=texture2D(uMask,vec2(uv.x,1.-uv.y)+vec2(uMaskTexel.x*1.5,0)).r;
 float mL=texture2D(uMask,vec2(uv.x,1.-uv.y)-vec2(uMaskTexel.x*1.5,0)).r;
 float mU=texture2D(uMask,vec2(uv.x,1.-uv.y)-vec2(0,uMaskTexel.y*1.5)).r;
 float mD=texture2D(uMask,vec2(uv.x,1.-uv.y)+vec2(0,uMaskTexel.y*1.5)).r;
 vec2 gr=vec2(mR-mL,mU-mD)*(1.-dry);
 vec3 nM=normalize(vec3(-gr*.8+per*(streak-.5)*.16,1.));
 vec3 N=normalize(mix(nT,nM,m));
 vec3 col=mix(base,mc,m);
 // ---------- light ----------
 vec3 L=normalize(vec3(lp-px,520.));
 vec3 V=vec3(0,0,1);vec3 H=normalize(L+V);
 float dif=.72+.28*max(dot(N,L),0.);
 float gloss=mix(mix(140.,10.,grout),mix(26.,14.,dry),m);
 float ks=mix(mix(.75,.05,grout),mix(.16,.08,dry),m);
 float spec=pow(max(dot(N,H),0.),gloss)*ks;
 float dl=length(lp-px)/max(uRes.x,uRes.y)*uDpr;
 float pool=.8+.3*exp(-dl*dl*6.);
 col=col*dif*pool+spec*vec3(1.,.96,.9);
 // window reflection streak on the glossy tiles
 col+=vec3(.05)*(1.-m)*(1.-grout)*smoothstep(.35,.0,abs(uv.x-uv.y*.35-.62+sin(uTime*.1)*.05));
 vec2 c=uv-.5; col*=1.-dot(c,c)*.55;
 gl_FragColor=vec4(pow(col,vec3(.96)),1.);
}`;

export type TrowelOpts = {
  colour: string;
  tiles?: { a: string; b: string; band: string; grout: string };
  onReady?: () => void;
  onFirst?: () => void;
  onCoverage?: (c: number) => void;
  onCured?: () => void;
  interactive?: boolean;
};
export type TrowelApi = {
  demo: () => void;
  finish: () => void;
  reset: () => void;
  setColour: (hex: string) => void;
  /** deterministic partial coat for posters (no animation) */
  still: () => void;
  light: (x: number, y: number) => void;
  destroy: () => void;
};

// Default wall: a dated cream tile with a terracotta border band (procedural, generic).
const TILES = { a: '#E4D6BC', b: '#D2BC98', band: '#7A5643', grout: '#6F675B' };

export function initTrowel(host: HTMLElement, cv: HTMLCanvasElement, opts: TrowelOpts): TrowelApi | null {
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) || 'shader'); return o; };
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { console.warn('trowel shader', e); return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {};
  ['uRes', 'uDpr', 'uTime', 'uLight', 'uCol', 'uCure', 'uTile', 'uMask', 'uMaskTexel', 'uTileA', 'uTileB', 'uBand', 'uGrout'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  const mask = document.createElement('canvas');
  const mctx = mask.getContext('2d')!;
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const probe = document.createElement('canvas'); probe.width = 48; probe.height = 27;
  const pctx = probe.getContext('2d', { willReadFrequently: true })!;

  const coarse = matchMedia('(pointer:coarse)').matches;
  let W = 0, H = 0, dpr = 1, tile = 110, dirty = true;
  const MS = 0.5;
  function resize() {
    const r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl!.viewport(0, 0, cv.width, cv.height);
    tile = W < 700 ? 64 : Math.max(96, Math.min(130, W / 13));
    let old: HTMLCanvasElement | null = null;
    if (mask.width) { old = document.createElement('canvas'); old.width = mask.width; old.height = mask.height; old.getContext('2d')!.drawImage(mask, 0, 0); }
    mask.width = Math.max(2, Math.round(W * MS)); mask.height = Math.max(2, Math.round(H * MS));
    mctx.fillStyle = 'rgb(0,128,128)'; mctx.fillRect(0, 0, mask.width, mask.height);
    if (old) mctx.drawImage(old, 0, 0, mask.width, mask.height);
    dirty = true;
  }
  resize();
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = window.setTimeout(resize, 150); };
  addEventListener('resize', onResize);

  let col = rgb(opts.colour);
  const tl = { ...TILES, ...(opts.tiles || {}) };
  let cure = 0, cureT = -1, cured = false;
  const light = { x: .62, y: .55, tx: .62, ty: .55 };
  let last: [number, number] | null = null, idleAt = performance.now();
  let ghost: null | { path: (t: number) => [number, number]; dur: number; t0: number; prev: [number, number] | null; done?: () => void } = null;
  let onFirst = opts.onFirst;

  const blade = () => Math.max(70, Math.min(170, W * 0.11));
  function stroke(x0: number, y0: number, x1: number, y1: number, alpha = 0.85) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const ux = dx / len, uy = dy / len, s = MS;
    const g = Math.round((ux * 0.5 + 0.5) * 255), bb = Math.round((-uy * 0.5 + 0.5) * 255);
    const c = `rgba(255,${g},${bb},${alpha})`;
    mctx.lineCap = 'round'; mctx.lineJoin = 'round';
    mctx.lineWidth = blade() * s; mctx.strokeStyle = c; mctx.shadowColor = c; mctx.shadowBlur = 14 * s;
    mctx.beginPath(); mctx.moveTo(x0 * s, y0 * s); mctx.lineTo(x1 * s, y1 * s); mctx.stroke();
    mctx.shadowBlur = 0;
    dirty = true;
  }

  // Pointer: desktop paints on hover; touch paints on swipe (the host keeps touch-action: pan-y).
  const skip = (e: Event) => !!(e.target as Element)?.closest?.('a,button,[data-notrowel]');
  const local = (e: PointerEvent): [number, number] => { const r = host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const onMove = (e: PointerEvent) => {
    const [x, y] = local(e);
    if (cured) { light.tx = x / W; light.ty = 1 - y / H; return; }
    if (skip(e)) { last = null; return; }
    light.tx = x / W; light.ty = 1 - y / H; idleAt = performance.now();
    if (ghost) return;
    if (last) { stroke(last[0], last[1], x, y); if (onFirst) { onFirst(); onFirst = undefined; } }
    last = [x, y];
  };
  const onLeave = () => (last = null);
  const onDown = (e: PointerEvent) => { if (!skip(e)) last = local(e); };
  const onUp = () => { if (coarse) last = null; };
  if (opts.interactive !== false) {
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointerup', onUp);
    host.addEventListener('pointercancel', onLeave);
  }

  function runGhost(path: (t: number) => [number, number], dur: number, done?: () => void) { ghost = { path, dur, t0: performance.now(), prev: null, done }; }
  function ghostStep(now: number) {
    if (!ghost) return;
    const k = Math.min(1, (now - ghost.t0) / ghost.dur);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [x, y] = ghost.path(e);
    if (ghost.prev) stroke(ghost.prev[0], ghost.prev[1], x, y, .9);
    ghost.prev = [x, y]; light.tx = x / W; light.ty = 1 - y / H;
    if (k >= 1) { const d = ghost.done; ghost = null; d && d(); }
  }
  // Starts from the poster's coat (so poster -> live is seamless), then a ghost trowel teaches the gesture.
  function demo() {
    still();
    if (W < 700) {
      runGhost((t) => [W * (1.1 - t * 1.2), H * 0.45 + Math.sin(t * Math.PI * 2) * H * 0.02], 1700);
      return;
    }
    const x0 = W * .52, x1 = W * .04, yc = H * .3;
    runGhost((t) => [x0 + (x1 - x0) * t, yc + Math.sin(t * Math.PI * 2.2) * H * .06], 1500);
  }
  function finish() {
    if (cured || cureT > 0) return;
    const rows = Math.ceil(H / (blade() * 0.75)) + 1;
    runGhost((t) => {
      const r = t * rows; const i = Math.floor(r); const fr = r - i;
      const y = (i + 0.5) * (H / rows) + (fr - .5) * 20;
      const x = i % 2 ? W * (1.08 - fr * 1.16) : W * (-0.08 + fr * 1.16);
      return [x, y];
    }, 1900, () => { mctx.fillStyle = 'rgba(255,128,128,.6)'; mctx.fillRect(0, 0, mask.width, mask.height); dirty = true; cureT = performance.now(); });
  }
  function reset() {
    ghost = null; cure = 0; cureT = -1; cured = false; last = null;
    mctx.fillStyle = 'rgb(0,128,128)'; mctx.fillRect(0, 0, mask.width, mask.height); dirty = true;
  }
  // Deterministic half-coated wall for posters: a few sweeping passes over the right-hand side.
  function still() {
    reset();
    const mob = W < 700;
    const rows = mob ? [.12, .2, .28, .36] : [.16, .29, .42, .55, .68, .81];
    rows.forEach((yy, i) => {
      const a = mob ? (i % 2 ? 1.1 : -0.1) : (i % 2 ? 1.08 : 0.5 + (i % 3) * 0.03);
      const b = mob ? (i % 2 ? -0.1 + (i === rows.length - 1 ? 0.5 : 0) : 1.1) : (i % 2 ? 0.48 + (i % 3) * 0.04 : 1.08);
      let prev: [number, number] | null = null;
      for (let k = 0; k <= 48; k++) {
        const t = k / 48; const x = W * (a + (b - a) * t); const y = H * yy + Math.sin(t * Math.PI * 2.4 + i) * H * 0.018;
        if (prev) stroke(prev[0], prev[1], x, y, .9); prev = [x, y];
      }
    });
    light.x = light.tx = .62; light.y = light.ty = .58;
  }

  let iv = 0;
  function measure() {
    pctx.drawImage(mask, 0, 0, probe.width, probe.height);
    const d = pctx.getImageData(0, 0, probe.width, probe.height).data;
    let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] > 150 ? 1 : 0;
    const coverage = s / (d.length / 4);
    opts.onCoverage?.(coverage);
    if (coverage > 0.72 && !cured && cureT < 0 && !ghost) finish();
  }

  let visible = true, raf = 0, alive = true, readied = false;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); });
  io.observe(host);
  iv = window.setInterval(() => { if (visible) measure(); }, 260);
  const t0 = performance.now();
  function frame(now: number) {
    ghostStep(now);
    if (!ghost && now - idleAt > 2600 && !coarse) { const t = now / 2400; light.tx = .6 + Math.cos(t) * .22; light.ty = .55 + Math.sin(t * 1.3) * .18; }
    if (coarse && !ghost) { const t = now / 2600; light.tx = .5 + Math.cos(t) * .3; light.ty = .6 + Math.sin(t * 1.2) * .2; }
    light.x += (light.tx - light.x) * .08; light.y += (light.ty - light.y) * .08;
    if (cureT > 0) { cure = Math.min(1, (now - cureT) / 2200); if (cure >= 1 && !cured) { cured = true; opts.onCured?.(); } }
    if (dirty) { gl!.bindTexture(gl!.TEXTURE_2D, tex); gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, mask); dirty = false; }
    gl!.uniform2f(U.uRes, cv.width, cv.height); gl!.uniform1f(U.uDpr, dpr); gl!.uniform1f(U.uTime, (now - t0) / 1000);
    gl!.uniform2f(U.uLight, light.x, light.y); gl!.uniform3f(U.uCol, col[0], col[1], col[2]);
    gl!.uniform1f(U.uCure, cure); gl!.uniform1f(U.uTile, tile);
    gl!.uniform3fv(U.uTileA, rgb(tl.a)); gl!.uniform3fv(U.uTileB, rgb(tl.b)); gl!.uniform3fv(U.uBand, rgb(tl.band)); gl!.uniform3fv(U.uGrout, rgb(tl.grout));
    gl!.uniform1i(U.uMask, 0); gl!.uniform2f(U.uMaskTexel, 1 / mask.width, 1 / mask.height);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    if (!readied) { readied = true; requestAnimationFrame(() => opts.onReady?.()); }
  }
  function loop() {
    cancelAnimationFrame(raf);
    if (!alive) return;
    raf = requestAnimationFrame(function f(now) {
      if (!visible || !alive) return;
      frame(now);
      raf = requestAnimationFrame(f);
    });
  }
  loop();

  return {
    demo, finish, reset, still,
    setColour(hex) { col = rgb(hex); },
    light(x, y) { light.x = light.tx = x; light.y = light.ty = y; idleAt = performance.now() + 1e9; },
    destroy() {
      alive = false; cancelAnimationFrame(raf); clearInterval(iv); clearTimeout(rt); io.disconnect();
      removeEventListener('resize', onResize);
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onLeave);
      // no loseContext: StrictMode remounts on the same canvas and would get a dead context back
    },
  };
}

function rgb(h: string): [number, number, number] {
  const s = h.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
