import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Port of Aceternity UI "Feature Section with Hover Effects" (21st.dev @manuarora700, MIT).
// Same grid, hover gradient and growing accent bar; colours from preset tokens, features via props.
export type HoverFeature = { title: string; description: string; icon: ReactNode };

export function FeaturesSectionWithHoverEffects({ features, className }: { features: HoverFeature[]; className?: string }) {
  const half = Math.ceil(features.length / 2);
  return (
    <div className={cn('relative z-10 mx-auto grid max-w-7xl grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-4', className)}>
      {features.map((f, i) => <Feature key={f.title} {...f} index={i} half={half} />)}
    </div>
  );
}

function Feature({ title, description, icon, index, half }: HoverFeature & { index: number; half: number }) {
  const top = index < half;
  return (
    <div className={cn('group/feature relative flex flex-col border-line py-10 lg:border-r', (index === 0 || index === half) && 'lg:border-l', top && 'lg:border-b')}>
      <div className={cn('pointer-events-none absolute inset-0 h-full w-full to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100', top ? 'bg-gradient-to-t' : 'bg-gradient-to-b')}
        style={{ ['--tw-gradient-from' as any]: 'color-mix(in srgb, var(--accent) 12%, transparent)', backgroundImage: `linear-gradient(${top ? 'to top' : 'to bottom'}, color-mix(in srgb, var(--accent) 12%, transparent), transparent)` }} />
      <div className="relative z-10 mb-4 px-10 text-muted">{icon}</div>
      <div className="relative z-10 mb-2 px-10 text-lg font-bold">
        <div className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-br-full rounded-tr-full bg-line transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-accent" />
        <span className="inline-block text-ink transition duration-200 group-hover/feature:translate-x-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</span>
      </div>
      <p className="relative z-10 max-w-xs px-10 text-sm text-muted">{description}</p>
    </div>
  );
}
