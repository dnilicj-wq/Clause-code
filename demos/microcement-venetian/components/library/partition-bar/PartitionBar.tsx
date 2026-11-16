// Port of 8starlabs/ui partition-bar (MIT). Variants re-skinned to preset tokens; segments grow in once visible.
import { Children, createContext, isValidElement, useContext, useEffect, useRef, useState, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/cn';

type Ctx = { total: number; size: VariantProps<typeof partitionBarVariants>['size']; shown: boolean };
const PartitionBarCtxt = createContext<Ctx | null>(null);
function usePartitionBarContext() {
  const c = useContext(PartitionBarCtxt);
  if (!c) throw new Error('usePartitionBarContext must be used within a PartitionBar');
  return c;
}

const partitionBarVariants = cva('flex flex-row', {
  variants: { size: { sm: 'text-xs', md: 'text-sm', lg: 'text-base' } },
  defaultVariants: { size: 'md' },
});

type SegmentProps = HTMLAttributes<HTMLLIElement> & {
  children?: ReactNode; num?: number; alignment?: 'left' | 'center' | 'right';
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'muted';
};

interface PartitionBarProps extends HTMLAttributes<HTMLUListElement>, VariantProps<typeof partitionBarVariants> {
  children?: ReactElement<SegmentProps> | ReactElement<SegmentProps>[];
  gap?: number;
}

export default function PartitionBar({ children, className, gap = 1, size, ...props }: PartitionBarProps) {
  const total = Children.toArray(children).reduce<number>((s, c) => (isValidElement(c) ? s + ((c.props as SegmentProps).num || 0) : s), 0);
  const ref = useRef<HTMLUListElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.3 });
    ref.current && io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <PartitionBarCtxt.Provider value={{ total, size, shown }}>
      <ul ref={ref} className={cn('w-full', partitionBarVariants({ size }), className)} style={{ gap: `${gap * 4}px` }} {...props}>
        {children}
      </ul>
    </PartitionBarCtxt.Provider>
  );
}

const lineStyle: Record<NonNullable<SegmentProps['variant']>, React.CSSProperties> = {
  default: { background: 'var(--accent)' },
  secondary: { background: 'color-mix(in oklab, var(--accent) 60%, transparent)' },
  destructive: { background: '#D9534F' },
  outline: { border: '1px solid var(--line)', background: 'var(--bg)' },
  muted: { background: 'color-mix(in oklab, var(--accent) 35%, transparent)' },
};
const titleStyle: Record<NonNullable<SegmentProps['variant']>, React.CSSProperties> = {
  default: { color: 'var(--accent)' },
  secondary: { color: 'color-mix(in oklab, var(--accent) 75%, var(--ink))' },
  destructive: { color: '#D9534F' },
  outline: { color: 'var(--ink)' },
  muted: { color: 'color-mix(in oklab, var(--accent) 50%, var(--muted))' },
};

export function PartitionBarSegment({ children, num = 0, variant = 'default', alignment = 'center', className, ...props }: SegmentProps) {
  const { total, size, shown } = usePartitionBarContext();
  const w = total > 0 ? (num / total) * 100 : 0;
  return (
    <li className="flex min-w-0 flex-col" style={{ flex: `${Math.max(num, 0)} 1 0%`, minWidth: 0 }} data-pct={w.toFixed(1)} {...props}>
      <div
        className={cn('w-full shrink-0 origin-left rounded-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none', size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3', className)}
        style={{ ...lineStyle[variant], transform: shown ? 'scaleX(1)' : 'scaleX(0)' }}
      />
      <div
        className={cn('flex w-full flex-col whitespace-normal transition-opacity duration-500', size === 'sm' ? 'mt-2' : size === 'lg' ? 'mt-4' : 'mt-3',
          alignment === 'left' && 'items-start', alignment === 'center' && 'items-center', alignment === 'right' && 'items-end')}
        style={{ ...titleStyle[variant], opacity: shown ? 1 : 0, transitionDelay: shown ? '450ms' : '0ms' }}
      >
        {children}
      </div>
    </li>
  );
}

export function PartitionBarSegmentTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('w-fit font-semibold', className)}>{children}</div>;
}
export function PartitionBarSegmentValue({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('w-fit text-[80%]', className)} style={{ color: 'var(--muted)' }}>{children}</div>;
}
