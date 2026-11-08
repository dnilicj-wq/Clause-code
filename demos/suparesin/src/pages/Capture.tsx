import { useEffect, useRef } from 'react';
import { initStudio } from '@/components/signature/resin-studio/studio';
import { makeSurface } from '@/components/signature/resin-studio/surfaces';
import { byKey } from '@/config/finishes';
import { presets } from '@/config/presets';
import { site } from '@/config/site';

// Internal: renders stills of the hero scene for posters, designer views and swatches.
//   /capture?k=poster              bare drive (what the pour starts from) with the first golden pour half way
//   /capture?k=view&f=<finish>     finished surface, full frame
//   /capture?k=edge&f=<finish>     the pour frozen part-way: new finish behind, wet edge, old surface in front
//   /capture?k=swatch&f=<finish>   flat texture tile (2D) for the small swatches
export default function Capture() {
  const host = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const flat = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const k = q.get('k') || 'poster';
    const f = byKey(q.get('f') || 'golden');
    const p = presets[q.get('preset') || site.preset];
    if (k === 'swatch') {
      const s = makeSurface(f, 1, false);
      const img = s.map.image as HTMLCanvasElement, c = flat.current!, g = c.getContext('2d')!;
      const crop = Math.round(img.width * (f.kind === 'metallic' ? 0.45 : f.kind === 'highbuild' ? 0.6 : f.kind === 'flake' ? 0.06 : 0.25));
      g.drawImage(img, 0, 0, crop, crop, 0, 0, c.width, c.height);
      // a soft sheen so the floors read as gloss even at 96 px
      if (f.kind !== 'resin') { const gr = g.createLinearGradient(0, 0, c.width, c.height); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(.45, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); }
      (window as any).__ready = true;
      return;
    }
    const a = initStudio(host.current!, cv.current!, { fog: p.bg, tex: '/tex/' });
    if (!a) return;
    const go = () => {
      if (!a.loaded) return setTimeout(go, 100);
      if (k === 'poster') a.bare((q.get('m') as 'drive' | 'floor') || 'floor'); else a.fill(f, f.mode, k === 'edge' ? a.look.z + 1.4 : 99);
      setTimeout(() => ((window as any).__ready = true), 1800);
    };
    go();
    return () => a.destroy();
  }, []);
  return (
    <div ref={host} style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <canvas ref={cv} style={{ width: '100%', height: '100%', display: 'block' }} />
      <canvas ref={flat} width={320} height={320} style={{ position: 'fixed', left: 0, top: 0, width: 320, height: 320 }} />
    </div>
  );
}
