// "Polish the wall": a procedural Venetian plaster surface (no photo). Matte until trowelled,
// then burnished to gloss. Pass 1 bakes marble (veins, cloud, trowel height) once per size;
// pass 2 is cheap per-frame shading with a polish mask drawn by trowel strokes on a 2D canvas.

export type Tone = { a: string; b: string; v: string };
type Opts = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;              // the hero, for pointer + size
  wallRect: () => DOMRect | null; // area not covered by the copy card (coverage + demo)
  tone: Tone;
  reduced: boolean;
  coarse: boolean;
  onDone: () => void;
  onFirstTouch: () => void;
};

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const HEAD = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
const BAKE = HEAD + `
uniform vec2 uRes;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
float fbm3(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<3;i++){v+=a*noise(p);p=m*p;a*=.5;}return v/.875;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes.y;               // height-normalised: same pattern scale at any DPR
 vec2 p=uv*vec2(1.6,2.3)+vec2(3.1,7.4);
 vec2 q=vec2(fbm(p),fbm(p+vec2(5.2,1.3)));
 vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)),fbm(p+3.*q+vec2(8.3,2.8)));
 float f=fbm(p+2.6*r);
 // flowing marble veins: sin(direction + turbulence), faded in and out along their length
 float w1=sin((uv.x*.7+uv.y*1.5)*4.2+5.5*fbm3(p*.5+1.2*r));
 float k1=.012+.06*fbm3(p*1.1+5.);
 float w2=sin((uv.x*1.9-uv.y*.6)*6.+6.*fbm3(p*.8+4.+q));
 float a1=smoothstep(.3,.6,fbm(p*.6+9.)), a2=smoothstep(.4,.65,fbm(p*.9+2.));
 float vein=(1.-smoothstep(.0,k1,abs(w1)))*a1*.7+(1.-smoothstep(.0,.45,abs(w1)))*a1*.28+(1.-smoothstep(.0,.01,abs(w2)))*a2*.32+(1.-smoothstep(.0,.2,abs(w2)))*a2*.1;
 // trowel marks: soft overlapping patches + fine chalky grain
 vec2 t=mat2(.86,.5,-.5,.86)*uv;
 float h=fbm3(t*vec2(4.,10.));
 float g=noise(uv*300.)*.6+noise(uv*170.)*.4;            // chalky grain: burnishing removes it
 gl_FragColor=vec4(clamp(vein,0.,1.),f,h,g);
}`;
const SHADE = HEAD + `
uniform sampler2D uBase,uMask;uniform vec2 uRes;uniform vec3 uLight,cA,cB,cV;uniform float uDone,uPx;
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;
 vec4 b=texture2D(uBase,uv);
 vec2 mu=vec2(uv.x,1.-uv.y), md=vec2(3.*uPx)/uRes;     // 4-tap blur: soft trowel edges
 float m=(texture2D(uMask,mu+vec2(md.x,md.y)).r+texture2D(uMask,mu+vec2(-md.x,md.y)).r+texture2D(uMask,mu+vec2(md.x,-md.y)).r+texture2D(uMask,mu-md).r)*.25;
 float s=uv.x*.62+(1.-uv.y)*.38;
 float fr=uDone*1.5-.25;
 m=max(m,1.-smoothstep(fr-.22,fr,s));
 m=smoothstep(.04,.5,m);                           // one firm pass gives full gloss
 vec3 col=mix(cA,cB,smoothstep(.22,.82,b.g));
 col=mix(col,mix(cB,cV,.3),smoothstep(.58,.9,b.g)*.4);   // cloudy stone mottling
 col=mix(col,cV,b.r*.82);
 vec2 o=vec2(uPx/uRes.x,uPx/uRes.y);
 float hx=texture2D(uBase,uv+vec2(o.x,0.)).b-texture2D(uBase,uv-vec2(o.x,0.)).b;
 float hy=texture2D(uBase,uv+vec2(0.,o.y)).b-texture2D(uBase,uv-vec2(0.,o.y)).b;
 float gx=texture2D(uBase,uv+vec2(o.x,0.)).a-texture2D(uBase,uv-vec2(o.x,0.)).a;
 float gy=texture2D(uBase,uv+vec2(0.,o.y)).a-texture2D(uBase,uv-vec2(0.,o.y)).a;
 float bump=mix(1.8,.1,m), gb=.55*(1.-smoothstep(0.,.35,m));
 vec3 n=normalize(vec3(-hx*bump-gx*gb,-hy*bump-gy*gb,1.));
 float lum=dot(col,vec3(.299,.587,.114));
 vec3 matte=mix(col,vec3(lum),.65)*.62+.33;           // unpolished: hazy chalk film, veins washed out
 matte+=(texture2D(uBase,uv*.5+.25).g-.5)*.06;        // uneven dusty haze
 vec3 gloss=pow(col,vec3(2.1))*.97;                    // deeper, richer colour
 vec3 base=mix(matte,gloss,m);
 vec2 asp=vec2(uRes.x/uRes.y,1.);
 vec3 P=vec3(uv*asp,0.);
 vec3 L=normalize(vec3(uLight.xy*asp,uLight.z)-P);
 vec3 H=normalize(L+vec3(0.,0.,1.));
 float nh=max(dot(n,H),0.);
 float diff=.8+.2*dot(n,L);
 float spec=pow(nh,mix(6.,2400.,m))*mix(.03,1.,m*m*m)+pow(nh,300.)*.14*m+pow(nh,40.)*.05*m;
 // soft reflected "window" bands that slide with the light: the mirror sheen
 float band=sin((uv.x*asp.x*1.1-uv.y*.75-uLight.x*.6)*5.2+n.x*5.+n.y*3.)*.5+.5;
 float env=smoothstep(.72,.98,band)*.09*m;
 base*=mix(1.,mix(.86,1.04,band),m);              // mirror: the room reflected as soft light and dark bands
 vec3 c=base*diff+vec3(1.,.985,.96)*(spec+env);
 c*=1.-.1*length((uv-.5)*vec2(1.,.8));
 gl_FragColor=vec4(c,1.);
}`;

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const ease = (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initPolish(o: Opts) {
  const { canvas, host } = o;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'default' });
  if (!gl) return null;

  const prog = (fs: string) => {
    const p = gl.createProgram()!;
    for (const [t, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]] as const) {
      const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link');
    return p;
  };
  let bake: WebGLProgram, shade: WebGLProgram;
  try { bake = prog(BAKE); shade = prog(SHADE); } catch { return null; }
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const tex = () => { const t = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    return t; };
  const baseTex = tex(), maskTex = tex();
  const fbo = gl.createFramebuffer();

  // polish mask: half CSS resolution is plenty (edges are soft anyway)
  const mask = document.createElement('canvas');
  const mx = mask.getContext('2d', { willReadFrequently: true })!;

  let W = 0, H = 0, cw = 0, ch = 0, dpr = 1;
  let dirty = true, need = true, done = o.reduced ? 1 : 0, doneT = -1, finished = o.reduced;
  const light = { x: .3, y: .7, tx: .3, ty: .7 };
  let tilt = false, pointerLight = false;
  const tone = { cur: [rgb(o.tone.a), rgb(o.tone.b), rgb(o.tone.v)], from: [] as number[][], to: [] as number[][], t: 1 };

  const resize = () => {
    const r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (w === W && Math.abs(h - H) < 2) return;
    W = w; H = h; canvas.width = W; canvas.height = H;
    // keep earlier strokes when the size changes
    const old = cw ? (() => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; c.getContext('2d')!.drawImage(mask, 0, 0); return c; })() : null;
    cw = Math.max(2, Math.round(r.width / 2)); ch = Math.max(2, Math.round(r.height / 2));
    mask.width = cw; mask.height = ch; mx.fillStyle = '#000'; mx.fillRect(0, 0, cw, ch);
    if (old) mx.drawImage(old, 0, 0, cw, ch);
    gl.bindTexture(gl.TEXTURE_2D, baseTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, baseTex, 0);
    gl.viewport(0, 0, W, H); gl.useProgram(bake); gl.uniform2f(U(bake, 'uRes'), W, H);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    dirty = need = true;
  };

  const draw = () => {
    if (dirty) { gl.bindTexture(gl.TEXTURE_2D, maskTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask); dirty = false; }
    gl.viewport(0, 0, W, H); gl.useProgram(shade);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, baseTex); gl.uniform1i(U(shade, 'uBase'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, maskTex); gl.uniform1i(U(shade, 'uMask'), 1);
    gl.uniform2f(U(shade, 'uRes'), W, H); gl.uniform1f(U(shade, 'uPx'), 1.5 * dpr);
    gl.uniform3f(U(shade, 'uLight'), light.x, 1 - light.y, .75);
    gl.uniform3fv(U(shade, 'cA'), tone.cur[0]); gl.uniform3fv(U(shade, 'cB'), tone.cur[1]); gl.uniform3fv(U(shade, 'cV'), tone.cur[2]);
    gl.uniform1f(U(shade, 'uDone'), ease(done));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
  };

  // A steel trowel: a slightly curved blade, wider than a finger, swept sideways to the stroke.
  let last: { x: number; y: number } | null = null;
  const blade = (x: number, y: number, dx: number, dy: number) => {
    const L = Math.min(cw, ch) * .1 + 12, nx = -dy, ny = dx, bulge = L * .32;
    mx.beginPath();
    mx.moveTo(x - nx * L, y - ny * L);
    mx.quadraticCurveTo(x + dx * bulge, y + dy * bulge, x + nx * L, y + ny * L);
    mx.stroke();
  };
  const stroke = (x: number, y: number) => {  // x,y in mask px
    if (!last) { last = { x, y }; return; }
    const ddx = x - last.x, ddy = y - last.y, d = Math.hypot(ddx, ddy);
    if (d < 1) return;
    const dx = ddx / d, dy = ddy / d;
    mx.save(); mx.strokeStyle = '#fff'; mx.lineCap = 'round'; mx.lineWidth = 6; mx.globalAlpha = .14; mx.shadowColor = '#fff'; mx.shadowBlur = 7;
    for (let s = 0; s <= d; s += 2.5) blade(last.x + dx * s, last.y + dy * s, dx, dy);
    mx.restore();
    last = { x, y }; dirty = need = true;
  };

  // coverage over the visible wall only (the copy card hides part of it)
  let lastCov = 0;
  const coverage = () => {
    const wr = o.wallRect(), hr = host.getBoundingClientRect();
    if (!wr) return 0;
    const x0 = Math.max(0, Math.floor((wr.left - hr.left) / 2)), y0 = Math.max(0, Math.floor((wr.top - hr.top) / 2));
    const w = Math.min(cw - x0, Math.floor(wr.width / 2)), h = Math.min(ch - y0, Math.floor(wr.height / 2));
    if (w < 4 || h < 4) return 0;
    const d = mx.getImageData(x0, y0, w, h).data; let n = 0, t = 0;
    for (let i = 0; i < d.length; i += 16) { t++; if (d[i] > 110) n++; }
    return n / t;
  };
  const check = (now: number) => {
    if (finished || now - lastCov < 220) return;
    lastCov = now;
    if (coverage() >= .45) { finished = true; doneT = now; }
  };

  // pointer: drag to polish. touch-action: pan-y keeps vertical page scroll; sideways drags polish.
  let down = false, touched = false;
  const toMask = (e: PointerEvent) => { const r = host.getBoundingClientRect(); return { x: (e.clientX - r.left) / 2, y: (e.clientY - r.top) / 2, u: (e.clientX - r.left) / r.width, v: (e.clientY - r.top) / r.height }; };
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('a,button,.hero-card,.nav')) return;
    down = true; last = null; demo = null;
    if (!touched) { touched = true; o.onFirstTouch(); }
    const p = toMask(e); stroke(p.x, p.y);
  };
  const onMove = (e: PointerEvent) => {
    const p = toMask(e);
    if (e.pointerType === 'mouse') { pointerLight = true; light.tx = p.u; light.ty = p.v; need = true; }
    if (down && !o.reduced) stroke(p.x, p.y);
  };
  const onUp = () => { down = false; last = null; };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    tilt = true; light.tx = Math.min(1.1, Math.max(-.1, .5 + e.gamma / 50)); light.ty = Math.min(1, Math.max(0, .35 + (e.beta - 40) / 70)); need = true;
  };
  if (o.coarse) window.addEventListener('deviceorientation', onTilt);  // no permission prompt; used only if the browser already sends it

  // phones: one slow demo stroke after ~1s, unless they've already touched it
  let demo: { t0: number } | null = null;
  // after 2s the wall cleans itself with one smooth sweep (any drag before that still polishes)
  const demoTimer = o.reduced ? 0 : window.setTimeout(() => { if (!finished) { finished = true; doneT = performance.now(); start(); } }, Math.max(600, 2000 - performance.now()));  // 2s after page load
  const runDemo = (now: number) => {
    if (!demo) return;
    const wr = o.wallRect(), hr = host.getBoundingClientRect(); if (!wr) { demo = null; return; }
    const k = Math.min(1, (now - demo.t0) / 1900), e = ease(k);
    const x = (wr.left - hr.left) + wr.width * (.12 + .76 * e), y = (wr.top - hr.top) + wr.height * (.46 + .1 * Math.sin(e * Math.PI));
    stroke(x / 2, y / 2);
    if (k >= 1) { demo = null; last = null; }
  };

  let raf = 0, vis = true, alive = true;
  const frame = (now: number) => {
    raf = 0; if (!alive || !vis) return;
    runDemo(now);
    if (!o.reduced && !tilt && !pointerLight) {  // slow automatic light sweep
      const t = now / 1000; light.tx = .5 + .42 * Math.sin(t * .55); light.ty = .32 + .16 * Math.sin(t * .37 + 1); need = true;
    }
    const lx = light.x, ly = light.y;
    light.x += (light.tx - light.x) * .12; light.y += (light.ty - light.y) * .12;
    if (Math.abs(lx - light.x) + Math.abs(ly - light.y) > .0005) need = true;
    if (tone.t < 1) { tone.t = Math.min(1, tone.t + .06); tone.cur = tone.to.map((c, i) => c.map((v, j) => tone.from[i][j] + (v - tone.from[i][j]) * ease(tone.t))); need = true; }
    if (doneT >= 0 && done < 1) { done = Math.min(1, (now - doneT) / 1500); need = true; if (done >= 1) o.onDone(); }
    check(now);
    if (need) { draw(); need = false; }
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && alive && vis) raf = requestAnimationFrame(frame); };

  const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) start(); else { cancelAnimationFrame(raf); raf = 0; } });
  io.observe(host);
  let rt = 0;
  const ro = new ResizeObserver(() => { clearTimeout(rt); rt = window.setTimeout(() => { resize(); if (o.reduced) draw(); }, 120); });
  ro.observe(host);
  const lost = (e: Event) => { e.preventDefault(); alive = false; canvas.style.opacity = '0'; };
  canvas.addEventListener('webglcontextlost', lost);

  resize();
  if (o.reduced) { light.x = light.tx = .62; light.y = light.ty = .3; draw(); o.onDone(); }
  else { draw(); start(); }

  return {
    setTone(t: Tone) {
      const to = [rgb(t.a), rgb(t.b), rgb(t.v)];
      if (o.reduced) { tone.cur = to; draw(); return; }
      tone.from = tone.cur.map((c) => c.slice()); tone.to = to; tone.t = 0; start();
    },
    destroy() {
      alive = false; cancelAnimationFrame(raf); clearTimeout(demoTimer); clearTimeout(rt); io.disconnect(); ro.disconnect();
      host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onUp);
      window.removeEventListener('deviceorientation', onTilt); canvas.removeEventListener('webglcontextlost', lost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
