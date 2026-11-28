import { useEffect, useRef } from 'react';

// Hero object: a glossy pearl, grey and gold marble resin sphere, lit by one key light from the top-left,
// turning once every ~20s. Drawn in a fragment shader (3D noise on the sphere, so no seam as it turns).
// The poster PNG is this same shader at angle 0 (scripts/sphere-poster.mjs), shown until the canvas has drawn.
// shortcut: procedural stand-in for a Higgsfield photoreal cutout (account had 0 credits), swap the poster + drop the canvas when one exists.
const VERT = `attribute vec2 a;varying vec2 v;void main(){v=a;gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 v;uniform float A;uniform float PX;
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.02+vec3(1.7,9.2,3.1);a*=.5;}return s;}
void main(){
  float r2=dot(v,v);
  float edge=smoothstep(1.,1.-PX*2.,sqrt(r2));
  if(edge<=0.){gl_FragColor=vec4(0.);return;}
  vec3 N=vec3(v,sqrt(max(0.,1.-r2)));
  // object space: slight forward tilt, then the slow turn about the vertical axis
  float ct=cos(.32),st=sin(.32),ca=cos(A),sa=sin(A);
  vec3 p=vec3(N.x,N.y*ct-N.z*st,N.y*st+N.z*ct);
  p=vec3(p.x*ca+p.z*sa,p.y,-p.x*sa+p.z*ca);
  vec3 w=p*1.35;
  // domain-warped noise, then ridges of it become the veins (no regular stripes)
  vec3 q=vec3(fb(w),fb(w+vec3(5.2,1.3,2.8)),fb(w+vec3(2.1,7.7,4.4)));
  vec3 r=vec3(fb(w+3.*q+vec3(1.7,9.2,.3)),fb(w+3.*q+vec3(8.3,2.8,6.1)),0.);
  float f=fb(w+2.2*r.xyx);
  float cloud=smoothstep(.35,.75,fb(w*.8+r.yxy*1.5));
  float rg=1.-abs(2.*f-1.);
  float grey=pow(rg,26.);
  float hair=pow(1.-abs(2.*fb(w*2.3+q*2.)-1.),60.)*.45;
  float g2=fb(w*1.1+vec3(11.,3.,7.)+2.6*r.yxy);
  float gold=smoothstep(.955,.99,1.-abs(2.*g2-1.));
  float blue=smoothstep(.56,.78,q.z)*(1.-grey);
  vec3 alb=vec3(.94,.93,.905);
  alb=mix(alb,vec3(.72,.73,.74),cloud*.45);
  alb=mix(alb,vec3(.14,.38,.6),blue*.5);
  alb=mix(alb,vec3(.22,.23,.25),clamp(grey+hair,0.,1.)*.9);
  alb=mix(alb,vec3(.80,.66,.40),gold*.9);
  // one key light, top-left and a little in front; soft wrap for the depth of the resin
  vec3 L=normalize(vec3(-.62,.68,.55));
  float d=max(0.,(dot(N,L)+.25)/1.25);
  vec3 col=alb*(.03+.97*pow(d,1.7));
  // floor bounce from below, very faint and cool
  col+=alb*vec3(.05,.06,.08)*max(0.,-N.y);
  vec3 H=normalize(L+vec3(0,0,1));
  float nh=max(0.,dot(N,H));
  float metal=gold;
  col+=mix(vec3(1.),vec3(1.,.8,.45),metal)*(pow(nh,900.)*1.3+pow(nh,60.)*.18+pow(nh,24.)*.7*metal);
  // the softbox the key light comes from, reflected in the clear top coat
  vec3 R=reflect(vec3(0,0,-1),N);
  float box=smoothstep(.1,.085,abs(R.x+.52))*smoothstep(.07,.055,abs(R.y-.6))*step(0.,R.z);
  col+=box*.22;
  // clear coat at grazing angles reflects the dark room, so the rim falls away
  float fr=pow(1.-N.z,3.);
  col=mix(col,vec3(.02,.025,.03),fr*.55);
  gl_FragColor=vec4(col*edge,edge);
}`;

export default function Sphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    if (!gl) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mk = (t: number, s: string) => { const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uA = gl.getUniformLocation(pr, 'A'), uPX = gl.getUniformLocation(pr, 'PX');
    const size = () => {
      const w = cv.getBoundingClientRect().width; const s = Math.max(2, Math.round(w * Math.min(devicePixelRatio, 1.75)));
      cv.width = cv.height = s; gl.viewport(0, 0, s, s); gl.uniform1f(uPX, 2 / s);
    };
    let ang = 0;
    const draw = (a: number) => { gl.uniform1f(uA, a); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    size(); draw(0); cv.classList.add('on');
    const ro = new ResizeObserver(() => { size(); draw(ang); }); ro.observe(cv);
    if (reduce) return () => ro.disconnect();

    // one turn per 20s; 30fps is plenty for a turn this slow, and it only runs while the hero is on screen
    let raf = 0, prev = 0, vis = true;
    const loop = (now: number) => {
      if (!prev) prev = now;
      if (now - prev >= 33) { ang += ((now - prev) / 20000) * Math.PI * 2; prev = now; draw(ang); }
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting; cancelAnimationFrame(raf); prev = 0;
      if (vis) raf = requestAnimationFrame(loop);
    });
    io.observe(cv);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, []);

  return (
    <div className="orb" aria-hidden="true">
      <i className="orb-shadow" />
      <img className="orb-poster" src="/posters/sphere-v1.webp" alt="" width={720} height={720} decoding="async" />
      <canvas ref={ref} className="orb-gl" />
    </div>
  );
}
