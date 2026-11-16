import { useEffect, useRef } from 'react';

// "Every pour is different": a marbled resin surface (gold, pearl white, deep resin blue on onyx)
// that swirls under a finger or cursor. Each drag drops twist points that bend the pigment around
// them and slowly relax, so no two visits leave the same pattern. Phones get a short auto-swirl
// until they touch it. Only renders while on screen; reduced motion = still frame, still draggable.
const N = 24;
const VERT = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 v;uniform vec2 R;uniform float T;uniform vec4 S[${N}];uniform vec4 D[${N}];
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
  float asp=R.x/R.y;
  vec2 p=vec2(v.x*asp,1.-v.y);
  // pigment is pushed around by every twist point the visitor left behind
  for(int i=0;i<${N};i++){
    vec4 s=S[i];if(s.z==0.)continue;
    vec2 c=vec2(s.x*asp,s.y);vec2 q=p-c;float d2=dot(q,q);
    float w=exp(-d2/(s.w*s.w));
    float ang=s.z*w;float cs=cos(ang),sn=sin(ang);
    p=c+mat2(cs,-sn,sn,cs)*q;
    p-=D[i].xy*w*.6;
  }
  vec2 w=p*3.+vec2(T*.012,-T*.008);
  vec2 q=vec2(fb(w),fb(w+vec2(5.2,1.3)));
  vec2 r=vec2(fb(w+3.*q+vec2(1.7,9.2)+T*.02),fb(w+3.*q+vec2(8.3,2.8)));
  float f=fb(w+2.6*r);
  float band=sin((p.x*1.4+p.y*.6)*13.+f*11.);
  float pearl=smoothstep(.38,.6,band);
  float edge=smoothstep(.07,.0,abs(band-.4))*smoothstep(.3,.6,f);
  float vein=smoothstep(.08,.0,abs(sin((p.y*1.1-p.x*.4)*9.+f*14.+r.x*4.)))*smoothstep(.3,.65,f);
  float blue=smoothstep(.55,.85,r.y)*(1.-pearl*.6);
  vec3 onyx=vec3(.035,.04,.05);
  vec3 col=onyx;
  col=mix(col,vec3(.09,.25,.44)+vec3(.05,.15,.22)*r.x,blue*.9);
  col=mix(col,vec3(.93,.91,.87)*(.82+.18*f),pearl*.85);
  col=mix(col,vec3(.95,.76,.42)*(.95+.4*q.x),max(vein,edge*.9));
  // gold leaf: sparse torn flecks, denser along the veins, that glint as the light moves
  vec2 lp=p*vec2(34.,30.)+r*3.;
  float leaf=smoothstep(.78,.86,n(lp))*smoothstep(.55,.9,n(lp*.31+7.))*(.35+.65*max(vein,smoothstep(.25,.7,f)));
  col=mix(col,vec3(1.,.83,.47)*(1.05+.35*sin(T*.9+lp.x*.3)),clamp(leaf*1.4,0.,1.));
  // glossy top coat: a soft moving highlight and a little depth at the edges
  float g=pow(max(0.,1.-length((vec2(v.x,1.-v.y)-vec2(.68,.28))*vec2(1.2,2.1))),3.);
  col+=g*.16*(.8+.2*sin(T*.4));
  col*=.78+.22*smoothstep(1.25,.25,length(vec2(v.x,1.-v.y)-.5)*1.6);
  gl_FragColor=vec4(col,1.);
}`;

export default function Marble({ className, onTouched }: { className?: string; onTouched?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { cv.parentElement?.classList.add('no-gl'); return; }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.parentElement?.classList.add('no-gl'); return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T'), uS = gl.getUniformLocation(pr, 'S'), uD = gl.getUniformLocation(pr, 'D');
    const S = new Float32Array(N * 4), D = new Float32Array(N * 4);
    let head = 0;
    const add = (x: number, y: number, dx: number, dy: number) => {
      const sp = Math.min(1, Math.hypot(dx, dy) * 18);
      const i = head * 4; head = (head + 1) % N;
      // twist direction follows the drag: crossing left-to-right turns one way, right-to-left the other
      S[i] = x; S[i + 1] = y; S[i + 2] = (dx >= 0 ? 1 : -1) * (0.35 + sp * 0.75); S[i + 3] = 0.1 + sp * 0.06;
      D[i] = dx * 1.6; D[i + 1] = -dy * 1.6;
    };
    const size = () => { const r = cv.getBoundingClientRect(); const d = Math.min(devicePixelRatio, 1.5);
      cv.width = Math.max(2, Math.round(r.width * d)); cv.height = Math.max(2, Math.round(r.height * d)); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uR, cv.width, cv.height); };
    const t0 = performance.now();
    const draw = (now: number) => { gl.uniform1f(uT, reduce ? 4 : (now - t0) / 1000); gl.uniform4fv(uS, S); gl.uniform4fv(uD, D); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    size(); draw(t0); cv.classList.add('on');

    let raf = 0, vis = false, touched = false, demoT = 0, last: [number, number] | null = null;
    const loop = (now: number) => {
      // twists relax slowly towards the resting pattern (~8s)
      for (let i = 0; i < N; i++) { S[i * 4 + 2] *= 0.994; D[i * 4] *= 0.994; D[i * 4 + 1] *= 0.994; if (Math.abs(S[i * 4 + 2]) < 0.02) S[i * 4 + 2] = 0; }
      if (!touched && !reduce) {
        // auto-swirl: a lazy figure-of-eight every 7s until someone touches it
        const k = ((now - demoT) % 7000) / 2400;
        if (k < 1) {
          const a = k * Math.PI * 2; const x = 0.5 + Math.sin(a) * 0.28, y = 0.5 + Math.sin(a * 2) * 0.16;
          // one twist per ~0.04 of travel, not per frame, so the swirl stays soft instead of winding into a spiral
          if (!last) last = [x, y];
          else if (Math.hypot(x - last[0], y - last[1]) > 0.04) { add(x, y, x - last[0], y - last[1]); last = [x, y]; }
        } else last = null;
      }
      draw(now);
      if (vis && !reduce) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (vis && !reduce) { if (!demoT) demoT = performance.now() - 600; raf = requestAnimationFrame(loop); }
    }, { threshold: 0.15 });
    io.observe(cv);
    const ro = new ResizeObserver(() => { size(); draw(performance.now()); }); ro.observe(cv);

    let prev: [number, number] | null = null;
    const pt = (e: PointerEvent): [number, number] => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    const down = (e: PointerEvent) => { prev = pt(e); if (!touched) { touched = true; onTouched?.(); } if (e.pointerType === 'mouse') return; cv.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      const p = pt(e);
      // mouse swirls on hover; touch swirls while the finger is down
      if (e.pointerType !== 'mouse' && e.buttons === 0) return;
      if (e.pointerType === 'mouse' && !touched) { touched = true; onTouched?.(); }
      if (prev) { const dx = p[0] - prev[0], dy = p[1] - prev[1]; if (Math.hypot(dx, dy) > 0.03) { add(p[0], p[1], dx, dy); prev = p; if (reduce) draw(performance.now()); } }
      else prev = p;
    };
    const up = () => { prev = null; };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointerleave', up);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointerleave', up); };
  }, []);

  return <canvas ref={ref} className={className} aria-label="A marbled resin surface in gold, pearl and blue. Drag across it to swirl the pigment." role="img" />;
}
