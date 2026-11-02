// Live metallic pour: a WebGL2 fragment shader that swirls a Gafflow metallic pigment
// through a base colour, lit from the pointer like a gloss floor. ~3 KB, no library.
// Loaded only when the section is near; paused off screen; one static frame if reduced motion.
const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;
const FS = `#version 300 es
precision highp float;
uniform vec2 R; uniform float T; uniform vec3 B; uniform vec3 M; uniform vec2 P; uniform float S;
out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * n(p); p = m * p; a *= .5; } return v; }
void main(){
  float asp = R.x / R.y;
  vec2 uv = gl_FragCoord.xy / R.y;
  vec2 p = uv * 1.2 + S;
  float t = T * .03;
  // domain-warped flow: big poured cells, slowly drifting
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 2.8*q + vec2(1.7, 9.2) + .1*t), fbm(p + 2.8*q + vec2(8.3, 2.8) - .08*t));
  float f = fbm(p + 3.2*r);
  float m = smoothstep(.47, .66, f);          // dense metallic cells
  float wash = smoothstep(.32, .58, r.x);      // thin pigment drifting through the base
  // metallic flakes catch the light by angle: gentle slope of a smooth field, lit from the pointer
  float g = fbm(p * 1.6 + r * 1.4);
  vec3 nrm = normalize(vec3(-vec2(dFdx(g), dFdy(g)) * R.y * .22, 1.));
  vec2 lp = vec2(P.x * asp, P.y);
  vec3 L = normalize(vec3(lp - uv, .9));
  float sh = .5 + 1.0 * max(dot(nrm, L), 0.);
  vec3 metal = M * sh * (.75 + .5 * g);
  vec3 col = mix(B, mix(B, M * .55 * sh, .45), wash * .55);
  col = mix(col, metal, m);
  // lacing: fine bright lines along the edges of the cells
  float w = fwidth(f) * 1.3 + .0015;
  float lace = 1. - smoothstep(0., w, abs(f - .47));
  lace += (1. - smoothstep(0., w, abs(fract(f * 7. + r.y * 2.) - .5) - .47)) * .35 * m;
  col = mix(col, mix(M, vec3(1.), .55) * sh, clamp(lace, 0., 1.) * .6);
  // pearl sparkle inside the metallic
  col += step(.9945, h(floor(gl_FragCoord.xy / 1.5) + floor(T * 5.))) * m * .4 * sh;
  // clear-coat gloss: soft reflection that follows the pointer, plus three ceiling lights
  vec2 d = (uv - lp) * vec2(1., 1.4);
  col += exp(-dot(d, d) * 6.) * .14 * (1. + .6 * m);
  for (int i = 0; i < 3; i++) {
    vec2 c = vec2(asp * (.22 + .28 * float(i)) + (P.x - .5) * .1, .8 - .06 * float(i) + (P.y - .5) * .05);
    vec2 e = (uv - c) * vec2(1., 2.4);
    col += exp(-dot(e, e) * 1400.) * .7 + exp(-dot(e, e) * 60.) * .05;
  }
  col += smoothstep(.22, 0., abs(uv.x * .5 - uv.y + .32)) * .035;
  vec2 v = gl_FragCoord.xy / R - .5;
  col *= 1. - dot(v, v) * .6;
  o = vec4(col, 1.);
}`;

const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
const lin = (c) => c.map((v) => Math.pow(v, 1.6)); // keeps metallic colours rich after lighting

export default function init(root) {
  const canvas = root.querySelector('canvas');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
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
  let cur = { b: [0, 0, 0], m: [1, 1, 1] }, from = cur, to = cur, mixT = 1;
  let seed = 0, ptr = [0.7, 0.75], ptrTo = [0.7, 0.75], live = false, raf = 0, t0 = performance.now(), last = t0, time = 8;

  function size() {
    const scale = Math.min(devicePixelRatio || 1, 1.5) * (innerWidth < 760 ? 0.7 : 0.85);
    const w = Math.round(canvas.clientWidth * scale), h = Math.round(canvas.clientHeight * scale);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function draw(now) {
    const dt = Math.min(64, now - last); last = now;
    time += dt / 1000 * (1 + 2.5 * (1 - mixT)); // the swirl speeds up while a new colour pours in
    if (mixT < 1) mixT = Math.min(1, mixT + dt / 700);
    const e = 1 - Math.pow(1 - mixT, 3);
    cur = { b: from.b.map((v, i) => v + (to.b[i] - v) * e), m: from.m.map((v, i) => v + (to.m[i] - v) * e) };
    ptr = ptr.map((v, i) => v + (ptrTo[i] - v) * 0.08);
    size();
    gl.uniform2f(U.R, canvas.width, canvas.height); gl.uniform1f(U.T, time); gl.uniform1f(U.S, seed);
    gl.uniform3fv(U.B, cur.b); gl.uniform3fv(U.M, cur.m); gl.uniform2f(U.P, ptr[0], ptr[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (live && !reduce) raf = requestAnimationFrame(draw);
  }
  root.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ptrTo = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  }, { passive: true });
  new IntersectionObserver(([en]) => {
    live = en.isIntersecting; cancelAnimationFrame(raf);
    if (live) { last = performance.now(); raf = requestAnimationFrame(draw); }
  }).observe(canvas);
  addEventListener('resize', () => { if (!live || reduce) requestAnimationFrame(draw); }, { passive: true });

  return {
    set(baseHex, metalHex, reseed = false) {
      from = cur; to = { b: lin(hex(baseHex)), m: lin(hex(metalHex)) }; mixT = reduce ? 1 : 0;
      if (reseed) seed += 2.7;
      if (reduce || !live) requestAnimationFrame(draw);
    },
    ready() { root.classList.add('gl-on'); },
  };
}
