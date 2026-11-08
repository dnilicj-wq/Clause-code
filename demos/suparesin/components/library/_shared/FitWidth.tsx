import { useEffect, useRef, useState, type ReactNode } from 'react';
// Lab/demo helper: renders children at a fixed design width and scales them down to fit the box,
// so desktop layouts of ported sections can be previewed inside a narrow card. Below `minViewport` it renders normally.
export function FitWidth({ width = 1100, minViewport = 768, children }: { width?: number; minViewport?: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null), inner = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1), [h, setH] = useState<number | undefined>();
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => {
      const wide = innerWidth >= minViewport; setOn(wide);
      if (!wide || !box.current || !inner.current) return;
      const k = Math.min(1, box.current.clientWidth / width); setS(k); setH(inner.current.offsetHeight * k);
    };
    f(); const ro = new ResizeObserver(f); box.current && ro.observe(box.current); inner.current && ro.observe(inner.current);
    addEventListener('resize', f); return () => { ro.disconnect(); removeEventListener('resize', f); };
  }, [width, minViewport]);
  if (!on) return <div ref={box}><div ref={inner}>{children}</div></div>;
  return (
    <div ref={box} style={{ height: h, overflow: 'hidden' }}>
      <div ref={inner} style={{ width, transform: `scale(${s})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}
