// When to start WebGL. Rules carried over from the KT / coating demos:
// - desktop: as soon as the page is idle
// - touch: on first scroll / tap, or after a short idle (never blocks first paint)
// - software renderers (SwiftShader, llvmpipe): never; they keep the poster
// - ?gl=force / ?gl=off override
let swCache: boolean | null = null;
export function softwareRenderer(): boolean {
  if (swCache !== null) return swCache;
  try {
    const c = document.createElement('canvas');
    const g = (c.getContext('webgl') || c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!g) return (swCache = true);
    const ext = g.getExtension('WEBGL_debug_renderer_info');
    const r = String(ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER));
    g.getExtension('WEBGL_lose_context')?.loseContext();
    return (swCache = /swiftshader|llvmpipe|software|basic render/i.test(r));
  } catch { return (swCache = true); }
}
export function glMode(): 'force' | 'off' | 'auto' {
  const q = new URLSearchParams(location.search).get('gl');
  return q === 'force' ? 'force' : q === 'off' ? 'off' : 'auto';
}
export const isCoarse = () => matchMedia('(pointer:coarse)').matches;
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function whenReadyForGL(cb: () => void, opts: { eagerTouch?: boolean } = {}): () => void {
  const mode = glMode();
  if (mode === 'off') return () => {};
  if (mode === 'force') { const t = setTimeout(cb, 0); return () => clearTimeout(t); }
  if (softwareRenderer()) return () => {};
  let done = false;
  const go = () => { if (done) return; done = true; cleanup(); cb(); };
  const evs = ['scroll', 'pointerdown', 'touchstart', 'keydown', 'pointermove'] as const;
  const cleanup = () => { evs.forEach((e) => removeEventListener(e, go)); clearTimeout(t); if (idle) (window as any).cancelIdleCallback?.(idle); };
  evs.forEach((e) => addEventListener(e, go, { passive: true, once: true }));
  let idle = 0;
  const ric = (window as any).requestIdleCallback as undefined | ((f: () => void, o?: any) => number);
  // phones with eagerTouch start straight away, so the pour is visible within a second
  const eager = opts.eagerTouch && isCoarse();
  const delay = isCoarse() && !opts.eagerTouch ? 3500 : eager ? 0 : 250;
  const t = setTimeout(() => { if (ric && !eager) idle = ric(go, { timeout: 1200 }); else go(); }, delay);
  return cleanup;
}

// Max 2 live WebGL canvases at once: a tiny registry the heavy components check in with.
const live = new Set<string>();
export function claimGL(id: string, max = 2): boolean { if (live.has(id)) return true; if (live.size >= max) return false; live.add(id); return true; }
export function releaseGL(id: string) { live.delete(id); }
