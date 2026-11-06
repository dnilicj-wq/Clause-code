// Hero: a house frontage at dusk with a tired, cracked drive. Move (desktop) or swipe (phone)
// across the drive and fresh resin-bound stone pours over it. Raw WebGL, one fragment shader.
// Strokes go into a 2D mask canvas (R = coverage, G/B = trowel direction) plus a "wet" canvas
// that fades, so fresh resin is glossy and settles to a satin finish.
// Pattern from demos/kt-construction/js/hero.js, rebuilt for a perspective driveway scene.

const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uLight;uniform float uTorch;
uniform sampler2D uMask;uniform sampler2D uWet;uniform vec2 uTexel;
uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;uniform float uDone;
uniform float uYv;uniform float uF;uniform float uW;uniform float uCamH;uniform float uFocus;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 h22(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){s+=a*vn(p);p=m*p;a*=.5;}return s;}
float fbm3(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<3;i++){s+=a*vn(p);p=m*p;a*=.5;}return s;}
vec4 vor(vec2 p,out float idh){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;vec2 off=vec2(0);vec2 id=vec2(0);
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=h22(i+g);o=.5+.42*sin(6.2831*o);vec2 r=g+o-f;float d=dot(r,r);
  if(d<d1){d2=d1;d1=d;off=r;id=i+g;}else if(d<d2){d2=d;}}
 idh=h21(id*1.37+.11);d1=sqrt(d1);d2=sqrt(d2);return vec4(d1,d2-d1,off);}
float sbox(vec2 p,vec2 a,vec2 b,float e){vec2 c=(a+b)*.5,hh=(b-a)*.5;vec2 d=abs(p-c)-hh;float k=length(max(d,0.))+min(max(d.x,d.y),0.);return 1.-smoothstep(-e,e,k);}
vec3 sky(float t){t=clamp(t,0.,1.);vec3 lo=vec3(.95,.50,.28),mid=vec3(.42,.27,.36),hi=vec3(.06,.07,.14);
 return t<.3?mix(lo,mid,t/.3):mix(mid,hi,(t-.3)/.7);}
// out-of-focus house at dusk. q in metres on the facade plane, e = blur radius (m)
vec3 facade(vec2 q,float e,float lit){
 float X=q.x,Y=q.y;
 vec3 s=sky((Y-2.)/6.);
 float roof=sbox(q,vec2(-6.,-1.),vec2(6.,5.3),e)+sbox(vec2(X,Y),vec2(-6.,5.3),vec2(6.,7.6-abs(X)*.25),e);
 float house=clamp(roof,0.,1.);
 vec3 wall=vec3(.20,.10,.07)*(.85+.3*fbm3(q*1.5));
 float rf=smoothstep(5.2,5.5,Y);wall=mix(wall,vec3(.07,.07,.09),rf);
 float hedge=sbox(q,vec2(-14.,-1.),vec2(14.,1.6+.4*fbm3(vec2(X*.8,0.))),e*1.2)*(1.-house);
 vec3 col=mix(s,wall,house);col=mix(col,vec3(.03,.05,.035),hedge);
 // porch lamp light on the wall
 vec2 L=vec2(-1.5,2.15);float dl=length(q-L);col+=vec3(1.,.62,.3)*lit*.5*exp(-dl*dl*.6)*house;
 // windows (warm) and the door fanlight
 vec3 warm=vec3(1.,.70,.38);
 float w1=sbox(q,vec2(-4.6,.85),vec2(-2.5,2.1),e);
 float w2=sbox(q,vec2(-.95,3.05),vec2(.75,4.3),e);
 float w3=sbox(q,vec2(2.,3.05),vec2(3.7,4.3),e)*uDone;
 float fan=sbox(q,vec2(-1.05,1.35),vec2(-.45,1.9),e*.8);
 float door=sbox(q,vec2(-1.2,0.),vec2(-.3,2.05),e);
 float gar=sbox(q,vec2(.55,0.),vec2(3.4,2.1),e);
 float cold=sbox(q,vec2(-4.4,3.05),vec2(-2.7,4.3),e);
 col=mix(col,vec3(.07,.08,.10),door);
 col=mix(col,vec3(.24,.24,.25)+warm*.06*lit,gar);
 col=mix(col,s*.4+vec3(.02,.03,.06),cold);
 float glow=w1*(.8+.2*vn(q*2.))+w2*.9+w3*.8+fan*.9;
 col=mix(col,warm*(.75+.45*lit),clamp(glow,0.,1.));
 // lamp itself: a bright bokeh disc
 float lamp=1.-smoothstep(.04,.04+e*1.2+.03,dl);col+=vec3(1.,.86,.62)*lamp*(1.6+lit);
 // distant street-light bokeh
 for(int i=0;i<4;i++){float fi=float(i);vec2 c=vec2(-11.+fi*7.3+h21(vec2(fi,2.))*2.,3.2+h21(vec2(fi,7.))*1.6);
  float d=length(q-c);col+=vec3(1.,.72,.42)*(1.-smoothstep(e*1.6,e*1.6+.05,d))*.32*(1.-house);}
 return col;
}

