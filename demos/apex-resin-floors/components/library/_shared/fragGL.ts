import { dpr, runLoop } from './loop';

// Minimal full-screen fragment shader runner (WebGL1) with offscreen pause and capped DPR.
export function mountFrag(canvas: HTMLCanvasElement, frag: string, setUniforms: (gl: WebGLRenderingContext, loc: (n: string) => WebGLUniformLocation | null, t: number) => void, opts: { scale?: number } = {}): () => void {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: true });
  if (!gl) return () => {};
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const cache: Record<string, WebGLUniformLocation | null> = {};
  const loc = (n: string) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(prog, n)));
  const size = () => {
    const p = canvas.parentElement!; const r = dpr() * (opts.scale ?? 1);
    canvas.width = Math.max(1, Math.round(p.clientWidth * r)); canvas.height = Math.max(1, Math.round(p.clientHeight * r));
    canvas.style.width = '100%'; canvas.style.height = '100%';
  };
  size();
  const ro = new ResizeObserver(size); ro.observe(canvas.parentElement!);
  const stop = runLoop(canvas, (_dt, t) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(loc('u_res'), canvas.width, canvas.height);
    gl.uniform1f(loc('u_time'), t);
    setUniforms(gl, loc, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });
  // No loseContext(): React StrictMode remounts on the same canvas and would get the lost context back.
  return () => { stop(); ro.disconnect(); gl.deleteProgram(prog); gl.deleteBuffer(buf); };
}
