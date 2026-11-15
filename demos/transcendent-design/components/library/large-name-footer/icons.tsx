// Local stand-in for the missing @/components/ui/icons import in the original (Icons.logo).
// The logo is the template's generic pour-drop mark; /new-lead swaps in the prospect's logo.
import { useId } from 'react';
export const Icons = {
  logo: ({ className }: { className?: string }) => {
    const id = useId();
    return (
      <svg className={className} viewBox="0 0 32 32" aria-hidden>
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--metal2)" /><stop offset=".55" stopColor="var(--metal1)" /><stop offset="1" stopColor="var(--metal0)" /></linearGradient></defs>
        <circle cx="16" cy="16" r="14.5" fill="none" stroke={`url(#${id})`} strokeWidth="1.6" />
        <path d="M16 7c3.6 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.4-6.4 6-11z" fill={`url(#${id})`} />
      </svg>
    );
  },
};
