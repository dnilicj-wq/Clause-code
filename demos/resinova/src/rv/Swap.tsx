import { useEffect, useRef } from 'react';

// Liquid wipe between two finish images: the new surface "pours" in from a point, its front
// rippled by noise like resin finding its level, with a thin gold-lit meniscus at the edge.
// No WebGL / reduced motion: plain crossfade (parent shows the <img>).
const VERT = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 v;uniform sampler2D A;uniform sampler2D B;uniform float P;uniform vec2 O;uniform vec2 R;uniform float T;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fb(vec2 p){return n(p)*.55+n(p*2.1)*.3+n(p*4.3)*.15;}
void main(){
  vec2 uv=vec2(v.x,1.-v.y);
  vec2 q=(uv-O)*vec2(R.x/R.y,1.);
  float d=length(q)+ (fb(uv*5.+T*.15)-.5)*.32;
  float front=P*1.9-.05;
  float m=smoothstep(front,front-.06,d);
  // the moving edge bends what's under it a little, like a lens of wet resin
  float edge=smoothstep(.09,0.,abs(d-front))*(1.-step(.999,P));
  vec2 off=normalize(q+1e-4)*edge*.012;
  vec3 a=texture2D(A,uv+off).rgb;vec3 b=texture2D(B,uv-off*.5).rgb;
  vec3 c=mix(a,b,m);
  c+=edge*vec3(.95,.78,.45)*.35;
  gl_FragColor=vec4(c,1.);
}`;

type Props = { src: string; className?: string; label: string };

export default function Swap({ src, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ go: (s: string, ox: number, oy: number) => void } | null>(null);
  const last = useRef(src);
  const origin = useRef<[number, number]>([0.5, 0.6]);

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl || matchMedia('(prefers-reduced-motion: reduce)').matches) { cv.parentElement?.classList.add('no-gl'); return; }
    const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.parentElement?.classList.add('no-gl'); return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k: string) => gl.getUniformLocation(pr, k);
    const tex = () => { const t = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
    const tA = tex(), tB = tex();
    gl.uniform1i(U('A'), 0); gl.uniform1i(U('B'), 1);
    const load = (s: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = s; });
    const put = (t: WebGLTexture, i: HTMLImageElement) => { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i); };
    const size = () => { const r = cv.getBoundingClientRect(); const d = Math.min(devicePixelRatio, 2);
      cv.width = Math.max(2, Math.round(r.width * d)); cv.height = Math.max(2, Math.round(r.height * d)); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('R'), cv.width, cv.height); };
    const draw = (p: number, t: number) => {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tA); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tB);
      gl.uniform1f(U('P'), p); gl.uniform1f(U('T'), t); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    let raf = 0, alive = true, busy: Promise<void> = Promise.resolve();
    size();
    const ro = new ResizeObserver(() => { size(); draw(1, 0); }); ro.observe(cv);
    load(src).then((i) => { if (!alive) return; put(tA, i); put(tB, i); draw(1, 0); cv.classList.add('on'); }).catch(() => cv.parentElement?.classList.add('no-gl'));

    api.current = {
      go: (s, ox, oy) => {
        busy = busy.then(() => load(s)).then((i) => new Promise<void>((done) => {
          if (!alive) return done();
          put(tB, i); gl.uniform2f(U('O'), ox, oy);
          const t0 = performance.now(); const D = 900;
          cancelAnimationFrame(raf);
          const step = (now: number) => {
            const k = Math.min(1, (now - t0) / D); const e = 1 - Math.pow(1 - k, 3);
            draw(e, now / 1000);
            // once the wipe lands, the new image becomes the base too, so every later redraw shows it
            if (k < 1) raf = requestAnimationFrame(step); else { put(tA, i); draw(1, 0); done(); }
          };
          raf = requestAnimationFrame(step);
        })).catch(() => {});
      },
    };
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); api.current = null; };
  }, []);

  useEffect(() => {
    if (src === last.current) return;
    last.current = src;
    const [x, y] = origin.current;
    api.current?.go(src, x, y);
  }, [src]);

  // the pour starts wherever the visitor last pointed on the stage (centre-low by default)
  const onPointer = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    origin.current = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };

  return (
    <div className={className} onPointerDown={onPointer} onPointerMove={onPointer}>
      <img className="swap-img" src={src} alt={label} width={1024} height={1024} loading="lazy" decoding="async" />
      <canvas ref={ref} className="swap-gl" aria-hidden="true" />
    </div>
  );
}
