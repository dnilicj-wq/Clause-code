import { FlowButton } from '@/components/library/flow-button/FlowButton';
// Hover (or tap) to see the flow. The second one is pinned in its hover state so the card shows both.
export default function FlowDemo() {
  return (
    <div className="grid h-[200px] place-items-center rounded-[calc(var(--radius)*.7)]" style={{ background: 'radial-gradient(90% 80% at 50% 0%, color-mix(in srgb, var(--accent) 12%, var(--surface)), var(--bg))' }}>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <FlowButton text="Book a free survey" href="#" />
        <FlowButton text="See your price" href="#" className="!rounded-[12px] !border-transparent !text-[var(--accent-ink)] [&>span:nth-of-type(2)]:!h-[260px] [&>span:nth-of-type(2)]:!w-[260px] [&>span:nth-of-type(2)]:!opacity-100 [&>span:first-of-type]:!translate-x-3 [&>svg:first-of-type]:!left-4 [&>svg]:!stroke-[var(--accent-ink)] [&>svg:last-of-type]:!right-[-25%]" />
      </div>
    </div>
  );
}
