// Live metallic pour: one WebGL2 fragment shader that flows a Gafflow metallic pigment
// through a base colour, lit like a polished resin floor. No library.
// - Renders at the device's full pixel density (sharp on phones and retina screens).
// - Frame rate is lowered (not sharpness) on phones and while idle, to stay fast.
// - Light follows the mouse, or a finger drag on touch screens; drifts gently when idle.
// - Paused off screen. Reduced motion: a still frame, which still re-lights on touch or hover.
const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;
const FS = `#version 300 es
precision highp float;
uniform vec2 R; uniform float T; uniform vec3 B; uniform vec3 M; uniform vec2 P; uniform float S;
out vec4 o;
// sin-free hash: stable on mobile GPUs (no blocky precision artefacts)
float h(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++){ v += a * n(p); p = m * p; a *= .5; } return v; }
float field(vec2 p, float t, out vec2 r){
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t));
  r = vec2(fbm(p + 2.6*q + vec2(1.7, 9.2) + .1*t), fbm(p + 2.6*q + vec2(8.3, 2.8) - .08*t));
  return fbm(p + 3.*r);
}
void main(){
  float asp = R.x / R.y;
  vec2 uv = gl_FragCoord.xy / R.y;
  vec2 p = uv * 1.15 + S;
  vec2 r; float f = field(p, T * .03, r);
  // soft-edged metallic cells and a thinner pigment wash through the base
  float m = smoothstep(.5, .74, f);
  float wash = smoothstep(.38, .68, r.x);
  // smooth surface normal from the flow itself (analytic-free, resolution independent)
  // smooth surface normal: finite differences of a cheap low-frequency field
  // (no screen-space derivatives, so no 2x2 stair-stepping)
  vec2 gp = p * 1.3 + r * 1.6; float e = .02;
  float g0 = fbm(gp), gx = fbm(gp + vec2(e, 0.)), gy = fbm(gp + vec2(0., e));
  vec3 nrm = normalize(vec3(-(gx - g0) / e * .18, -(gy - g0) / e * .18, 1.));
  vec2 lp = vec2(P.x * asp, P.y);
  vec3 L = normalize(vec3(lp - uv, .75));
  vec3 V = vec3(0., 0., 1.);
  vec3 H = normalize(L + V);
  // metallic flakes brighten as they face the light; base stays deep and glossy
  float facing = max(dot(nrm, L), 0.);
  float sh = .38 + .85 * facing;
  vec3 metal = M * sh * (.82 + .3 * g0);
  vec3 base = B * (.92 + .08 * fbm(p * 3. + 4.));
  vec3 col = mix(base, mix(base, M * .45 * sh, .5), wash * .4);
  col = mix(col, metal, m);
  // lacing: soft bright veins at the cell edges
  float lace = exp(-pow((f - .5) / .012, 2.)) * (1. - m * .3);
  col += mix(M, vec3(1.), .55) * lace * .32 * sh;
  // clear coat: broad soft sheen + crisp highlight that follow the light
  float spec = pow(max(dot(nrm, H), 0.), 90.);
  col += spec * mix(M, vec3(1.), .7) * (.35 + .5 * m);
  vec2 d = (uv - lp) * vec2(1., 1.25);
  col += exp(-dot(d, d) * 5.) * .11;
  // reflections of three ceiling lights in the gloss
  for (int i = 0; i < 3; i++) {
    vec2 c = vec2(asp * (.22 + .28 * float(i)) + (P.x - .5) * .12, .8 - .06 * float(i) + (P.y - .5) * .06);
    vec2 q = (uv - c) * vec2(1., 2.2) + nrm.xy * .02;
    col += exp(-dot(q, q) * 900.) * .55 + exp(-dot(q, q) * 70.) * .045;
  }
  vec2 v = gl_FragCoord.xy / R - .5;
  col *= 1. - dot(v, v) * .5;
  // dither to remove colour banding in smooth gradients
  col += (h(gl_FragCoord.xy + fract(T) * 61.) - .5) / 255.;
  o = vec4(col, 1.);
}`;

