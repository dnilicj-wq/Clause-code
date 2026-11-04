// Hero: a dated tiled wall. Move (or swipe) to trowel microcement over it.
// Raw WebGL, one fragment shader; strokes are painted into a 2D mask canvas
// (R = coverage, G/B = trowel direction) that the shader samples.

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec2 uLight;uniform vec3 uCol;uniform float uCure;uniform float uTile;
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
 vec3 tileC=vec3(.86,.82,.745)*(.95+.07*rnd);
 if(rnd>.88) tileC=vec3(.78,.72,.63);
 float band=step(abs(id.y-3.),.1); tileC=mix(tileC,vec3(.55,.42,.33)*(.95+.1*rnd),band*.85);
 tileC*=.96+.06*fbm(px*.03+id*7.);
 vec3 groutC=vec3(.52,.49,.44)*(.85+.25*fbm(px*.08));
 vec3 nT=vec3(0,0,1);
 float bev=1.-smoothstep(0.,.07,d);
 vec2 dirE=ed.x<ed.y?vec2(f.x<.5?-1.:1.,0.):vec2(0.,f.y<.5?-1.:1.);
 nT=normalize(vec3(dirE*bev*.9,1.));
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
 // stroke lip from mask gradient
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
 // window reflection streak on glossy tiles
 col+=vec3(.05)*(1.-m)*(1.-grout)*smoothstep(.35,.0,abs(uv.x-uv.y*.35-.62+sin(uTime*.1)*.05));
 // vignette
 vec2 c=uv-.5; col*=1.-dot(c,c)*.55;
 gl_FragColor=vec4(pow(col,vec3(.96)),1.);
}`;

export function initHero(opts) {
  const hero = document.getElementById('hero');
  const cv = document.getElementById('heroGL');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { console.warn('hero shader', e); return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uRes', 'uDpr', 'uTime', 'uLight', 'uCol', 'uCure', 'uTile', 'uMask', 'uMaskTexel'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  // mask canvas
  const mask = document.createElement('canvas');
  const mctx = mask.getContext('2d', { willReadFrequently: false });
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const probe = document.createElement('canvas'); probe.width = 48; probe.height = 27;
  const pctx = probe.getContext('2d', { willReadFrequently: true });

  const coarse = matchMedia('(pointer:coarse)').matches;
  let W = 0, H = 0, dpr = 1, MS = 0.5, tile = 110, dirty = true;
  function resize() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(devicePixelRatio || 1, coarse ? 1.3 : 1.6);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    tile = W < 700 ? 64 : Math.max(96, Math.min(130, W / 13));
    // keep existing strokes when resizing
    const old = mask.width ? (() => { const c = document.createElement('canvas'); c.width = mask.width; c.height = mask.height; c.getContext('2d').drawImage(mask, 0, 0); return c; })() : null;
    mask.width = Math.round(W * MS); mask.height = Math.round(H * MS);
    mctx.fillStyle = 'rgb(0,128,128)'; mctx.fillRect(0, 0, mask.width, mask.height);
    if (old) mctx.drawImage(old, 0, 0, mask.width, mask.height);
    dirty = true;
  }
  resize();
  addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });

  let col = hexToRgb(opts.colour || '#E6DECB');
  let cure = 0, cureT = -1, cured = false, coverage = 0;
  const light = { x: .62, y: .55, tx: .62, ty: .55 };
  let last = null, idleAt = performance.now(), ghost = null;

  function blade() { return Math.max(70, Math.min(170, W * 0.11)); }
  function stroke(x0, y0, x1, y1, alpha = 0.85) {
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

  // pointer: desktop paints on hover, touch paints on horizontal swipe (pan-y keeps scroll)
  function local(e) { const r = hero.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  hero.addEventListener('pointermove', e => {
    if (cured) { const [x, y] = local(e); light.tx = x / W; light.ty = 1 - y / H; return; }
    if (e.target.closest('a,button,.dock')) { last = null; return; }
    const [x, y] = local(e);
    light.tx = x / W; light.ty = 1 - y / H; idleAt = performance.now();
    if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch' || e.pointerType === 'pen') {
      if (last) { stroke(last[0], last[1], x, y); opts.onFirst && (opts.onFirst(), opts.onFirst = null); }
      last = [x, y];
    }
  }, { passive: true });
  hero.addEventListener('pointerleave', () => last = null);
  hero.addEventListener('pointerdown', e => { if (!e.target.closest('a,button,.dock')) last = local(e); });
  hero.addEventListener('pointerup', () => { if (coarse) last = null; });
  hero.addEventListener('pointercancel', () => last = null);

  // ghost trowel: teaches the gesture, and finishes the wall on demand
  function runGhost(path, dur, done) {
    ghost = { path, dur, t0: performance.now(), prev: null, done };
  }
  function ghostStep(now) {
    if (!ghost) return;
    const k = Math.min(1, (now - ghost.t0) / ghost.dur);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [x, y] = ghost.path(e);
    if (ghost.prev) stroke(ghost.prev[0], ghost.prev[1], x, y, .9);
    ghost.prev = [x, y]; light.tx = x / W; light.ty = 1 - y / H;
    opts.onGhost && opts.onGhost(x, y, k < 1);
    if (k >= 1) { const d = ghost.done; ghost = null; d && d(); }
  }
  function demo() {
    if (W < 700) {
      // phones: two passes so the first screen already shows the finish
      runGhost(t => { const k = t * 2, row = Math.min(1, Math.floor(k)), fr = k - row; const x = row ? W * (1.1 - fr * 1.2) : W * (-0.1 + fr * 1.2); return [x, H * (0.36 + row * 0.13) + Math.sin(fr * Math.PI * 2) * H * 0.03]; }, 2600);
      return;
    }
    const x0 = W * .46, x1 = W * .94, yc = H * .42;
    runGhost(t => [x0 + (x1 - x0) * t, yc + Math.sin(t * Math.PI * 2.2) * H * .08], 1300);
  }
  function finish() {
    if (cured || cureT > 0) return;
    const rows = Math.ceil(H / (blade() * 0.75)) + 1;
    runGhost(t => {
      const r = t * rows; const i = Math.floor(r); const fr = r - i;
      const y = (i + 0.5) * (H / rows) + (fr - .5) * 20;
      const x = i % 2 ? W * (1.08 - fr * 1.16) : W * (-0.08 + fr * 1.16);
      return [x, y];
    }, 1900, () => { mctx.fillStyle = 'rgba(255,128,128,.6)'; mctx.fillRect(0, 0, mask.width, mask.height); dirty = true; cureT = performance.now(); });
  }

  function measure() {
    pctx.drawImage(mask, 0, 0, probe.width, probe.height);
    const d = pctx.getImageData(0, 0, probe.width, probe.height).data;
    let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] > 150 ? 1 : 0;
    coverage = s / (d.length / 4);
    // grout on the visible wall, if each tile were 15 cm
    const cols = W / tile, rows = H / tile;
    const total = (cols * rows * 2) * 0.15;
    opts.onCoverage && opts.onCoverage(coverage, cured ? 0 : total * (1 - coverage));
    if (coverage > 0.72 && !cured && cureT < 0 && !ghost) finish();
  }
  setInterval(() => { if (visible) measure(); }, 260);

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(hero);
  const t0 = performance.now();
  let raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function f(now) {
      if (!visible) return;
      ghostStep(now);
      if (!ghost && now - idleAt > 2600 && !coarse) { const t = now / 2400; light.tx = .6 + Math.cos(t) * .22; light.ty = .55 + Math.sin(t * 1.3) * .18; }
      if (coarse && !ghost) { const t = now / 2600; light.tx = .5 + Math.cos(t) * .3; light.ty = .6 + Math.sin(t * 1.2) * .2; }
      light.x += (light.tx - light.x) * .08; light.y += (light.ty - light.y) * .08;
      if (cureT > 0) { cure = Math.min(1, (now - cureT) / 2200); if (cure >= 1 && !cured) { cured = true; opts.onCured && opts.onCured(); } }
      if (dirty) { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask); dirty = false; }
      gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uDpr, dpr); gl.uniform1f(U.uTime, (now - t0) / 1000);
      gl.uniform2f(U.uLight, light.x, light.y); gl.uniform3f(U.uCol, col[0], col[1], col[2]);
      gl.uniform1f(U.uCure, cure); gl.uniform1f(U.uTile, tile);
      gl.uniform1i(U.uMask, 0); gl.uniform2f(U.uMaskTexel, 1 / mask.width, 1 / mask.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(f);
    });
  }
  hero.classList.add('gl');
  loop();
  return {
    demo, finish,
    setColour(hex) { col = hexToRgb(hex); },
    get cured() { return cured; }
  };
}

function hexToRgb(h) {
  const n = parseInt(h.replace('#', ''), 16);
  // to linear-ish so the wall reads like the swatch under the shader's light
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
