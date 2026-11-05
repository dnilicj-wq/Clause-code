import { ShinyButton } from '@/components/library/shiny-button/ShinyButton';

// Quiet secondary CTA: the shine sweeps the label and the hairline border on a loop.
export default function ShinyDemo() {
  return (
    <div className="grid h-[200px] place-items-center rounded-[calc(var(--radius)*.7)]" style={{ background: 'radial-gradient(90% 80% at 50% 0%, color-mix(in srgb, var(--accent) 16%, var(--surface)), var(--bg))' }}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ShinyButton className="rounded-full px-7 py-3">Book a free survey</ShinyButton>
        <ShinyButton className="rounded-full px-7 py-3 [&>span:first-child]:!text-[var(--accent)]">See prices</ShinyButton>
      </div>
    </div>
  );
}
