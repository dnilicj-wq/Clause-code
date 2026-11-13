// Rebuilt; original source (21st.dev/@rmahammad/components/luminous-topography) not reachable for free.
// Faithful in spirit: glowing topographic contour lines over a slowly breathing height field, brightest
// where the pointer is. On an epoxy site it reads as a self-levelling surface settling flat: the contours
// relax over time and swell again. WebGL1 fragment shader, ~0.7x resolution, pauses offscreen.
import { useEffect, useRef, type ReactNode } from 'react';
import { mountFrag } from '../_shared/fragGL';
import { cssVar, toRGB } from '../_shared/loop';

const FRAG = `precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform vec3 u_bg; uniform vec3 u_line; uniform vec3 u_glow; uniform float u_density;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res; vec2 p=(gl_FragCoord.xy-.5*u_res)/min(u_res.x,u_res.y);
  float t=u_time*.06;
  float level=.55+.45*sin(u_time*.22);
  float e=fbm(p*1.6+vec2(t,-t*.7))*level+.08*fbm(p*2.4-vec2(t*.5,t));
  vec2 m=(u_mouse-.5*u_res)/min(u_res.x,u_res.y);
  float md=length(p-m); e+=.18*exp(-md*md*9.);
  float k=e*u_density; float f=fract(k);
  float d=min(f,1.-f);
  float line=smoothstep(.07,.0,d);
  float major=smoothstep(.035,.0,abs(fract(k/5.)-.5)-.465);
  float glow=exp(-md*2.4);
  vec3 col=u_bg;
  col=mix(col,u_line,line*(.22+.6*glow));
  col=mix(col,u_glow,major*(.3+.6*glow));
  col=mix(col,u_glow,.06*exp(-md*1.4));
  float vig=smoothstep(1.2,.2,length(uv-.5)*1.6);
  gl_FragColor=vec4(mix(u_bg,col,vig),1.);
}`;

export function LuminousTopography({ density = 14, children, className = '' }: { density?: number; children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const n = (v: [number, number, number]) => v.map((x) => x / 255) as [number, number, number];
    const bg = n(toRGB(cssVar(c, '--bg'))), line = n(toRGB(cssVar(c, '--accent2'))), glow = n(toRGB(cssVar(c, '--accent')));
    const mouse = { x: -1, y: -1, tx: 0, ty: 0, at: 0 };
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect(); const s = c.width / Math.max(1, r.width);
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      mouse.tx = (e.clientX - r.left) * s; mouse.ty = (r.bottom - e.clientY) * s; mouse.at = performance.now();
    };
    addEventListener('pointermove', move, { passive: true });
    const stop = mountFrag(c, FRAG, (gl, loc, t) => {
      if (performance.now() - mouse.at > 2500) { mouse.tx = c.width * (0.5 + 0.3 * Math.sin(t * 0.3)); mouse.ty = c.height * (0.5 + 0.25 * Math.cos(t * 0.37)); }
      if (mouse.x < 0) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
      mouse.x += (mouse.tx - mouse.x) * 0.08; mouse.y += (mouse.ty - mouse.y) * 0.08;
      gl.uniform2f(loc('u_mouse'), mouse.x, mouse.y);
      gl.uniform3f(loc('u_bg'), ...bg); gl.uniform3f(loc('u_line'), ...line); gl.uniform3f(loc('u_glow'), ...glow);
      gl.uniform1f(loc('u_density'), density);
    }, { scale: 0.85 });
    return () => { stop(); removeEventListener('pointermove', move); };
  }, [density]);
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} style={{ background: 'var(--bg)' }}>
      <canvas ref={ref} className="absolute inset-0 block" />
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}
