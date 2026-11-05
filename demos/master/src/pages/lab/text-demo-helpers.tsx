import { useState, type ReactNode } from 'react';
// Small "Replay" wrapper for one-shot text effects in lab demos.
export function Replay({ children, className }: { children: (k: number) => ReactNode; className?: string }) {
  const [k, setK] = useState(0);
  return (
    <div className={className}>
      {children(k)}
      <button onClick={() => setK(k + 1)} className="mt-4 rounded-full border px-3 py-1 text-xs" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>Replay</button>
    </div>
  );
}
export function ScrollBox({ children, h = 300, hint = 'Scroll inside the box' }: { children: (ref: React.RefObject<HTMLDivElement | null>) => ReactNode; h?: number; hint?: string }) {
  return <ScrollBoxInner h={h} hint={hint}>{children}</ScrollBoxInner>;
}
import { useRef } from 'react';
function ScrollBoxInner({ children, h, hint }: { children: (ref: React.RefObject<HTMLDivElement | null>) => ReactNode; h: number; hint: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      <div ref={ref} data-scroll-box className="relative overflow-y-auto rounded-xl border" style={{ height: h, borderColor: 'var(--line)', overscrollBehavior: 'contain' }}>
        {children(ref)}
      </div>
      <span className="pointer-events-none absolute bottom-2 right-3 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>{hint} ↓</span>
    </div>
  );
}
