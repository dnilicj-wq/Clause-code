// Hero: Dan's photo of the house with its old block drive. Move (desktop) or swipe (phone) across the
// drive and the new surface pours over it. The new surfaces are real photos of the same house and car
// (tools/align-surfaces.py lines them up with the original), so the light, the shadow under the car and
// the texture are all photographed, not drawn. Raw WebGL, one fragment shader.
// Strokes go into a 2D mask canvas plus a "wet" canvas that fades: fresh resin is glossy for a few
// seconds (it reflects the house), then it is exactly the photo.
import { SCENES, maskDM } from './scenes.js';

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;uniform float uTime;
uniform sampler2D uPhoto;uniform sampler2D uDrive;uniform sampler2D uMask;uniform sampler2D uWet;
uniform sampler2D uSA;uniform sampler2D uSB;uniform float uSw; // surface photos: A (new) sweeps in over B, from the house outwards
uniform vec4 uCover;uniform vec4 uDM;uniform float uVb;uniform vec2 uTexel;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm3(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<3;i++){s+=a*vn(p);p=m*p;a*=.5;}return s;}
vec2 puvAt(vec2 fc){return uCover.xy+vec2(fc.x/uRes.x,1.-fc.y/uRes.y)*uCover.zw;}
void main(){
 vec2 fc=gl_FragCoord.xy;vec2 uv=fc/uRes;
 vec2 puv=puvAt(fc);
 vec3 photo=texture2D(uPhoto,puv).rgb;
 float drive=texture2D(uDrive,uDM.xy+puv*uDM.zw).r;
 vec3 col=photo;
 if(drive>.003){
  vec4 mk=texture2D(uMask,vec2(uv.x,1.-uv.y));
  float m=smoothstep(.36,.68,mk.r+(fbm3(fc*.01)-.5)*.22);
  // new surface; a change of surface is laid from the house towards the road
  float t=(puv.y-uVb)/(1.-uVb)+(vn(vec2(puv.x*9.,uTime*.3))-.5)*.05;
  float sw=1.-smoothstep(uSw-.03,uSw+.03,t);
  vec3 newc=mix(texture2D(uSB,puv).rgb,texture2D(uSA,puv).rgb,sw);
  float wet=texture2D(uWet,vec2(uv.x,1.-uv.y)).r*m;
  float edgeSh=smoothstep(.08,.34,mk.r)*(1.-m);
  vec3 lit=mix(photo*(1.-edgeSh*.3),newc,m);
  // fresh resin mirrors the house for a few seconds, then settles to the photo as it is
  vec2 rv=vec2(puv.x,clamp(2.*uVb-puv.y,.002,.998));
  lit=mix(lit,texture2D(uPhoto,rv).rgb,m*.4*wet*wet);
  // pour lip and the fresh line of a change catch the light
  vec2 mu=vec2(uv.x,1.-uv.y);
  float mR=texture2D(uMask,mu+vec2(uTexel.x*2.,0)).r,mL=texture2D(uMask,mu-vec2(uTexel.x*2.,0)).r;
  float mU=texture2D(uMask,mu-vec2(0,uTexel.y*2.)).r,mD=texture2D(uMask,mu+vec2(0,uTexel.y*2.)).r;
  float lip=clamp((mU-mD)*2.2+abs(mR-mL)*.8,0.,1.);
  lit+=vec3(1.,.96,.9)*(lip*.22*(.4+wet)+exp(-pow((t-uSw)*45.,2.))*step(uSw,1.)*m*.14);
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
  cv.__img = Promise.all([loadImg(scene.src), loadImg(scene.mask), surfImg('resin')]);
  if (ext) await new Promise(res => { const t0 = performance.now(); (function poll() { if (gl.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR) || performance.now() - t0 > 8000) res(); else setTimeout(poll, 50); })(); });
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('hero shader', gl.getShaderInfoLog && gl.getProgramInfoLog(prog)); return false; }
  cv.__prog = prog;
  try { [cv.__photo, cv.__mask, cv.__resin] = await cv.__img; } catch { return false; }
  return true;
}
const loadImg = src => { const i = new Image(); i.decoding = 'async'; i.src = src; return i.decode().then(() => i); };
// the finished-drive photos, fetched once each, when first wanted
const surfCache = {};
const surfImg = id => surfCache[id] || (surfCache[id] = loadImg(scene.surf[id]).catch(e => { delete surfCache[id]; throw e; }));

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
  const U = {}; ['uRes', 'uTime', 'uPhoto', 'uDrive', 'uMask', 'uWet', 'uSA', 'uSB', 'uSw', 'uCover', 'uDM', 'uVb', 'uTexel'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  const mkTex = (mip = false) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); [[gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v)); return t; };
  // static textures: photo (unit 2) and drive mask (unit 3). The photos are not a power of two, so no mipmaps:
  // they are shown at close to their own size anyway
  gl.activeTexture(gl.TEXTURE2); mkTex();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cv.__photo);
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

  // surface photos on units 4 (A, the one being laid) and 5 (B, the one under it). sw: 0..1 progress of the lay
  const surfTex = {};
  function texFor(id, img) {
    if (!surfTex[id]) { gl.activeTexture(gl.TEXTURE6); surfTex[id] = mkTex(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); gl.activeTexture(gl.TEXTURE0); }
    return surfTex[id];
  }
  let surfA = 'resin', surfB = 'resin', sw = 2, swT0 = 0, want = 'resin';
  texFor('resin', cv.__resin);
  let done = 0, doneT = -1, finished = false, coverage = 0;
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
    ghost.prev = [x, y];
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
    if (sw <= 1.1) sw = Math.min(2, (now - swT0) / 1100 * 1.1);
    // wet film settles over ~6s
    if (now - lastDecay > 60) { lastDecay = now; wctx.fillStyle = 'rgba(0,0,0,.035)'; wctx.fillRect(0, 0, wet.width, wet.height); dirty = true; }
    if (doneT > 0) { done = Math.min(1, (now - doneT) / 2400); if (done >= 1 && !finished) { finished = true; opts.onDone && opts.onDone(); } }
    if (dirty) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tMask); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tWet); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wet);
      dirty = false;
    }
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform1i(U.uMask, 0); gl.uniform1i(U.uWet, 1); gl.uniform1i(U.uPhoto, 2); gl.uniform1i(U.uDrive, 3);
    gl.uniform2f(U.uTexel, 1 / mask.width, 1 / mask.height);
    gl.uniform4fv(U.uCover, cover); gl.uniform4fv(U.uDM, DM.dm); gl.uniform1f(U.uVb, scene.vb / PH);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, surfTex[surfA]);
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, surfTex[surfB]);
    gl.uniform1i(U.uSA, 4); gl.uniform1i(U.uSB, 5); gl.uniform1f(U.uSw, Math.min(sw, 1.2));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // keep animating while something is moving; otherwise idle at ~12fps for glints
    const busy = ghost || now - lastPaint < 7000 || sw <= 1.1 || (doneT > 0 && !finished);
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
    // swap in another finished-drive photo (resin, block, tarmac, porcelain), laid from the house outwards
    async setSurface(id) {
      want = id;
      let img; try { img = await surfImg(id); } catch { return; }
      if (want !== id || id === surfA) return;
      texFor(id, img);
      surfB = sw <= 1.1 ? surfB : surfA; surfA = id;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) sw = 2; else { sw = 0; swT0 = performance.now(); }
      kick();
    },
    preload(ids) { ids.forEach(id => surfImg(id).catch(() => {})); },
    // poster: paint the demo stroke instantly and render one frame
    posterFrame() { const p = demoPath(); let prev = p(0); for (let i = 1; i <= 80; i++) { const q = p(i / 80); stroke(prev[0], prev[1], q[0], q[1], .92); prev = q; } wctx.fillStyle = 'rgba(0,0,0,.55)'; wctx.fillRect(0, 0, wet.width, wet.height); dirty = true; },
    get finished() { return finished; }
  };
}