const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
const lin = (c) => c.map((v) => Math.pow(v, 1.6)); // keeps metallic colours rich after lighting

export default function init(root) {
  const canvas = root.querySelector('canvas');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = Object.fromEntries(['R', 'T', 'B', 'M', 'P', 'S'].map((k) => [k, gl.getUniformLocation(prog, k)]));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  let FPS = coarse ? 30 : 60; // phones: fewer frames, never fewer pixels
  let slow = 0;               // adaptive: if frames keep arriving late, lower the frame rate further
  let cur = { b: [0, 0, 0], m: [1, 1, 1] }, from = cur, to = cur, mixT = 1;
  let seed = 0, ptr = [0.68, 0.72], ptrTo = [0.68, 0.72], live = false, raf = 0, last = performance.now(), lastDraw = 0, time = 8, lastInput = -1e9;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 3); // full device pixel density
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function render() {
    size();
    gl.uniform2f(U.R, canvas.width, canvas.height); gl.uniform1f(U.T, time); gl.uniform1f(U.S, seed);
    gl.uniform3fv(U.B, cur.b); gl.uniform3fv(U.M, cur.m); gl.uniform2f(U.P, ptr[0], ptr[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function step(now) {
    const dt = Math.min(100, now - last); last = now;
    if (mixT < 1) mixT = Math.min(1, mixT + dt / 650);
    const e = 1 - Math.pow(1 - mixT, 3);
    cur = { b: from.b.map((v, i) => v + (to.b[i] - v) * e), m: from.m.map((v, i) => v + (to.m[i] - v) * e) };
    if (!reduce) {
      time += dt / 1000 * (1 + 2.5 * (1 - mixT)); // the flow quickens while a new colour pours in
      if (now - lastInput > 2500) { // idle: the light drifts slowly so the gloss stays alive
        const k = now / 1000;
        ptrTo = [0.55 + 0.28 * Math.sin(k * 0.35), 0.62 + 0.18 * Math.sin(k * 0.27 + 1.3)];
      }
    }
    ptr = ptr.map((v, i) => v + (ptrTo[i] - v) * (reduce ? 1 : 0.12));
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const gap = now - lastDraw;
    if (gap < 1000 / FPS - 2) return;
    if (lastDraw && gap < 500) { slow = gap > 1000 / FPS * 1.6 ? slow + 1 : Math.max(0, slow - 1); if (slow > 20 && FPS > 15) { FPS = Math.round(FPS / 2); slow = 0; } }
    lastDraw = now; step(now); render();
  }
  function still() { const now = performance.now(); step(now); render(); }
  function aim(x, y) {
    const r = canvas.getBoundingClientRect();
    ptrTo = [Math.min(1, Math.max(0, (x - r.left) / r.width)), Math.min(1, Math.max(0, 1 - (y - r.top) / r.height))];
    lastInput = performance.now();
    if (reduce || !live) requestAnimationFrame(still);
  }
  root.addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
  root.addEventListener('pointerdown', (e) => aim(e.clientX, e.clientY), { passive: true });
  // touch: keep tracking the finger even while the page scrolls (pointer events cancel on scroll)
  root.addEventListener('touchstart', (e) => { const t = e.touches[0]; aim(t.clientX, t.clientY); }, { passive: true });
  root.addEventListener('touchmove', (e) => { const t = e.touches[0]; aim(t.clientX, t.clientY); }, { passive: true });
  new IntersectionObserver(([en]) => {
    live = en.isIntersecting; cancelAnimationFrame(raf);
    if (live && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } else if (live) requestAnimationFrame(still);
  }).observe(canvas);
  addEventListener('resize', () => requestAnimationFrame(still), { passive: true });

  return {
    set(baseHex, metalHex, reseed = false) {
      from = cur; to = { b: lin(hex(baseHex)), m: lin(hex(metalHex)) }; mixT = reduce ? 1 : 0;
      if (reseed) seed += 2.7;
      if (reduce || !live) requestAnimationFrame(still);
    },
    ready() { root.classList.add('gl-on'); },
  };
}
