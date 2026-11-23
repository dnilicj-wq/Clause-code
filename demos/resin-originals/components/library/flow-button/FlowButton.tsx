// Flow Button — port of 21st.dev/@xubohuah/components/flow-button (catalogue copy).
// Same motion: arrows swap sides, label slides, a filled circle blooms from the centre and the pill squares off.
// Re-skinned: ink/line/accent tokens instead of #111 / #333.
import { ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/cn';

export function FlowButton({ text = 'Modern Button', href, onClick, className }: { text?: string; href?: string; onClick?: () => void; className?: string }) {
  const Tag: any = href ? 'a' : 'button';
  return (
    <Tag href={href} onClick={onClick}
      className={cn('group relative flex w-fit items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[color-mix(in_srgb,var(--ink)_40%,transparent)] bg-transparent px-8 py-3 text-sm font-semibold text-[var(--ink)] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-[var(--accent-ink)] hover:rounded-[12px] active:scale-[0.95]', className)}>
      <ArrowRight className="absolute w-4 h-4 left-[-25%] stroke-[var(--ink)] fill-none z-[9] group-hover:left-4 group-hover:stroke-[var(--accent-ink)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">{text}</span>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--accent)] rounded-[50%] opacity-0 group-hover:w-[260px] group-hover:h-[260px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]" />
      <ArrowRight className="absolute w-4 h-4 right-4 stroke-[var(--ink)] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-[var(--accent-ink)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
    </Tag>
  );
}
export default FlowButton;
