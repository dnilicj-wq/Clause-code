// "Design your floor": a photoreal example room with only the floor re-surfaced live in one WebGL2 shader.
// Ported from the Sentech configurator (same room scenes + maps, see sentech-site/tools/rooms.py):
// map PNG per room: R floor, G wall, B lighting, A distance up to the nearest object on the floor (reflections).
// Finishes: metallic (Dean's 5 hero palettes, laid in floor perspective), flake, quartz, solid (high build industrial resin).
const VS = `#version 300 es
in vec2 a; out vec2 vUv; uniform vec4 C;
void main(){ vUv = (a * vec2(.5, -.5) + .5) * C.xy + C.zw; gl_Position = vec4(a, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D Ph, Mp;
uniform float A, YH, CAM, MIX;
uniform int K0, K1; uniform vec3 P0[4], P1[4];
float h(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a * n(p); p = m * p; a *= .5; } return v; }
float fbm3(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++){ v += a * n(p); p = m * p; a *= .5; } return v / .875; }
float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }

// finish at floor point P (metres); fw = metres per pixel. rgb + gloss in w. p[0..3] = dark, mid, light, highlight
vec4 finish(int k, vec3 p[4], vec2 P, float fw){
  if (k == 0) { // metallic: domain-warped pigment, pale lace where it pulled apart (same look as the hero)
    vec2 q = P * .55;
    vec2 w1 = vec2(fbm3(q), fbm3(q + vec2(5.2, 1.3)));
    vec2 w2 = vec2(fbm3(q + 3.2 * w1 + vec2(1.7, 9.2)), fbm3(q + 3.2 * w1 + vec2(8.3, 2.8)));
    float f = fbm(q + 3.6 * w2);
    vec3 col = mix(p[0], p[1], smoothstep(.28, .44, f));
    col = mix(col, p[2], smoothstep(.5, .62, f + .18 * (w2.y - .5)));
    float e = abs(fract(f * 6. + w2.x * 2.) - .5);
    float lace = (1. - smoothstep(0., .035 + fw * 8., e)) * smoothstep(.3, .55, f);
    col = mix(col, mix(p[2], p[3], .6), lace * .6);
    col *= .82 + .26 * smoothstep(.15, .65, fbm3(q * 2.3 + w1 * 1.2));
    return vec4(col, .9);
  }
  if (k == 1) { // flake: broadcast chips in the palette's tones
    vec2 q = P * 85.; vec2 id = floor(q), f = fract(q) - .5;
    float r = h(id), r2 = h(id + 17.3);
    vec2 of = vec2(h(id + 3.1), h(id + 7.7)) - .5;
    float chip = step(length((f - of * .5) * vec2(1., 1.5 + r)), .2 + .2 * r2);
    vec3 tone = r < .3 ? p[0] : (r < .6 ? p[2] : (r < .85 ? p[1] : p[3]));
    vec3 col = mix(p[1] * .9, tone, chip);
    vec3 far = mix(p[1], (p[0] + p[2] + p[3]) / 3., .45) * (.96 + (n(P * 40.) - .5) * .2);
    return vec4(mix(col, far, smoothstep(.003, .009, fw)), .75);
  }
  if (k == 2) { // quartz: fine rounded aggregate, blends to a mottle with distance
    vec2 q = P * 260.; vec2 id = floor(q), f = fract(q) - .5;
    float r = h(id);
    float g = 1. - smoothstep(.3, .45, length(f - (vec2(h(id + 2.), h(id + 5.)) - .5) * .3));
    vec3 tone = r < .4 ? p[1] : (r < .7 ? p[2] : (r < .9 ? p[0] : p[3]));
    vec3 col = mix(p[1] * .85, tone, g);
    vec3 far = mix(p[1], p[2], .35) * (.97 + (n(P * 30.) - .5) * .12);
    return vec4(mix(col, far, smoothstep(.0015, .005, fw)), .7);
  }
  return vec4(p[1] * (1. + (fbm(P * .7) - .5) * .05), .85); // solid colour epoxy, full gloss
}

void main(){
  vec3 ph = texture(Ph, vUv).rgb;
  vec4 mp = texture(Mp, vUv);
  float a = mp.r;
  if (a < .003) { o = vec4(ph, 1.); return; }
  float v = max(vUv.y - YH, .004);
  float F = .667 * A; // level pinhole camera, 24 mm lens: image point -> floor point in metres
  vec2 P = vec2(CAM * (vUv.x - .5) * A / v, CAM * F / v);
  float fw = length(fwidth(P));
  vec4 f = finish(K1, P1, P, fw);
  if (MIX < 1.) f = mix(finish(K0, P0, P, fw), f, MIX);
  vec3 col = f.rgb * min(mp.b * 2., 1.7);
  col = mix(col, .8 + .2 * (1. - exp(-(col - .8) / .2)), step(.8, col)); // soft shoulder, pale finishes keep texture
  // gloss: mirror whatever stands on the floor about its base, blurred with distance
  float up = mp.a;
  vec2 ru = vec2(vUv.x, vUv.y - 2. * up);
  float lod = mix(3.2, 1., f.a) + up * 8.;
  vec3 rf = textureLod(Ph, ru, lod).rgb;
  float fres = mix(.06, .5, smoothstep(.32, .04, v)) * smoothstep(0., .02, ru.y) * smoothstep(.002, .02, up);
  col = mix(col, rf * mix(vec3(1.), f.rgb / max(lum(f.rgb), .05), .15), fres * f.a);
  col += max(textureLod(Ph, ru, lod + 1.).rgb - .82, 0.) * f.a * 1.6; // windows and lights bloom in the gloss
  o = vec4(mix(ph, col, a), 1.);
}`;

