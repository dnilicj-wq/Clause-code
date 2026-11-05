import { useEffect, useRef } from 'react';
import { TrowelHero } from '@/components/signature/trowel-hero/TrowelHero';
import { initTrowel } from '@/components/signature/trowel-hero/trowel';

// Lab card: compact hero. ?full=1 shows it full screen (for review); ?still=1 renders the poster still for scripts/capture-trowel.mjs.
export default function TrowelHeroDemo() {
  const q = typeof window !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  if (q.get('still')) return <Still colour={q.get('c') ? '#' + q.get('c') : '#BEB8AE'} />;
  if (q.get('full')) return <div className="fixed inset-0 z-50 overflow-auto" style={{ background: 'var(--bg)' }}><TrowelHero /></div>;
  return <div className="-m-5 overflow-hidden rounded-[var(--radius)]"><TrowelHero compact /></div>;
}

function Still({ colour }: { colour: string }) {
  const host = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const a = initTrowel(host.current!, cv.current!, { colour, interactive: false });
    if (!a) return;
    a.still();
    a.light(0.62, 0.58);
    const t = setTimeout(() => ((window as any).__ready = true), 900);
    return () => { clearTimeout(t); a.destroy(); };
  }, [colour]);
  return <div ref={host} style={{ position: 'fixed', inset: 0, zIndex: 60 }}><canvas ref={cv} style={{ width: '100%', height: '100%', display: 'block' }} /></div>;
}
