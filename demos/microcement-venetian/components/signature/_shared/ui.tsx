import type { ReactNode } from 'react';

// Small UI bits shared by the signature interactions. Preset tokens only.
export function Chip({ on, onClick, children, swatch }: { on?: boolean; onClick?: () => void; children: ReactNode; swatch?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={!!on}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-[background,color,border-color] duration-200"
      style={on ? { background: 'var(--ink)', color: 'var(--bg)', borderColor: 'var(--ink)' } : { borderColor: 'var(--line)', color: 'var(--ink)', background: 'color-mix(in srgb, var(--surface) 70%, transparent)' }}>
      {swatch && <span className="h-3.5 w-3.5 rounded-full" style={{ background: swatch, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.25), 0 0 0 1px rgba(0,0,0,.25)' }} />}
      {children}
    </button>
  );
}
export function Tag({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none rounded-full bg-black/45 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[.14em] text-white/90 backdrop-blur-md">{children}</span>;
}
export function Ghost({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className="rounded-full border px-3 py-1.5 text-[13px]" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>{children}</button>;
}
