// "Polish the wall": a procedural Venetian plaster surface (no photo). Matte until trowelled,
// then burnished to gloss. Pass 1 bakes marble (veins, cloud, trowel height) once per size;
// pass 2 is cheap per-frame shading with a polish mask drawn by trowel strokes on a 2D canvas.

export type Tone = { a: string; b: string; v: string };
type Opts = {
  canvas: HTMLCanvasElement;
  host: HTMLElement;              // the hero, for pointer + size
  wallRect: () => DOMRect | null; // area not covered by the copy card (coverage + auto clean)
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
 vec2 uv0=gl_FragCoord.xy/uRes.y;              // height-normalised: same pattern scale at any DPR
 vec2 uv=uv0*1.7;                               // zoomed out: more marble per screen
 vec2 p=uv*vec2(1.6,2.3)+vec2(3.1,7.4);
 vec2 q=vec2(fbm(p),fbm(p+vec2(5.2,1.3)));
 vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)),fbm(p+3.*q+vec2(8.3,2.8)));
 float f=fbm(p+2.6*r);
 // Soft diagonal veils, like his own walls (IG CTZJWBGoo8v, CR0jeE7BBb1, CYBuGVcIGd7): smoky, brushed,
 // tone on tone, fading in and out. No outlines. Only a few faint fine threads.
 vec2 d=mat2(.82,-.57,.57,.82)*uv;
 vec2 wq=vec2(fbm3(d*vec2(.6,1.8)+r),fbm3(d*vec2(.6,1.8)+vec2(3.,7.)));
 float wisp=fbm(d*vec2(.8,4.8)+1.7*wq);                      // stretched along the diagonal: brushed streaks
 float fade=smoothstep(.28,.62,fbm3(d*vec2(.45,1.1)+5.));     // veils come and go along their length
 float veil=smoothstep(.46,.78,wisp)*fade;
 float tp=fbm3(d*vec2(.7,1.6)+9.), tp2=fbm3(d*vec2(.5,1.3)+21.);
 // thin threads on a SMOOTH field (3 octaves) so they meander instead of zigzagging like cracks;
 // gaussian profile, and width + strength both taper along their length
 // level lines of two smooth fields; distance = field gap / gradient, so a vein is the same
 // thin width everywhere (no fat blobs where the field flattens). Width and strength taper.
 vec2 e=mat2(.82,-.57,.57,.82)*vec2(.002,0.), e2=mat2(.82,-.57,.57,.82)*vec2(0.,.002);
 vec2 s1=vec2(.55,2.2), s2=vec2(.4,1.7), o1=1.3*wq, o2=1.1*wq+4.;
 float tw=fbm3(d*s1+o1), tw2=fbm3(d*s2+o2);
 float g1=length(vec2(fbm3((d+e)*s1+o1)-tw,fbm3((d+e2)*s1+o1)-tw))/.002+.05;
 float g2=length(vec2(fbm3((d+e)*s2+o2)-tw2,fbm3((d+e2)*s2+o2)-tw2))/.002+.05;
 float k1=abs(fract(tw*3.2+.2)-.5)/3.2/g1, k2=abs(fract(tw2*2.6+.6)-.5)/2.6/g2;  // in uv units
 float w1=.0018+.0045*tp, w2=.0012+.003*tp2;      // ~1-3 css px, tapering
 // low gradient = a small closed loop round a peak (reads as a puddle outline): drop those
 float thread=exp(-pow(k1/w1,2.))*smoothstep(.34,.62,tp)*smoothstep(.75,1.7,g1);
 float thread2=exp(-pow(k2/w2,2.))*smoothstep(.4,.68,tp2)*smoothstep(.75,1.7,g2)*.6;
 float vein=max(thread,thread2);
 f=mix(f,1.-wisp,.45)+veil*.45;                                        // the same brushing in the light/dark clouding
 // trowel marks: soft overlapping patches + fine chalky grain
 vec2 t=mat2(.86,.5,-.5,.86)*uv;
 float h=fbm3(t*vec2(4.,10.));
 float g=noise(uv0*300.)*.6+noise(uv0*170.)*.4;            // chalky grain: burnishing removes it
 gl_FragColor=vec4(clamp(vein,0.,1.),f,h,g);
}`;
const SHADE = HEAD + `
uniform sampler2D uBase,uMask,uTrail;uniform vec2 uRes;uniform vec3 uLight,cA,cB,cV;uniform float uDone,uPx;
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;
 vec4 b=texture2D(uBase,uv);
 vec2 mu=vec2(uv.x,1.-uv.y), md=vec2(12.*uPx)/uRes;     // 4-tap blur: soft trowel edges
 float m=(texture2D(uMask,mu+vec2(md.x,md.y)).r+texture2D(uMask,mu+vec2(-md.x,md.y)).r+texture2D(uMask,mu+vec2(md.x,-md.y)).r+texture2D(uMask,mu-md).r)*.25;
 float s=uv.x*.62+(1.-uv.y)*.38;
 float fr=uDone*1.5-.25;
 m=max(m,1.-smoothstep(fr-.22,fr,s));
 m=smoothstep(.02,.92,m);
 float mH=smoothstep(0.,.42,m), mG=smoothstep(.38,1.,m);   // layer 1: haze lifts. layer 2+: shine builds
 // depth: stone under glass. Broad cloud between the two base tones, plus lighter and darker patches.
 float cl=b.g, lo=texture2D(uBase,uv*.45+.2).g;
 vec3 col=mix(cA,cB,smoothstep(.32,.68,cl));
 col*=1.+(cl-.5)*.8+(lo-.5)*.35;
 col=mix(col,mix(cB,cV,.3),smoothstep(.6,.9,cl)*.4);   // deep clouds carry the vein colour: smoke under glass
 col=mix(col,cV,b.r*.6);                                  // veins in the tone's own vein colour, soft and tapered
 vec2 o=vec2(uPx/uRes.x,uPx/uRes.y);
 float hx=texture2D(uBase,uv+vec2(o.x,0.)).b-texture2D(uBase,uv-vec2(o.x,0.)).b;
 float hy=texture2D(uBase,uv+vec2(0.,o.y)).b-texture2D(uBase,uv-vec2(0.,o.y)).b;
 float gx=texture2D(uBase,uv+vec2(o.x,0.)).a-texture2D(uBase,uv-vec2(o.x,0.)).a;
 float gy=texture2D(uBase,uv+vec2(0.,o.y)).a-texture2D(uBase,uv-vec2(0.,o.y)).a;
 float bump=mix(mix(.85,.45,mH),.1,mG), gb=.3*(1.-mH);
 vec3 n=normalize(vec3(-hx*bump-gx*gb,-hy*bump-gy*gb,1.));
 float lum=dot(col,vec3(.299,.587,.114));
 vec3 matte=mix(col,vec3(lum),.15)*.93+.07;   // unpolished: a light haze, colour still there           // unpolished: hazy chalk film, veins washed out
 matte+=(texture2D(uBase,uv*.5+.25).g-.5)*.06;        // uneven dusty haze
 vec3 gloss=pow(col,vec3(1.3));                    // deeper, richer colour
 vec3 satin=mix(col,vec3(lum),.25)*.91+.075;          // between haze and gloss: no bright rim at stroke edges            // clean but not yet burnished
 vec3 base=mix(mix(matte,satin,mH),gloss,mG);
 vec2 asp=vec2(uRes.x/uRes.y,1.);
 vec3 P=vec3(uv*asp,0.);
 vec3 L=normalize(vec3(uLight.xy*asp,uLight.z)-P);
 vec3 H=normalize(L+vec3(0.,0.,1.));
 float nh=max(dot(n,H),0.);
 float diff=.8+.2*dot(n,L);
 vec2 lp=uLight.xy*asp, dl=uv*asp-lp, sd=vec2(.94,-.34);
 float along=dot(dl,sd), perp=dot(dl,vec2(-sd.y,sd.x))+(n.x*.5+n.y*.5)*.08;  // relief bends the streak
 float streak=exp(-perp*perp/.0026)*exp(-along*along/.2);
 float glow=exp(-perp*perp/.02)*exp(-along*along/.3);
 float tr=smoothstep(.14,.85,(texture2D(uTrail,mu+md*1.5).r+texture2D(uTrail,mu-md*1.5).r+texture2D(uTrail,mu+vec2(md.x,-md.y)*1.5).r+texture2D(uTrail,mu-vec2(md.x,-md.y)*1.5).r)*.25);     // fresh burnish: just trowelled, relaxes over a few seconds
 float spec=(streak*.5+glow*.1)*mG+(streak*.12+glow*.08)*(1.-mG)+(streak*.35+glow*.07)*tr;  // matte still catches a broad soft sheen, so the edge never cuts hard
 // soft reflected "window" bands that slide with the light: the mirror sheen
 float band=sin((uv.x*asp.x*1.1-uv.y*.75-uLight.x*.6)*5.2+n.x*5.+n.y*3.)*.5+.5;
 float env=smoothstep(.72,.98,band)*.05*mG;
 base*=mix(1.,mix(.93,1.03,band),mG*mG);              // mirror: the room reflected as soft light and dark bands
 base=mix(base,gloss,tr*.5);
 vec3 c=base*diff;
 c=1.-(1.-c)*(1.-vec3(1.,.985,.96)*(spec+env));       // screen blend: sheen, never blown out
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
  const baseTex = tex(), maskTex = tex(), trailTex = tex();
  const fbo = gl.createFramebuffer();

  // polish mask: half CSS resolution is plenty (edges are soft anyway)
  const mask = document.createElement('canvas');
  const mx = mask.getContext('2d', { willReadFrequently: true })!;
  const trail = document.createElement('canvas'), tx = trail.getContext('2d')!;
  let trailT = -1e9, trailDirty = false;

  let W = 0, H = 0, cw = 0, ch = 0, dpr = 1;
  let dirty = true, need = true, done = o.reduced ? 1 : 0, doneT = -1, finished = o.reduced;
  const light = { x: .3, y: .7, tx: .3, ty: .7 };
  let tilt = false, lightT = -1e9;  // lightT: last time a pointer steered the light
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
    trail.width = cw; trail.height = ch; tx.fillStyle = '#000'; tx.fillRect(0, 0, cw, ch); trailDirty = true;
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
    if (trailDirty) { gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, trailTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, trail); trailDirty = false; }
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, trailTex); gl.uniform1i(U(shade, 'uTrail'), 2);
    gl.uniform2f(U(shade, 'uRes'), W, H); gl.uniform1f(U(shade, 'uPx'), 1.5 * dpr);
    gl.uniform3f(U(shade, 'uLight'), light.x, 1 - light.y, .75);
    gl.uniform3fv(U(shade, 'cA'), tone.cur[0]); gl.uniform3fv(U(shade, 'cB'), tone.cur[1]); gl.uniform3fv(U(shade, 'cV'), tone.cur[2]);
    gl.uniform1f(U(shade, 'uDone'), ease(done));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
  };

  // A steel trowel: a slightly curved blade, wider than a finger, swept sideways to the stroke.
  type Pen = { last: { x: number; y: number } | null };
  const pen: Pen = { last: null };
  const blade = (c: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) => {
    const L = Math.min(cw, ch) * .1 + 12, nx = -dy, ny = dx, bulge = L * .32;
    c.beginPath();
    c.moveTo(x - nx * L, y - ny * L);
    c.quadraticCurveTo(x + dx * bulge, y + dy * bulge, x + nx * L, y + ny * L);
    c.stroke();
  };
  const stroke = (x: number, y: number, p: Pen = pen, a = .2, blur = 11) => {  // x,y in mask px
    const last = p.last;
    if (!last) { p.last = { x, y }; return; }
    const ddx = x - last.x, ddy = y - last.y, d = Math.hypot(ddx, ddy);
    if (d < 1) return;
    const dx = ddx / d, dy = ddy / d;
    mx.save(); mx.strokeStyle = '#fff'; mx.lineCap = 'round'; mx.lineWidth = 6; mx.globalAlpha = a; mx.shadowColor = '#fff'; mx.shadowBlur = blur;
    for (let s = 0; s <= d; s += 1) blade(mx, last.x + dx * s, last.y + dy * s, dx, dy);
    mx.restore();
    tx.save(); tx.strokeStyle = '#fff'; tx.lineWidth = 6; tx.globalAlpha = .35; tx.shadowColor = '#fff'; tx.shadowBlur = blur;
    for (let s = 0; s <= d; s += 2) blade(tx, last.x + dx * s, last.y + dy * s, dx, dy);
    tx.restore(); trailT = performance.now(); trailDirty = true;
    p.last = { x, y }; dirty = need = true;
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
    if (finished || (cleanStarted && !userLed) || now - lastCov < 220) return;   // the auto clean runs its own layers
    lastCov = now;
    if (coverage() >= .45) { finished = true; doneT = now; }
  };

  // pointer: drag to polish. touch-action: pan-y keeps vertical page scroll; sideways drags polish.
  let down = false, touched = false;
  const toMask = (e: PointerEvent) => { const r = host.getBoundingClientRect(); return { x: (e.clientX - r.left) / 2, y: (e.clientY - r.top) / 2, u: (e.clientX - r.left) / r.width, v: (e.clientY - r.top) / r.height }; };
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('a,button,.hero-card,.nav')) return;
    down = true; pen.last = null;
    if (!cleanStarted) cleanStarted = userLed = true;
    if (!touched) { touched = true; o.onFirstTouch(); }
    const p = toMask(e); stroke(p.x, p.y);
  };
  const onMove = (e: PointerEvent) => {
    const p = toMask(e);
    if (e.pointerType === 'mouse' || down) { lightT = performance.now(); light.tx = p.u; light.ty = p.v - .04; need = true; }
    if (down && !o.reduced) stroke(p.x, p.y);
  };
  const onUp = () => { down = false; pen.last = null; };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    tilt = true; light.tx = Math.min(1.1, Math.max(-.1, .5 + e.gamma / 50)); light.ty = Math.min(1, Math.max(0, .35 + (e.beta - 40) / 70)); need = true;
  };
  if (o.coarse) window.addEventListener('deviceorientation', onTilt);  // no permission prompt; used only if the browser already sends it

  // Auto clean, slowly and in layers: three trowel passes across the wall (lift the haze, smooth, burnish),
  // alternating direction, then a last soft sweep so every corner (incl. under the card) ends glossy.
  type Row = { x0: number; x1: number; y: number; t0: number; dur: number; a: number; bend: number; pen: Pen };
  let rows: Row[] = [], cleanStarted = false, userLed = false;
  const clean = () => {
    if (cleanStarted || finished || o.reduced) return;
    cleanStarted = true;
    const hr = host.getBoundingClientRect(), wr = o.wallRect() || hr;
    const top = (wr.top - hr.top) / 2, h = Math.max(40, wr.height / 2), L = Math.min(cw, ch) * .1 + 12;
    const n = Math.max(4, Math.ceil(h / (L * 1.05))), passes = [{ a: .1, dur: 380 }, { a: .12, dur: 440 }, { a: .17, dur: 520 }];
    let t = performance.now();
    passes.forEach((ps, pi) => {
      for (let i = 0; i < n; i++) {
        const y = top + h * (i + (pi === 1 ? .9 : .5)) / n, ltr = (i + pi) % 2 === 0;
        rows.push({ x0: ltr ? -L : cw + L, x1: ltr ? cw + L : -L, y, t0: t, dur: ps.dur, a: ps.a, bend: (pi - 1) * L * .6, pen: { last: null } });
        t += ps.dur * .82;   // rows overlap slightly, like a plasterer working back across the wall
      }
      t += 260;              // short pause between layers
    });
    start();
  };
  const runRows = (now: number) => {
    if (!rows.length) return;
    rows = rows.filter((r) => {
      if (now < r.t0) return true;
      const k = Math.min(1, (now - r.t0) / r.dur), e = ease(k);
      const x = r.x0 + (r.x1 - r.x0) * e, y = r.y + Math.sin(e * Math.PI) * r.bend;
      stroke(x, y, r.pen, r.a * .45, 16);
      return k < 1;
    });
    if (!rows.length && !finished) { finished = true; doneT = now; }
  };

  let raf = 0, vis = true, alive = true;
  const frame = (now: number) => {
    raf = 0; if (!alive || !vis) return;
    runRows(now);
    if (!o.reduced && !tilt && now - lightT > (o.coarse ? 2500 : 6000)) {  // slow automatic glide
      const t = now / 1000; light.tx = .5 + .45 * Math.sin(t * .42); light.ty = .3 + .14 * Math.sin(t * .29 + 1); need = true;
    }
    const lx = light.x, ly = light.y;
    light.x += (light.tx - light.x) * .1; light.y += (light.ty - light.y) * .1;
    if (Math.abs(lx - light.x) + Math.abs(ly - light.y) > .0005) need = true;
    if (tone.t < 1) { tone.t = Math.min(1, tone.t + .035); tone.cur = tone.to.map((c, i) => c.map((v, j) => tone.from[i][j] + (v - tone.from[i][j]) * ease(tone.t))); need = true; }
    if (doneT >= 0 && done < 1) { done = Math.min(1, (now - doneT) / 1800); need = true; if (done >= 1) o.onDone(); }
    if (now - trailT < 4500) {  // burnished trail relaxes: ~2.5s to fade, then cleared
      tx.fillStyle = 'rgba(0,0,0,.016)'; tx.fillRect(0, 0, cw, ch); trailDirty = need = true;
    } else if (trailT > 0) { tx.fillStyle = '#000'; tx.fillRect(0, 0, cw, ch); trailT = -1e9; trailDirty = need = true; }
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
    clean,
    setTone(t: Tone) {
      const to = [rgb(t.a), rgb(t.b), rgb(t.v)];
      if (o.reduced) { tone.cur = to; draw(); return; }
      tone.from = tone.cur.map((c) => c.slice()); tone.to = to; tone.t = 0; start();
    },
    destroy() {
      alive = false; cancelAnimationFrame(raf); clearTimeout(rt); io.disconnect(); ro.disconnect();
      host.removeEventListener('pointerdown', onDown); host.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp); host.removeEventListener('pointercancel', onUp);
      window.removeEventListener('deviceorientation', onTilt); canvas.removeEventListener('webglcontextlost', lost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
