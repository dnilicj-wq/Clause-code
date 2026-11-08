import { useEffect, useRef } from 'react';
import { initDrive } from '@/components/signature/drive-pour/drive';
import { initSlabs } from '@/components/signature/slab-drop/slabs';
import { blends } from '@/config/driveway';
import { presets } from '@/config/presets';
import { site } from '@/config/site';

// Internal: renders stills of the driveway shader for posters and blend swatches.
// /capture?k=hero|before|<blend key>
export default function Capture() {
  const host = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const k = q.get('k') || 'hero';
    const p = presets[q.get('preset') || site.preset];
    if (k.startsWith('slabs')) {
      const a = initSlabs(host.current!, cv.current!, { fog: p.bg, tex: '/tex/' });
      if (!a) return;
      const go = () => {
        if (!a.loaded) return setTimeout(go, 100);
        if (k === 'slabs') a.prefill(q.get('f') ? +q.get('f')! : undefined); else if (k === 'slabs-done') a.fillAll();
        setTimeout(() => ((window as any).__ready = true), 1800);
      };
      go();
      return () => a.destroy();
    }
    const b = blends.find((x) => x.key === k) || blends[0];
    const a = initDrive(host.current!, cv.current!, { blend: b, fog: p.bg, tex: '/tex/', view: q.get('view') ? +q.get('view')! : undefined });
    if (!a) return;
    a.light(+(q.get('lx') || 0.66), +(q.get('ly') || 0.55));
    const go = () => {
      if (!a.loaded) return setTimeout(go, 100);
      if (k === 'hero') a.prefill();
      else if (k !== 'before') a.fillAll(0);
      setTimeout(() => ((window as any).__ready = true), 1600);
    };
    go();
    return () => a.destroy();
  }, []);
  return (
    <div ref={host} style={{ position: 'fixed', inset: 0 }}>
      <canvas ref={cv} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
