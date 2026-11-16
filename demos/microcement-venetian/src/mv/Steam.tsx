import { useEffect, useRef } from 'react';

// "Wipe the steam": James's real bathroom photo behind a steamed-up mirror.
// Mask-canvas pattern (same idea as the KT / Lime & Marble heroes, new look): a small 2D canvas records
// where the glass has been wiped; the shader fogs everything else, beads condensation in the fog and runs
// drips down from the bottom edge of every wipe. Fog slowly creeps back, but never past `floor` once revealed.
// mode 'hero': auto-wipes one slow arc (~2.2s) then hands over to cursor / thumb.
// mode 'game': 404. No auto; onCover(fraction) reports how much is clear.
type Props = { src: string; mode?: 'hero' | 'game'; start?: boolean; onCover?: (f: number) => void; className?: string; label?: string; still?: 0 | 1; dim?: number };

const VERT = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 v;
uniform vec2 R;uniform float T;uniform sampler2D P;uniform sampler2D B;uniform sampler2D M;uniform vec2 C;uniform float F;uniform float DIM;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
void main(){
  vec2 uv=vec2(v.x,1.-v.y);
  vec2 iu=(uv-.5)*C+vec2(.5,.5);            // cover-fit into the photo
  float m=texture2D(M,uv).r;
  float clear=max(m,F);
  // condensation beads: a jittered grid of tiny lenses, only in the fog
  float asp=R.x/R.y;vec2 g=vec2(uv.x*asp,uv.y)*vec2(42.,42.);vec2 id=floor(g);vec2 f=fract(g)-.5;
  vec2 o=vec2(h(id),h(id+3.1))-.5;float r=.12+.22*h(id+7.7);
  float d=length(f-o*.55);float bead=smoothstep(r,r-.08,d)*step(.35,h(id+1.3));
  // drips: under a wiped edge, a thin clear rivulet runs down with a bead at its head
  float col=floor(uv.x*90.);float cx=(col+.5)/90.;float ch=h(vec2(col,4.2));
  float above=texture2D(M,vec2(cx,uv.y-.06)).r;
  float near=smoothstep(.45,.75,above)*(1.-m);
  float line=smoothstep(.0016,.0,abs(uv.x-cx-.002*sin(uv.y*40.+ch*9.)))*step(.78,ch)*.7;
  float drip=near*line*(.35+.65*step(.3,fract(uv.y*2.5-T*(.12+.1*ch)+ch)));
  float clearAll=clamp(clear+drip*.85,0.,1.);
  vec3 sharp=texture2D(P,iu).rgb;
  vec3 soft=texture2D(B,iu).rgb;
  // steam: blurred photo, lifted towards a cool mist, with soft drifting density
  float den=.75+.25*n(uv*3.+vec2(T*.03,-T*.02));
  vec3 mist=mix(soft,vec3(.86,.88,.89),.62*den);
  mist+=bead*.06*(1.-clear);
  vec3 col3=mix(mist,sharp,smoothstep(.05,.95,clearAll));
  // a wet sheen on the freshly wiped glass + a dark rim where water gathered
  col3+=(m*(1.-m))*.10;
  // headline scrim, always there so the words stay readable
  col3*=1.-DIM*smoothstep(.22,.9,uv.y)*.84;
  col3*=1.-DIM*smoothstep(.75,0.,uv.x)*(R.x>R.y?.38:.12);
  gl_FragColor=vec4(col3,1.);
}`;

export default function Steam({ src, mode = 'hero', start = true, onCover, className, label, still, dim = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    const host = cv.parentElement!;
    if (!gl) { host.classList.add('no-gl'); return; }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { host.classList.add('no-gl'); return; }
    gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    const U = (k: string) => gl.getUniformLocation(pr, k);
    const uR = U('R'), uT = U('T'), uC = U('C'), uF = U('F');
    gl.uniform1i(U('P'), 0); gl.uniform1i(U('B'), 1); gl.uniform1i(U('M'), 2); gl.uniform1f(U('DIM'), dim);

    const tex = (unit: number) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([200, 200, 200, 255])); return t; };
    const tP = tex(0), tB = tex(1), tM = tex(2);
    const up = (unit: number, t: WebGLTexture | null, s: TexImageSource) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s); };

    const MW = 192;
    const mc = document.createElement('canvas'); mc.width = mc.height = MW;
    const mx = mc.getContext('2d', { willReadFrequently: mode === 'game' })!;
    mx.fillStyle = '#000'; mx.fillRect(0, 0, MW, MW);

    let imgAsp = 0.75, W = 0, H = 0, asp = 1, ready = false;
    const fit = () => { // cover: scale uv so the photo fills the canvas
      const s = asp > imgAsp ? [1, imgAsp / asp] : [asp / imgAsp, 1];
      gl.uniform2f(uC, s[0], s[1]);
    };
    const img = new Image(); img.decoding = 'async'; img.src = src;
    img.decode().then(() => {
      imgAsp = img.naturalWidth / img.naturalHeight;
      up(0, tP, img);
      const bc = document.createElement('canvas'); bc.width = 256; bc.height = Math.round(256 / imgAsp);
      const bx = bc.getContext('2d')!; bx.filter = 'blur(7px)'; bx.drawImage(img, -12, -12, bc.width + 24, bc.height + 24);
      up(1, tB, bc); fit(); ready = true; kick();
    }).catch(() => host.classList.add('no-gl'));

    const resize = () => {
      const r = cv.getBoundingClientRect();
      const d = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 1.5);
      W = Math.max(2, Math.round(r.width * d)); H = Math.max(2, Math.round(r.height * d)); asp = r.width / Math.max(1, r.height);
      cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); gl.uniform2f(uR, W, H); fit();
    };
    resize();

    // a cloth/finger wipe: soft round stamp, a touch wider than tall
    const stamp = (px: number, py: number, size: number, a: number) => {
      const r = size * MW; const g = mx.createRadialGradient(px * MW, py * MW, 0, px * MW, py * MW, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.6, `rgba(255,255,255,${a * 0.8})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      mx.fillStyle = g; mx.beginPath(); mx.arc(px * MW, py * MW, r, 0, Math.PI * 2); mx.fill();
    };
    const line = (a: { x: number; y: number }, b2: { x: number; y: number }, size: number, al2: number) => {
      const steps = Math.max(1, Math.ceil(Math.hypot((b2.x - a.x) * asp, b2.y - a.y) / 0.012));
      for (let k = 1; k <= steps; k++) stamp(a.x + (b2.x - a.x) * k / steps, a.y + (b2.y - a.y) * k / steps, size / Math.max(0.6, Math.min(1.6, asp)), al2);
      dirty = true;
    };

    // auto: one slow figure-of-eight-ish arc across the glass, then a second lower pass (phones get the same)
    const dur = 2300;
    const autoAt = (t: number) => {
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const a = e * Math.PI * 2.1;
      return { x: 0.5 + Math.sin(a) * 0.42, y: 0.42 + Math.sin(a * 0.5) * 0.08 + (e - 0.5) * 0.46 };
    };
    let autoT0 = -1, autoDone = mode !== 'hero', lastAuto: { x: number; y: number } | null = null, floor = 0, floorT = 0, reported = 0;
    if (still === 1 || (reduce && mode === 'hero')) { mx.fillStyle = '#fff'; mx.fillRect(0, 0, MW, MW); autoDone = true; floor = 1; floorT = 1; }
    if (still === 0) autoDone = true;
    let dirty = true;

    let last: { x: number; y: number } | null = null;
    const toUv = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
    const move = (e: PointerEvent) => {
      if (!autoDone && mode === 'hero') return; // let the first arc finish
      const p = toUv(e);
      if (last) line(last, p, mode === 'game' ? 0.12 : 0.085, 0.7);
      last = p; kick();
    };
    const end = () => { last = null; };
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerdown', (e) => { last = toUv(e); }, { passive: true });
    host.addEventListener('pointerleave', end); host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);

    let raf = 0, visible = true;
    const t0 = performance.now();
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }, { threshold: 0 });
    io.observe(cv);
    const ro = new ResizeObserver(() => { resize(); kick(); });
    ro.observe(cv);
    function kick() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden || !ready) return;
      const t = still !== undefined ? 3 : (now - t0) / 1000;
      if (!autoDone && startRef.current) {
        if (autoT0 < 0) autoT0 = now;
        const k = Math.min(1, (now - autoT0) / dur);
        const p = autoAt(k);
        if (lastAuto) line(lastAuto, p, 0.13, 0.85);
        lastAuto = p;
        if (k > 0.55 && reported < 0.5) { reported = 0.5; cv.dispatchEvent(new CustomEvent('wiped', { bubbles: true, detail: 0.5 })); }
        if (k >= 1) { autoDone = true; floorT = 0.62; }
      }
      // the photo stays readable: after the first arc the whole glass clears to half, wipes go fully clear
      floor += (floorT - floor) * 0.03;
      // fog creeps back into the wipes, slowly
      if (mode === 'hero' && autoDone && still === undefined) { mx.fillStyle = 'rgba(0,0,0,.006)'; mx.fillRect(0, 0, MW, MW); dirty = true; }
      if (dirty) { up(2, tM, mc); dirty = false; }
      gl!.uniform1f(uT, t); gl!.uniform1f(uF, floor);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (mode === 'game' && onCover && Math.floor(t * 4) !== Math.floor((t - 0.02) * 4)) {
        const d = mx.getImageData(0, 0, MW, MW).data; let on = 0; for (let i = 0; i < d.length; i += 64) if (d[i] > 120) on++;
        onCover(on / (d.length / 64));
      }
      if (still !== undefined || (reduce && mode === 'hero')) { (window as any).__still = 1; return; }
      raf = requestAnimationFrame(frame);
    }
    kick();
    const vis = () => kick();
    document.addEventListener('visibilitychange', vis);
    requestAnimationFrame(() => cv.classList.add('on'));
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', vis); host.removeEventListener('pointermove', move); };
  }, [mode, src]);

  return <canvas ref={ref} className={className} aria-label={label} role={label ? 'img' : undefined} />;
}
