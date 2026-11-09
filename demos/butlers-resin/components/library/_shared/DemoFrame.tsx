import type { ReactNode } from 'react';

// Lab demo frame: fixed-height stage with an optional headline overlay in the preset fonts.
export function DemoFrame({ children, kicker, title, sub, h = 260, className = '' }: {
  children: ReactNode; kicker?: string; title?: ReactNode; sub?: string; h?: number; className?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden rounded-[calc(var(--radius)*.6)] ${className}`} style={{ height: h, background: 'var(--bg)' }}>
      {children}
      {(title || kicker) && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
          {kicker && <span className="mb-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.18em] backdrop-blur-sm" style={{ borderColor: 'var(--line)', color: 'var(--accent2)', background: 'color-mix(in srgb, var(--bg) 60%, transparent)' }}>{kicker}</span>}
          {title && <h3 className="font-display text-[clamp(26px,5.4vw,46px)] font-semibold leading-[1.02] tracking-tight" style={{ color: 'var(--ink)', textShadow: '0 2px 22px color-mix(in srgb, var(--bg) 80%, transparent)' }}>{title}</h3>}
          {sub && <p className="mt-2 max-w-md text-[13px]" style={{ color: 'var(--muted)' }}>{sub}</p>}
        </div>
      )}
    </div>
  );
}