export type Kind = 0 | 1 | 2 | 3; // metallic, flake, quartz, solid
export type Pal4 = [string, string, string, string];
const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
// horizon height (fraction of the image) and camera height (m), read off each photo (same values as Sentech)
const SCENE: Record<string, [number, number]> = { kitchen: [.45, 1.5], living: [.46, 1.5], garage: [.47, 1.5], commercial: [.42, 1.6] };

export function createScene(el: HTMLElement, base: string) {
  const canvas = document.createElement('canvas');
  el.appendChild(canvas);
  const ctx = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true });
  if (!ctx) { canvas.remove(); throw new Error('no webgl2'); }
  const gl = ctx;
  const sh = (t: number, s: string) => { const x = gl.createShader(t)!; gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x) || 'shader'); return x; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {};
  ['Ph', 'Mp', 'A', 'YH', 'CAM', 'MIX', 'K0', 'K1', 'P0', 'P1', 'C'].forEach((k) => { U[k] = gl.getUniformLocation(prog, k); });
  gl.uniform1i(U.Ph, 0); gl.uniform1i(U.Mp, 1);

  const tex = (unit: number, img: ImageBitmap) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  // the map must stay un-premultiplied (alpha is data, not transparency)
  const bitmap = (url: string, raw?: boolean) => fetch(url).then((r) => r.blob()).then((b) => createImageBitmap(b, raw ? { premultiplyAlpha: 'none', colorSpaceConversion: 'none' } : {}));
  const cache: Record<string, Promise<[ImageBitmap, ImageBitmap]>> = {};
  const loadRoom = (area: string) => cache[area] || (cache[area] = Promise.all([bitmap(`${base}${area}.webp`), bitmap(`${base}${area}-map.png`, true)]));

  type F = { k: Kind; p: number[] };
  let room: { t1: WebGLTexture | null; t2: WebGLTexture | null } | null = null, aspect = 4 / 3;
  let from: F = { k: 3, p: Array(12).fill(.6) }, to = from, mix = 1, t0 = 0, raf = 0, visible = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cw = el.clientWidth, ch = el.clientHeight;
  new ResizeObserver(([e]) => { cw = e.contentRect.width; ch = e.contentRect.height; kick(); }).observe(el);

  function draw() {
    if (!room) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(cw * dpr), h = Math.round(ch * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    const s = (w / h) / aspect; // cover-fit the scene, cropping evenly
    gl.uniform4fv(U.C, s > 1 ? [1, 1 / s, 0, (1 - 1 / s) / 2] : [s, 1, (1 - s) / 2, 0]);
    gl.uniform1f(U.MIX, mix);
    gl.uniform1i(U.K0, from.k); gl.uniform3fv(U.P0, from.p);
    gl.uniform1i(U.K1, to.k); gl.uniform3fv(U.P1, to.p);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now: number) {
    raf = 0;
    if (mix < 1) mix = Math.min(1, (now - t0) / 450);
    draw();
    if (visible && mix < 1) raf = requestAnimationFrame(loop); // only animates while one finish blends into the next
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(el);

  return {
    canvas,
    async setRoom(area: string) {
      const [ph, mp] = await loadRoom(area);
      if (room) { gl.deleteTexture(room.t1); gl.deleteTexture(room.t2); }
      room = { t1: tex(0, ph), t2: tex(1, mp) };
      aspect = ph.width / ph.height;
      const [yh, cam] = SCENE[area];
      gl.uniform1f(U.A, aspect); gl.uniform1f(U.YH, yh); gl.uniform1f(U.CAM, cam);
      mix = 1; kick();
    },
    setFinish(k: Kind, pal: Pal4) {
      const next = { k, p: pal.flatMap(hex) };
      if (next.k === to.k && next.p.join() === to.p.join()) return;
      from = to; to = next; mix = reduce ? 1 : 0; t0 = performance.now(); kick();
    },
    preload(areas: string[]) { areas.forEach((a) => loadRoom(a)); },
  };
}
