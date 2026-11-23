// "Pour your floor": one raw WebGL1 fragment shader, no three.js.
// Metallic = domain-warped resin with moving sheen; drag stirs it (up to 24 stirs, each decays = self-levelling).
// Palettes start from colours sampled in Dean's own clips (see content-inventory.md), pushed apart so each chip reads clearly.

export type Pal = [string, string, string, string]; // dark, mid, light, highlight

export const PALETTES: { key: string; name: string; pal: Pal; from: string }[] = [
  { key: 'creambronze', name: 'Cream / bronze', pal: ['#2a1c12', '#7d5c3e', '#d9c4a4', '#e0a868'], from: 'reels 1657863749299936 + 995389396926285' },
  { key: 'blackred', name: 'Black / red', pal: ['#0c0505', '#6e1712', '#c83a30', '#f2a38a'], from: 'reel 1746294663336612' },
  { key: 'marble', name: 'White / grey marble', pal: ['#3e4244', '#c9ccca', '#f4f4f1', '#ffffff'], from: 'reel 2652333431876197' },
  { key: 'pearl', name: 'Pearl', pal: ['#4a4450', '#8f8798', '#cfc6d6', '#fff4ea'], from: 'reel 1628390941994156' },
  { key: 'bluequartz', name: 'Blue quartz', pal: ['#0b1a33', '#1f4f8f', '#6ea0dc', '#dbeaff'], from: 'reel 1097325556221087 (tinted toward blue: his caption says blue quartz, the phone video is washed out)' },
];

const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const N = 24;
const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes; uniform float uT;
uniform vec3 uPal[4]; uniform vec2 uLight;
uniform vec4 uStir[${N}]; uniform float uK[${N}];
float h1(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(h1(i),h1(i+vec2(1,0)),f.x), mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; mat2 r=mat2(.8,.6,-.6,.8); for(int i=0;i<4;i++){ s+=a*vn(p); p=r*p*2.03+3.1; a*=.5; } return s; }
vec2 stir(vec2 p){
  for(int i=0;i<${N};i++){ float k=uK[i]; if(k<.002) continue; vec4 s=uStir[i]; vec2 d=p-s.xy;
    float g=exp(-dot(d,d)*16.); float a=k*g*.9*sign(d.x*s.w-d.y*s.z+1e-4)*smoothstep(0.,.08,abs(d.x*s.w-d.y*s.z));
    float c=cos(a), sn=sin(a); d=mat2(c,sn,-sn,c)*d; p=s.xy+d-s.zw*g*k*.07; }
  return p; }
