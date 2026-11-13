import { useEffect, useRef } from 'react';

// "Burnish it yourself": matte lime plaster that polishes to a marble sheen wherever the trowel goes.
// New shader (not KT's microcement trowel). Mask-canvas pattern: a small 2D canvas records where the
// wall has been burnished (auto sweeps, R) and where the visitor is polishing right now (user, decays).
// mode 'hero'  : auto-burnishes the whole wall in ~2.6s, then the cursor / thumb adds a mirror pass.
// mode 'game'  : 404 page. No auto. Visitor polishes; onCover(fraction) reports coverage.
type Props = {
  mode?: 'hero' | 'game';
  start?: boolean;
  onCover?: (f: number) => void;
  className?: string;
  label?: string;
  still?: 0 | 1; // capture posters: 0 = raw lime, 1 = fully burnished
};

const VERT = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 v;
uniform vec2 R;uniform float T;uniform sampler2D M;uniform sampler2D U;uniform vec2 L;uniform float D;uniform float S;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}
void main(){
  vec2 uv=vec2(v.x,1.-v.y);
  float asp=R.x/R.y;vec2 p=vec2(uv.x*asp,uv.y)*S;
  float m=texture2D(M,uv).r;float u=texture2D(U,uv).r;
  float cl=fb(p*2.1);
  float st=fb(vec2(p.x*1.1+p.y*.7,p.y*6.5-p.x*1.9));
  float gr=h(floor(gl_FragCoord.xy/D));
  // matte, chalky raw lime: bright, dry, trowel-marked
  vec3 lime=mix(vec3(.858,.838,.792),vec3(.932,.915,.874),cl);
  lime*=.95+.075*st;
  lime+=(gr-.5)*.05;
  // burnished marble: warmer, deeper, clouded, with fine veins
  vec2 q=p*1.35;vec2 w=vec2(fb(q),fb(q+vec2(5.2,1.3)));
  float vv=fb(q+2.4*w);
  float vein=1.-smoothstep(.0,.011,abs(vv-.52));
  float vein2=1.-smoothstep(.0,.05,abs(fb(q*2.3+w*1.7)-.5));
  vec3 pol=mix(vec3(.60,.58,.545),vec3(.87,.85,.81),smoothstep(.22,.78,vv*.7+cl*.45));
  pol=mix(pol,vec3(.47,.455,.43),vein*.6+vein2*.12);
  pol+= (cl-.5)*.05;
  // pseudo normal from the cloud field for a glossy, slightly undulating surface
  float e=.012;
  float gx=fb((p+vec2(e,0))*2.1)-fb((p-vec2(e,0))*2.1);
  float gy=fb((p+vec2(0,e))*2.1)-fb((p-vec2(0,e))*2.1);
  vec3 N=normalize(vec3(-gx*2.4,-gy*2.4,1.));
  // light sliding across the polished wall + the trowel's own light
  float ph=fract(T*.055)*2.6-.8;
  float band=exp(-pow((uv.x*.75+uv.y*.45-ph+N.x*.25)*3.2,2.));
  vec2 lp=vec2(L.x*asp,L.y)*S;
  float spot=exp(-dot(p-lp,p-lp)*3.2);
  float fres=.08+.12*(1.-uv.y);
  float k=smoothstep(.04,.96,m);
  float gloss=k*(fres+.42*band+.28*spot)*(.75+.5*N.y)+u*(.25+.55*band+.6*spot);
  vec3 col=mix(lime,pol,k);
  col+=gloss*vec3(1.,.985,.95)*.46;
  col-=m*(1.-m)*.16;      // compressed edge where the trowel has just passed
  col=mix(col,col*vec3(.985,.99,.97),u*.3);
  // soft vignette
  vec2 c=uv-.5;col*=1.-dot(c,c)*.22;
  gl_FragColor=vec4(col,1.);
}`;

export default function Burnish({ mode = 'hero', start = true, onCover, className, label, still }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) { cv.dataset.fail = '1'; cv.parentElement?.classList.add('no-gl'); return; }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.parentElement?.classList.add('no-gl'); return; }
    gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T'), uL = gl.getUniformLocation(pr, 'L');
    const uD = gl.getUniformLocation(pr, 'D'), uS = gl.getUniformLocation(pr, 'S');
    gl.uniform1i(gl.getUniformLocation(pr, 'M'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'U'), 1);

    // mask canvases
    const MW = 256;
    const mkMask = () => { const c = document.createElement('canvas'); c.width = MW; c.height = MW; const x = c.getContext('2d', { willReadFrequently: mode === 'game' })!; x.fillStyle = '#000'; x.fillRect(0, 0, MW, MW); return { c, x }; };
    const M = mkMask(), Uc = mkMask();
    const mkTex = (unit: number) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
    const tM = mkTex(0), tU = mkTex(1);
    const upload = (unit: number, t: WebGLTexture | null, c: HTMLCanvasElement) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); };

    let W = 0, H = 0, asp = 1;
    const dprMax = coarse ? 1.25 : 1.5;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      const d = Math.min(devicePixelRatio || 1, dprMax) * (coarse ? 0.8 : 0.9);
      W = Math.max(2, Math.round(r.width * d)); H = Math.max(2, Math.round(r.height * d)); asp = r.width / Math.max(1, r.height);
      cv.width = W; cv.height = H; gl.viewport(0, 0, W, H);
      gl.uniform2f(uR, W, H); gl.uniform1f(uD, Math.max(1, d)); gl.uniform1f(uS, r.width < 700 ? 1.35 : 1);
    };
    resize();

    // a trowel stroke: an elongated soft blade laid along the direction of travel
    const blade = (x: { x: CanvasRenderingContext2D }, px: number, py: number, ang: number, size: number, a: number) => {
      const c = x.x; c.save(); c.translate(px * MW, py * MW); c.rotate(ang + Math.PI / 2); c.scale(1, 0.42);
      const r = size * MW; const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.55, `rgba(255,255,255,${a * 0.75})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); c.restore();
    };

    // auto path: sweeping trowel arcs, top to bottom, alternating direction
    const sweeps = 6, dur = 2600;
    const autoAt = (t: number) => {
      const s = Math.min(sweeps - 1e-4, t * sweeps); const i = Math.floor(s), f = s - i;
      const dir = i % 2 ? -1 : 1; const ef = f * f * (3 - 2 * f);
      const x = dir > 0 ? -0.12 + ef * 1.24 : 1.12 - ef * 1.24;
      const y = (i + 0.5) / sweeps + Math.sin(ef * Math.PI) * 0.07 * dir;
      return { x, y, dir };
    };
    let lastAuto: { x: number; y: number } | null = null;
    let autoT0 = -1, autoDone = mode !== 'hero';
    const light = { x: 0.62, y: 0.38, tx: 0.62, ty: 0.38 };

    if ((reduce && mode === 'hero') || still === 1) { M.x.fillStyle = '#fff'; M.x.fillRect(0, 0, MW, MW); autoDone = true; }
    if (still === 0) autoDone = true;
    upload(0, tM, M.c); upload(1, tU, Uc.c);

    // pointer = trowel
    let last: { x: number; y: number } | null = null;
    const toUv = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; };
    const move = (e: PointerEvent) => {
      const p = toUv(e); light.tx = p.x; light.ty = p.y;
      if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch') {
        if (last) {
          const dx = p.x - last.x, dy = p.y - last.y; const dist = Math.hypot(dx * asp, dy);
          const steps = Math.min(24, Math.ceil(dist / 0.012)); const ang = Math.atan2(dy, dx * asp);
          const target = mode === 'game' ? M : Uc;
          for (let k = 1; k <= steps; k++) blade(target, last.x + dx * (k / steps), last.y + dy * (k / steps), ang, mode === 'game' ? 0.16 : 0.13, mode === 'game' ? 0.5 : 0.35);
          dirtyU = true; if (mode === 'game') dirtyM = true;
        }
        last = p;
      }
    };
    const leave = () => { last = null; };
    const host = cv.parentElement!;
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerdown', (e) => { last = toUv(e); }, { passive: true });
    host.addEventListener('pointerleave', leave); host.addEventListener('pointerup', leave); host.addEventListener('pointercancel', leave);

    let dirtyM = true, dirtyU = true, raf = 0, visible = true, t0 = performance.now(), lastCover = 0;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }, { threshold: 0 });
    io.observe(cv);
    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(cv);

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      const t = still !== undefined ? 7.5 : (now - t0) / 1000;
      if (!autoDone && startRef.current) {
        if (autoT0 < 0) autoT0 = now;
        const k = Math.min(1, (now - autoT0) / dur);
        const p = autoAt(k);
        if (lastAuto) {
          const dx = p.x - lastAuto.x, dy = p.y - lastAuto.y; const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 0.01));
          const ang = Math.atan2(dy, dx * asp);
          for (let s = 1; s <= steps; s++) blade(M, lastAuto.x + dx * s / steps, lastAuto.y + dy * s / steps, ang, 0.2, 0.55);
        }
        lastAuto = p; light.tx = Math.min(1, Math.max(0, p.x)); light.ty = p.y;
        if (k >= 0.6 && lastCover < 0.6) { lastCover = 0.6; onCover?.(0.6); cv.dispatchEvent(new CustomEvent('cover', { bubbles: true, detail: 0.6 })); }
        if (k >= 1) {
          // finish: flood the last gaps so the wall is fully polished (never left half done)
          M.x.globalAlpha = 1; M.x.fillStyle = 'rgba(255,255,255,.22)';
          let n = 0; const flood = () => { M.x.fillRect(0, 0, MW, MW); dirtyM = true; if (++n < 10) requestAnimationFrame(flood); };
          flood(); autoDone = true; onCover?.(1); cv.dispatchEvent(new CustomEvent('cover', { bubbles: true, detail: 1 }));
        }
        dirtyM = true;
      }
      // user polish relaxes back slowly
      if (mode === 'hero') { Uc.x.fillStyle = 'rgba(0,0,0,.025)'; Uc.x.fillRect(0, 0, MW, MW); dirtyU = true; }
      if (dirtyM) { upload(0, tM, M.c); dirtyM = false; }
      if (dirtyU) { upload(1, tU, Uc.c); dirtyU = false; }
      light.x += (light.tx - light.x) * 0.08; light.y += (light.ty - light.y) * 0.08;
      gl!.uniform1f(uT, t); gl!.uniform2f(uL, light.x, light.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (mode === 'game' && onCover && Math.floor(t * 4) !== Math.floor((t - 0.02) * 4)) {
        const d = M.x.getImageData(0, 0, MW, MW).data; let on = 0; for (let i = 0; i < d.length; i += 64) if (d[i] > 140) on++;
        onCover(on / (d.length / 64));
      }
      if ((reduce && mode === 'hero') || still !== undefined) { (window as any).__still = 1; return; } // one still frame
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const vis = () => { if (!document.hidden && !raf) raf = requestAnimationFrame(frame); };
    document.addEventListener('visibilitychange', vis);
    requestAnimationFrame(() => cv.classList.add('on'));
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', vis); host.removeEventListener('pointermove', move); };
  }, [mode]);

  return <canvas ref={ref} className={className} aria-label={label} role={label ? 'img' : undefined} />;
}