void main(){
 vec2 fc=gl_FragCoord.xy;float aspect=uRes.x/uRes.y;
 vec2 uv=fc/uRes;
 float pix=1./(uRes.y*uF);
 vec2 p=(fc/uRes.y-vec2(.5*aspect,uYv))/uF;
 float camH=uCamH;
 float wallY=-camH/uW;
 float lit=.6+.4*uDone;
 vec3 col;
 vec2 lightG=vec2((uLight.x-.5)*aspect/uF,(uLight.y-uYv)/uF);
 // depth of field: circle of confusion in screen units
 float K=.05;
 if(p.y>wallY){
  float coc=K*abs(1.-uFocus/uW);
  col=facade(vec2(p.x*uW,camH+p.y*uW),coc*uW+.02,lit);
 } else {
  float z=camH/(-p.y);float X=p.x*z;vec2 g=vec2(X,z);
  float fp=max(z*z/camH*pix,z*pix);
  float coc=.022*abs(1.-uFocus/z)*z/uF*(z<uFocus?.35:1.);
  float eff=max(fp,coc*.5);
  float drive=1.-smoothstep(-.03-eff,.03+eff,max(-3.9-X,X-4.4));
  vec4 mk=texture2D(uMask,vec2(uv.x,1.-uv.y));
  float nEdge=fbm3(fc*.01);
  float m=smoothstep(.36,.68,mk.r+(nEdge-.5)*.22)*drive;
  // ----- old surface: tired concrete, cracks, weeds, oil -----
  vec3 oldc=vec3(0.);float oldRough=1.;
  if(m<.999){
   float n=fbm(g*2.2);
   float grit=vn(g*90.)*.5+vn(g*190.)*.5;
   float det=1.-smoothstep(.002,.02,eff);
   vec3 conc=vec3(.56,.55,.52)*(.66+.5*n)*(1.+(grit-.5)*.35*det);
   float jz=abs(fract(z/2.4)-.5)*2.4;float jx=abs(fract((X+.6)/2.4)-.5)*2.4;
   float jw=.006+.012*fbm3(g*8.);float joint=1.-smoothstep(.0,.006+eff,1.2-max(jx,jz)-jw);
   float jnear=1.-smoothstep(.0,.06,1.2-max(jx,jz)-jw);
   float idc;vec4 cr=vor(g*1.6+vec2(fbm3(g*3.)*.5,fbm3(g*3.+4.)*.5),idc);
   float crackA=smoothstep(.4,.62,fbm3(g*.9+3.));
   float crack=(1.-smoothstep(.0,.012+eff*1.4,cr.y*.6))*crackA;
   float chip=smoothstep(.62,.8,fbm(g*6.))*.6;
   float near=max(crack,joint);
   float weedZ=smoothstep(.35,.0,near>0.?0.:1.);
   float moss=(1.-smoothstep(.0,.012+eff,cr.y*.6-.006))*crackA*smoothstep(.55,.75,vn(g*7.));
   moss=max(moss,joint*smoothstep(.62,.8,vn(g*5.+9.)))*.85;
   float blades=smoothstep(.55,.8,vn(g*vec2(160.,60.)))*det;
   float oil=smoothstep(.56,.78,fbm(g*.7+vec2(1.7,5.)))*smoothstep(2.6,.6,abs(X-1.9))*smoothstep(uW-6.,uW-2.,z);
   float stain=smoothstep(.5,.85,fbm(g*.35+9.))*.35;
   float grime=fbm(g*1.3+7.);conc*=.72+.45*grime;
   float tyre=smoothstep(.35,.0,abs(abs(X-1.9)-.75)-.12)*smoothstep(uW-.5,uW-4.,z)*.3;conc*=1.-tyre;
   float algae=max(jnear,(1.-smoothstep(.0,.05,cr.y*.6))*crackA)*smoothstep(.3,.7,fbm3(g*4.));
   conc=mix(conc,vec3(.16,.19,.11)*(.7+.5*n),algae*.55);
   conc=mix(conc,conc*.7,stain);
   conc=mix(conc,vec3(.09,.085,.08),oil*.75);
   conc=mix(conc,conc*1.15,chip);
   conc=mix(conc,vec3(.05,.045,.04),near*.9);
   vec3 mossC=mix(vec3(.10,.17,.05),vec3(.25,.33,.09),blades);
   conc=mix(conc,mossC*(.7+.6*vn(g*30.)),moss);
   float tuft=max(near,jnear*.8)*smoothstep(.58,.82,vn(g*vec2(70.,26.)+vec2(0.,fbm3(g*20.)*2.)))*smoothstep(.4,.6,vn(g*3.+2.))*det;
   conc=mix(conc,mix(vec3(.12,.24,.05),vec3(.38,.5,.14),vn(g*140.)),tuft);
   oldc=conc;oldRough=mix(1.,.35,oil);
   if(drive<1.){float gr=vn(g*vec2(120.,40.))*det;vec3 lawn=vec3(.07,.13,.05)*(.55+.7*fbm(g*5.))*(.8+.4*gr);oldc=mix(lawn,oldc,drive);}
  }
  // ----- new surface: resin-bound aggregate -----
  vec3 newc=vec3(0.);vec3 N=vec3(0,1,0);float glint=0.;float gap=0.;float bord=0.;
  if(m>.001){
   float s=.0095;float idh;vec4 st=vor(g/s,idh);
   float lod=smoothstep(.35,1.1,eff/s);
   vec3 sc=idh<.42?uC0:(idh<.8?uC1:uC2);
   sc*=.62+.62*fract(idh*13.7);
   sc=mix(sc,sc*vec3(1.05,1.,.92),vn(g/s*.7+idh*9.)*.5);
   vec3 avg=uC0*.42+uC1*.38+uC2*.2;
   gap=(1.-smoothstep(.05,.2,st.y))*(1.-lod);
   newc=mix(mix(sc,avg*.32,gap),avg*.9,lod);
   vec2 o=st.zw*(1.-lod);N=normalize(vec3(-o.x*1.8,1.,-o.y*1.8));
   glint=step(.9,fract(idh*31.7))*(1.-lod)*(1.-gap);
   bord=smoothstep(-.01-eff,.01+eff,max(-3.9-X,X-4.4)+.22)*drive;
   float bz=fract(z/.2);float bx=h21(floor(vec2(X*4.,z/.2)));
   vec3 blk=vec3(.085,.085,.095)*(.8+.4*bx)*(.5+.5*smoothstep(0.,.06+eff*5.,min(bz,1.-bz)));
   newc=mix(newc,blk,bord);
  }
  float wet=texture2D(uWet,vec2(uv.x,1.-uv.y)).r*m;
  float edgeSh=smoothstep(.08,.34,mk.r)*(1.-m)*drive;
  vec3 alb=mix(oldc,newc,m)*(1.-edgeSh*.45);
  // ----- light: dusk sky, porch lamp, lit window spill, visitor's torch -----
  vec3 amb=vec3(.20,.23,.34)*.9+vec3(.10,.06,.04)+vec3(.35,.2,.12)*smoothstep(-1.,-6.,X)*.3;
  vec2 porch=vec2(-1.5,uW-.3);float dp=length(g-porch);
  vec3 Lc=vec3(1.,.6,.28)*lit*3.2/(1.+dp*dp*.3);
  Lc+=vec3(.55,.42,.36)*.5*smoothstep(uW,.0,z);
  vec2 win=vec2(-3.5,uW-.8);float dw=length((g-win)*vec2(.55,1.));
  Lc+=vec3(1.,.70,.40)*lit*.9/(1.+dw*dw*.45);
  vec2 tg=vec2(lightG.x*camH/max(-lightG.y,.03),camH/max(-lightG.y,.03));
  float dt=length((g-tg)*vec2(1.,.6));vec3 T=vec3(1.,.88,.7)*uTorch*.75/(1.+dt*dt*2.2);
  vec3 Ld=normalize(vec3(porch.x-X,1.6,porch.y-z));
  vec3 Lt=normalize(vec3(tg.x-X,.8,tg.y-z));
  float nl=.6+.4*max(dot(N,Ld),0.);float nt=.6+.4*max(dot(N,Lt),0.);
  col=alb*(amb+Lc*nl+T*nt);
  // specular: stones are resin-coated, so glossy; wet resin is a mirror
  vec3 V=normalize(vec3(-X,camH,-z));
  float hs=max(dot(N,normalize(Ld+V)),0.);float ht=max(dot(N,normalize(Lt+V)),0.);
  float gloss=mix(18.,90.,wet);
  col+=(Lc*pow(hs,gloss)+T*pow(ht,gloss))*m*(1.-gap)*mix(.35,1.,wet)*(1.-bord*.7);
  float cosv=camH/sqrt(z*z+camH*camH);
  float fres=.03+.6*pow(1.-cosv,4.);
  vec2 rq=vec2(X*uW/z+N.x*(1.-wet*.85)*.9,camH*(uW-z)/z+N.z*(1.-wet*.85)*.7);
  float rblur=K*abs(1.-uFocus/uW)*uW+.02+(1.-wet)*.5;
  vec3 refl=z<uW-.05?facade(rq,rblur,lit):sky(.3);
  float rk=m*(fres*(.1+.6*wet)+.18*wet)*(1.-gap*.9);
  rk+= (1.-m)*(1.-oldRough)*fres*.6;
  col=mix(col,refl,clamp(rk,0.,.9));
  float tw=.55+.45*sin(uTime*2.6+X*61.+z*47.);
  col+=glint*m*(Lc+T*2.2)*.45*tw;
  // pour lip catches the light
  vec2 mu=vec2(uv.x,1.-uv.y);
  float mR=texture2D(uMask,mu+vec2(uTexel.x*2.,0)).r,mL=texture2D(uMask,mu-vec2(uTexel.x*2.,0)).r;
  float mU=texture2D(uMask,mu-vec2(0,uTexel.y*2.)).r,mD=texture2D(uMask,mu+vec2(0,uTexel.y*2.)).r;
  float lip=clamp((mU-mD)*2.2+abs(mR-mL)*.8,0.,1.)*drive*(1.-smoothstep(1.,6.,z));
  col+=lip*(Lc*.35+T*.6+vec3(.10,.09,.10))*(.4+wet);
  col=mix(col,vec3(.14,.12,.17),smoothstep(3.,uW+1.,z)*.35);
  col*=.55+.45*smoothstep(.0,.9,uW-z);
 }
 vec2 c=uv-vec2(.5,.55);col*=1.-dot(c,c)*.75;
 col=col/(1.+col*.25);
 col=pow(col,vec3(.95));
 float lu=dot(col,vec3(.3,.59,.11));col=mix(vec3(lu),col,1.12);col=col*col*(3.-2.*col)*.35+col*.65;
 col+=(h21(fc+fract(uTime))-.5)*.012;
 gl_FragColor=vec4(col,1.);
}`;

// Compile the shader without blocking the main thread (KHR_parallel_shader_compile),
// so the page stays responsive while the GPU builds the hero.
export async function prepareHero() {
  const cv = document.getElementById('heroGL');
  const gl = cv && cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: /posterRender/.test(location.search) });
  if (!gl) return false;
  const ext = gl.getExtension('KHR_parallel_shader_compile');
  const mk = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const prog = gl.createProgram(); gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (ext) await new Promise(res => { const t0 = performance.now(); (function poll() { if (gl.getProgramParameter(prog, ext.COMPLETION_STATUS_KHR) || performance.now() - t0 > 8000) res(); else setTimeout(poll, 50); })(); });
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  cv.__prog = prog; return true;
}

export function initHero(opts = {}) {
  const hero = document.getElementById('hero');
  const cv = document.getElementById('heroGL');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.poster });
  if (!gl) return null;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  let prog = cv.__prog;
  if (!prog) try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
  } catch (e) { console.warn('hero shader', e); return null; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uRes', 'uTime', 'uLight', 'uTorch', 'uMask', 'uWet', 'uTexel', 'uC0', 'uC1', 'uC2', 'uDone', 'uYv', 'uF', 'uW', 'uCamH', 'uFocus'].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  const mkTex = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v)); return t; };
  const mask = document.createElement('canvas'), mctx = mask.getContext('2d');
  const wet = document.createElement('canvas'), wctx = wet.getContext('2d');
  const tMask = mkTex(), tWet = mkTex();
  const probe = document.createElement('canvas'); probe.width = 40; probe.height = 24;
  const pctx = probe.getContext('2d', { willReadFrequently: true });

  const coarse = matchMedia('(pointer:coarse)').matches;
  let W = 0, H = 0, dpr = 1, MS = 0.5, dirty = true;
  // camera: vanishing line height (0..1 from bottom), focal, distance to the house (m)
  // low camera (knee height) so the stones are big up close and the house falls out of focus
  const cam = { yv: .8, f: 1, w: 7, h: .5, focus: 1.6 };
  function camFor(w, h) {
    const aspect = w / h;
    cam.w = 7; cam.h = aspect < 1 ? .62 : .5;
    cam.f = Math.min(1.15, Math.max(.62, 0.5 * aspect * cam.w / 4.4));
    cam.yv = aspect < 1 ? 0.78 : 0.86;
    cam.focus = aspect < 1 ? 1.1 : 1.7;
  }
  // screen y (px from top) of the wall base: where the drive meets the house
  const wallBaseY = () => H * (1 - (cam.yv - cam.f * cam.h / cam.w));
  function resize() {
    const r = hero.getBoundingClientRect();
    W = r.width || innerWidth; H = r.height || innerHeight;
    if (!W || !H) return;
    dpr = opts.poster ? (opts.posterDpr || 2) : Math.min(devicePixelRatio || 1, coarse ? 1.15 : 1.35);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    camFor(W, H);
    for (const [c, ctx, bg] of [[mask, mctx, 'rgb(0,128,128)'], [wet, wctx, '#000']]) {
      const old = c.width && c.height ? (() => { const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; o.getContext('2d').drawImage(c, 0, 0); return o; })() : null;
      c.width = Math.round(W * MS); c.height = Math.round(H * MS);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
      if (old) ctx.drawImage(old, 0, 0, c.width, c.height);
    }
    dirty = true; kick();
  }

  let blend = (opts.blend || ['#b9b8b2', '#8d8c88', '#e3e1da']).map(hexToRgb);
  let done = 0, doneT = -1, finished = false, coverage = 0;
  const light = { x: .62, y: .3, tx: .62, ty: .3 };
  let torch = 0, torchT = 0;
  let last = null, ghost = null, lastPaint = 0;

  function blade() { return Math.max(90, Math.min(200, W * 0.13)); }
  function stroke(x0, y0, x1, y1, alpha = 0.9) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const ux = dx / len, uy = dy / len, s = MS;
    const g = Math.round((ux * 0.5 + 0.5) * 255), bb = Math.round((-uy * 0.5 + 0.5) * 255);
    const c = `rgba(255,${g},${bb},${alpha})`;
    for (const [ctx, col, blur] of [[mctx, c, 16], [wctx, 'rgba(255,255,255,.95)', 22]]) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = blade() * s; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = blur * s;
      ctx.beginPath(); ctx.moveTo(x0 * s, y0 * s); ctx.lineTo(x1 * s, y1 * s); ctx.stroke(); ctx.shadowBlur = 0;
    }
    lastPaint = performance.now();
    dirty = true; kick();
  }

  function local(e) { const r = hero.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  const onDrive = y => y > wallBaseY() - 10;
  hero.addEventListener('pointermove', e => {
    const [x, y] = local(e);
    light.tx = x / W; light.ty = 1 - y / H; torchT = 1; kick();
    if (finished) return;
    if (e.target.closest('a,button,.hero-dock,.hero-copy')) { last = null; return; }
    if (!onDrive(y)) { last = null; return; }
    if (last) { stroke(last[0], last[1], x, y); opts.onFirst && (opts.onFirst(), opts.onFirst = null); }
    last = [x, y];
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { last = null; torchT = 0; });
  hero.addEventListener('pointerdown', e => { if (!e.target.closest('a,button,.hero-dock,.hero-copy')) { const [x, y] = local(e); last = onDrive(y) ? [x, y] : null; } });
  hero.addEventListener('pointerup', () => { if (coarse) last = null; });
  hero.addEventListener('pointercancel', () => last = null);

  function runGhost(path, dur, done) { ghost = { path, dur, t0: performance.now(), prev: null, done }; kick(); }
  function ghostStep(now) {
    if (!ghost) return;
    const k = Math.min(1, (now - ghost.t0) / ghost.dur);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [x, y] = ghost.path(e);
    if (ghost.prev) stroke(ghost.prev[0], ghost.prev[1], x, y, .92);
    ghost.prev = [x, y]; light.tx = x / W; light.ty = 1 - y / H; torchT = 1;
    opts.onGhost && opts.onGhost(x, y, k < 1);
    if (k >= 1) { const d = ghost.done; ghost = null; torchT = 0; d && d(); }
  }
  const demoPath = () => {
    const y0 = wallBaseY(), span = H - y0;
    return t => [W * (-0.05 + t * 1.1), y0 + span * (0.62 - 0.22 * t) + Math.sin(t * Math.PI * 2) * span * 0.06];
  };
  function demo(dur = 1700) { runGhost(demoPath(), dur); }
  function finish() {
    if (finished || doneT > 0) return;
    const y0 = wallBaseY(), span = H - y0;
    const rows = Math.max(3, Math.ceil(span / (blade() * 0.7)));
    runGhost(t => {
      const r = t * rows; const i = Math.min(rows - 1, Math.floor(r)); const fr = r - i;
      const y = y0 + (i + 0.5) * (span / rows);
      const x = i % 2 ? W * (1.08 - fr * 1.16) : W * (-0.08 + fr * 1.16);
      return [x, y];
    }, 2000, () => { mctx.fillStyle = 'rgba(255,128,128,.7)'; mctx.fillRect(0, (y0 - 20) * MS, mask.width, mask.height); dirty = true; doneT = performance.now(); kick(); });
  }

  function measure() {
    if (!mask.width || !mask.height) return;
    const y0 = Math.max(0, wallBaseY()) * MS;
    pctx.clearRect(0, 0, probe.width, probe.height);
    pctx.drawImage(mask, 0, y0, mask.width, mask.height - y0, 0, 0, probe.width, probe.height);
    const d = pctx.getImageData(0, 0, probe.width, probe.height).data;
    let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] > 150 ? 1 : 0;
    coverage = s / (d.length / 4);
    opts.onCoverage && opts.onCoverage(finished ? 1 : coverage);
    if (coverage > 0.7 && !finished && doneT < 0 && !ghost) finish();
  }
  let visible = true, raf = 0, running = false, lastDecay = 0;
  const t0 = performance.now();
  function kick() { if (!running && visible) { running = true; raf = requestAnimationFrame(frame); } }
  function frame(now) {
    if (!visible) { running = false; return; }
    ghostStep(now);
    if (coarse && !ghost) { const t = now / 2600; light.tx = .5 + Math.cos(t) * .3; light.ty = .25 + Math.sin(t * 1.2) * .1; }
    light.x += (light.tx - light.x) * .1; light.y += (light.ty - light.y) * .1;
    torch += ((coarse ? 0.6 : torchT) - torch) * .08;
    // wet film settles over ~6s
    if (now - lastDecay > 60) { lastDecay = now; wctx.fillStyle = 'rgba(0,0,0,.035)'; wctx.fillRect(0, 0, wet.width, wet.height); dirty = true; }
    if (doneT > 0) { done = Math.min(1, (now - doneT) / 2400); if (done >= 1 && !finished) { finished = true; opts.onDone && opts.onDone(); } }
    if (dirty) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tMask); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tWet); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wet);
      dirty = false;
    }
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform2f(U.uLight, light.x, light.y); gl.uniform1f(U.uTorch, torch);
    gl.uniform1i(U.uMask, 0); gl.uniform1i(U.uWet, 1); gl.uniform2f(U.uTexel, 1 / mask.width, 1 / mask.height);
    gl.uniform3fv(U.uC0, blend[0]); gl.uniform3fv(U.uC1, blend[1]); gl.uniform3fv(U.uC2, blend[2]);
    gl.uniform1f(U.uDone, done); gl.uniform1f(U.uYv, cam.yv); gl.uniform1f(U.uF, cam.f); gl.uniform1f(U.uW, cam.w); gl.uniform1f(U.uCamH, cam.h); gl.uniform1f(U.uFocus, cam.focus);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // keep animating while something is moving; otherwise idle at ~12fps for glints
    const busy = ghost || now - lastPaint < 7000 || Math.abs(light.tx - light.x) > .002 || (doneT > 0 && !finished) || torch > .02 && !coarse;
    if (busy) raf = requestAnimationFrame(frame);
    else { running = false; setTimeout(kick, 90); }
  }
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(hero);
  setInterval(() => { if (visible && !opts.poster) measure(); }, 300);
  resize();
  addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
  hero.classList.add('gl');
  return {
    demo, finish,
    setBlend(c) { blend = c.map(hexToRgb); dirty = true; kick(); },
    // poster: paint the demo stroke instantly and render one frame
    posterFrame() { const p = demoPath(); let prev = p(0); for (let i = 1; i <= 80; i++) { const q = p(i / 80); stroke(prev[0], prev[1], q[0], q[1], .92); prev = q; } wctx.fillStyle = 'rgba(0,0,0,.55)'; wctx.fillRect(0, 0, wet.width, wet.height); dirty = true; },
    get finished() { return finished; }
  };
}

function hexToRgb(h) { const n = parseInt(h.replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map(v => Math.pow(v, 1.1)); }
