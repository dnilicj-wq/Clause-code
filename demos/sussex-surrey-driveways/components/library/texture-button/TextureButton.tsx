// Texture Button — port of Cult UI's texture-button (21st.dev/@cult-ui/components/texture-button, MIT).
// Same build: a 1px gradient "rim" wrapper around an inner gradient face, cva variants, Radix Slot for asChild.
// Re-skinned: the original's neutral/indigo/red light+dark gradients are mapped onto preset tokens,
// so one set of variants works on dark and light presets (this app has no .dark class).
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/src/lib/cn';

const buttonVariantsOuter = cva('', {
  variants: {
    variant: {
      primary: 'w-full border border-[color-mix(in_srgb,var(--bg)_60%,transparent)] bg-gradient-to-b from-[color-mix(in_srgb,var(--ink)_70%,transparent)] to-[var(--ink)] p-[1px] transition duration-300 ease-in-out',
      accent: 'w-full border border-[color-mix(in_srgb,var(--bg)_60%,transparent)] bg-gradient-to-b from-[color-mix(in_srgb,var(--accent2)_90%,transparent)] to-[var(--accent)] p-[1px] transition duration-300 ease-in-out',
      secondary: 'w-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-[1px] transition duration-300 ease-in-out',
      minimal: 'group w-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] p-[1px] hover:bg-gradient-to-t hover:from-[var(--bg2)] hover:to-[var(--surface)]',
      icon: 'group rounded-full border border-[var(--line)] bg-[var(--surface)] p-[1px] hover:bg-gradient-to-t hover:from-[var(--bg2)] hover:to-[var(--surface)]',
    },
    size: { sm: 'rounded-[6px]', default: 'rounded-[12px]', lg: 'rounded-[12px]', icon: 'rounded-full' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
});

const innerDivVariants = cva('w-full h-full flex items-center justify-center', {
  variants: {
    variant: {
      primary: 'gap-2 bg-gradient-to-b from-[color-mix(in_srgb,var(--ink)_82%,var(--bg))] to-[var(--ink)] text-[var(--bg)] transition duration-300 ease-in-out hover:from-[color-mix(in_srgb,var(--ink)_72%,var(--bg))] hover:to-[color-mix(in_srgb,var(--ink)_88%,var(--bg))] active:from-[var(--ink)] active:to-[var(--ink)]',
      accent: 'gap-2 bg-gradient-to-b from-[color-mix(in_srgb,var(--accent)_82%,white)] to-[color-mix(in_srgb,var(--accent)_85%,black)] text-[var(--accent-ink)] transition duration-300 ease-in-out hover:from-[color-mix(in_srgb,var(--accent)_70%,white)] hover:to-[var(--accent)] active:from-[var(--accent)] active:to-[var(--accent)]',
      secondary: 'bg-gradient-to-b from-[var(--surface)] to-[var(--bg2)] text-[var(--ink)] transition duration-300 ease-in-out hover:from-[color-mix(in_srgb,var(--surface)_92%,var(--ink))] hover:to-[var(--surface)] active:from-[var(--bg2)] active:to-[var(--bg2)]',
      minimal: 'bg-gradient-to-b from-[var(--surface)] to-[color-mix(in_srgb,var(--surface)_50%,var(--bg))] text-[var(--ink)] transition duration-300 ease-in-out group-hover:from-[color-mix(in_srgb,var(--surface)_94%,var(--ink))] group-hover:to-[var(--surface)] group-active:from-[var(--bg2)] group-active:to-[var(--bg2)]',
      icon: 'bg-gradient-to-b from-[var(--surface)] to-[var(--bg2)] text-[var(--ink)] group-active:bg-[var(--bg2)] rounded-full',
    },
    size: { sm: 'text-xs rounded-[4px] px-4 py-1', default: 'text-sm rounded-[10px] px-4 py-2', lg: 'text-base rounded-[10px] px-5 py-2.5', icon: 'rounded-full p-1' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
});

export interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'minimal' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const TextureButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({ children, variant = 'primary', size = 'default', asChild = false, className, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariantsOuter({ variant, size }), className)} ref={ref} {...props}>
        <div className={cn(innerDivVariants({ variant, size }))}>{children}</div>
      </Comp>
    );
  },
);
TextureButton.displayName = 'TextureButton';
export { TextureButton };