float fbm3(vec2 p){ float s=0., a=.5; mat2 r=mat2(.8,.6,-.6,.8); for(int i=0;i<3;i++){ s+=a*vn(p); p=r*p*2.07+1.7; a*=.5; } return s/.875; }
vec3 metallic(vec2 p){
  float t=uT*.035; vec2 q=stir(p)*1.3;
  vec2 w1=vec2(fbm3(q+vec2(0.,t)), fbm3(q+vec2(5.2,1.3)-t));
  vec2 w2=vec2(fbm3(q+3.2*w1+vec2(1.7,9.2)+t*.5), fbm3(q+3.2*w1+vec2(8.3,2.8)));
  float f=fbm(q+3.6*w2);
  // marbled body: dark pools, mid body, pale streaks
  vec3 col=mix(uPal[0],uPal[1],smoothstep(.28,.44,f));
  col=mix(col,uPal[2],smoothstep(.5,.62,f+.18*(w2.y-.5)));
  float rip=sin(f*26.+w2.x*9.);
  col=mix(col,mix(uPal[1],uPal[2],.6),smoothstep(.55,1.,rip)*.3);
  col=mix(col,uPal[0],smoothstep(.7,1.,-rip)*.25*smoothstep(.3,.5,f));
  // lace: thin pale cell edges where the pigment pulled apart
  float e=abs(fract(f*6.+w2.x*2.)-.5);
  float lace=(1.-smoothstep(.0,.035,e))*smoothstep(.3,.55,f);
  col=mix(col,mix(uPal[2],uPal[3],.6),lace*.7);
  // depth: veins of darker pigment under the gloss
  col*=.78+.32*smoothstep(.15,.65,fbm3(q*2.3+w1*1.2));
  // pearl shimmer that moves with the light
  float hgt=f+.25*lace;
  vec2 g=vec2(dFdx(hgt),dFdy(hgt))*uRes.y*.012;
  vec2 L=uLight*.55;
  float shim=smoothstep(.0,.9,dot(normalize(g+1e-5),normalize(L+1e-5)))*min(length(g)*2.,1.);
  col+=uPal[3]*shim*.12*smoothstep(.4,.8,f);
  // glossy topcoat: soft mirrored reflections of two lights, bent slightly by the surface
  vec2 r=p+g*.04;
  vec2 d1=r-vec2(L.x+.15,L.y*.6+.2); vec2 d2=r-vec2(L.x-.55,L.y*.6-.35);
  float refl=exp(-(d1.x*d1.x*14.+d1.y*d1.y*60.))+.6*exp(-(d2.x*d2.x*10.+d2.y*d2.y*45.));
  float band=p.x*.5+p.y-sin(uT*.11)*.9;
  float sheen=exp(-band*band*5.);
  col+=mix(uPal[2],vec3(1),.6)*(refl*.42+sheen*.12);
  return col; }
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 c=metallic(p);
  float v=1.-.35*dot(p*vec2(.6,.9),p*vec2(.6,.9));
  c*=v; c=c*(1.+c*.08)/(1.+c*.55); c*=1.32; // soft shoulder so pale palettes don't blow out
  gl_FragColor=vec4(c,1.);
}`;

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export async function createPour(canvas: HTMLCanvasElement, opts: { still?: boolean } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!opts.still, powerPreference: 'high-performance' });
  if (!gl || !gl.getExtension('OES_standard_derivatives')) return null;
  // compile without blocking the main thread where the browser allows it (KHR_parallel_shader_compile)
  const par = gl.getExtension('KHR_parallel_shader_compile');
  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  const ready = new Promise<boolean>((res) => {
    const check = () => {
      if (par && !gl.getProgramParameter(pr, 0x91b1 /* COMPLETION_STATUS_KHR */)) { setTimeout(check, 50); return; }
      res(!!gl.getProgramParameter(pr, gl.LINK_STATUS));
    };
    check();
  });
  if (!(await ready)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(pr, n);
  const u = { res: U('uRes'), t: U('uT'), pal: U('uPal'), light: U('uLight'), stir: U('uStir'), k: U('uK') };

  const stirs = new Float32Array(N * 4), ks = new Float32Array(N), kt = new Float32Array(N);
  let pal = PALETTES[0].pal.map(rgb).flat(), palTo = pal.slice();
  let light = [0.45, 0.55], t = 0, last = 0, raf = 0, running = false, dpr = Math.min(devicePixelRatio || 1, 2) > 1.5 ? 1.5 : Math.min(devicePixelRatio || 1, 2);
  const userLight: { x: number; y: number; at: number } = { x: 0, y: 0, at: -1e9 };
  let slow = 0, frames = 0;

  const size = () => {
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  };
  const draw = () => {
    size();
    for (let i = 0; i < pal.length; i++) pal[i] += (palTo[i] - pal[i]) * 0.12;
    const idle = [Math.cos(t * 0.21) * 0.6, 0.35 + Math.sin(t * 0.17) * 0.45];
    const w = Math.min(1, Math.max(0, 1 - (t - userLight.at - 1.5) / 2)); // drift back to idle after 1.5s
    light = [idle[0] + (userLight.x - idle[0]) * w, idle[1] + (userLight.y - idle[1]) * w];
    gl.uniform2f(u.res, canvas.width, canvas.height); gl.uniform1f(u.t, t);
    gl.uniform3fv(u.pal, pal); gl.uniform2f(u.light, light[0], light[1]);
    gl.uniform4fv(u.stir, stirs); gl.uniform1fv(u.k, ks);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; t += dt;
    for (let i = 0; i < N; i++) { kt[i] *= Math.exp(-dt / 2.6); ks[i] += (kt[i] - ks[i]) * Math.min(1, dt * 14); } // self-levelling
    draw();
    // adaptive quality: if frames run slow, drop the render scale (never above 2)
    if (++frames > 20) { slow = dt > 0.024 ? slow + 1 : Math.max(0, slow - 1); if (slow > 25 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); slow = 0; } }
    raf = requestAnimationFrame(tick);
  };
  const toP = (cx: number, cy: number) => { const r = canvas.getBoundingClientRect(); return [(cx - r.left - r.width / 2) / r.height, -(cy - r.top - r.height / 2) / r.height]; };
  let lastStir: number[] | null = null;

  return {
    start() { if (running || opts.still) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); },
    stop() { running = false; cancelAnimationFrame(raf); },
    frame() { draw(); },
    get running() { return running; },
    setPalette(i: number) { palTo = PALETTES[i].pal.map(rgb).flat(); if (!running) { pal = palTo.slice(); draw(); } },
    drag(cx: number, cy: number, down: boolean) {
      const p = toP(cx, cy); userLight.x = p[0] * 2; userLight.y = p[1] * 2; userLight.at = t;
      if (!down) { lastStir = null; return; }
      if (!lastStir) { lastStir = p; return; }
      const dx = p[0] - lastStir[0], dy = p[1] - lastStir[1], d = Math.hypot(dx, dy);
      if (d < 0.05) return;
      let j = 0; for (let i = 1; i < N; i++) if (kt[i] < kt[j]) j = i; // reuse the most-levelled stir
      stirs.set([p[0], p[1], dx / d, dy / d], j * 4); ks[j] = 0; kt[j] = Math.min(0.75, 0.35 + d * 3);
      lastStir = p;
    },
    destroy() { this.stop(); gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}
export type Pour = NonNullable<Awaited<ReturnType<typeof createPour>>>;
