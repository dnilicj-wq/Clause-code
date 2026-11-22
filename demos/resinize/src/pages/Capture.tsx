import { useEffect, useRef } from 'react';
import { initPour } from '@/components/signature/pour-hero/pour';
import { presets } from '@/config/presets';
import { epoxy } from '@/config/trades/epoxy';

// Internal: renders a still of the pour shader for posters, textures and the finish lookbook.
// /capture?k=<finish key>|concrete|hero  (&preset=)
export default function Capture() {
  const host = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const k = q.get('k') || 'hero';
    const p = presets[q.get('preset') || 'obsidian-copper'];
    const f = epoxy.finishes.find((x) => x.key === k);
    const custom = q.get('base') && q.get('metal') ? { base: '#' + q.get('base'), metal: '#' + q.get('metal'), kind: (q.get('kind') || 'solid') as any } : null;
    const fin = custom || (f ? { base: f.base, metal: f.metal, kind: f.type } : { base: p.resin.base, metal: p.resin.metal, kind: 'metallic' as const });
    const seed = [...k].reduce((a, c) => a + c.charCodeAt(0), 0) % 37 / 3.1;
    const a = initPour(host.current!, cv.current!, { ...fin, concrete: p.concrete, seed: k === 'hero' ? 1.7 : seed });
    if (!a) return;
    a.light(+(q.get('lx') || 0.6), +(q.get('ly') || 0.62));
    if (k === 'hero') a.demo();
    else if (k !== 'concrete') a.fillAll(0);
    setTimeout(() => ((window as any).__ready = true), k === 'hero' ? 3200 : 900);
    return () => a.destroy();
  }, []);
  return (
    <div ref={host} style={{ position: 'fixed', inset: 0 }}>
      <canvas ref={cv} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
