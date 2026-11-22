import PartitionBar, { PartitionBarSegment, PartitionBarSegmentTitle, PartitionBarSegmentValue } from '@/components/library/partition-bar/PartitionBar';

// Example split only. A business swaps in its own breakdown; nothing here is a real price.
const parts = [
  { t: 'Prep', v: 'Grind, repair, clean', n: 30, variant: 'secondary' as const },
  { t: 'Materials', v: 'Primer, base, flake, topcoat', n: 40, variant: 'default' as const },
  { t: 'Labour', v: 'Usually 2 days on site', n: 30, variant: 'muted' as const },
];
export default function PartitionBarDemo() {
  return (
    <div className="py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>Where the money goes</p>
      <h3 className="mt-1 font-display text-xl font-semibold">Most of the cost is prep and materials</h3>
      <PartitionBar size="md" gap={1.5} className="mt-6">
        {parts.map((p) => (
          <PartitionBarSegment key={p.t} num={p.n} variant={p.variant} alignment="left">
            <PartitionBarSegmentTitle>{p.t} <span className="tabular-nums">{p.n}%</span></PartitionBarSegmentTitle>
            {p.v && <PartitionBarSegmentValue>{p.v}</PartitionBarSegmentValue>}
          </PartitionBarSegment>
        ))}
      </PartitionBar>
      <p className="mt-5 text-xs" style={{ color: 'var(--muted)' }}>Example split for a resin floor, not a quote.</p>
    </div>
  );
}
