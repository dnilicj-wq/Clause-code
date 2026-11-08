import * as React from 'react';
import { cn } from '@/lib/utils';
// shadcn/ui Card (MIT), re-skinned to preset tokens. Used by ported 21st.dev components that import @/components/ui/card.
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => (
  <div ref={ref} className={cn('rounded-[var(--radius)] border border-line bg-surface text-ink shadow-sm', className)} {...p} />
));
Card.displayName = 'Card';
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...p} />);
CardHeader.displayName = 'CardHeader';
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...p }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...p} />);
CardContent.displayName = 'CardContent';
