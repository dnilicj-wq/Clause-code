import { useState } from 'react';
import { FunnelChart } from '@/components/library/funnel-chart/FunnelChart';

// Illustrative, relative amounts (not measured): what each prep step takes off the slab before resin goes down.
const stages = [
  { key: 'Old slab', data: 100, note: 'Oil, tyre marks, laitance and dust sitting on top.' },
  { key: 'Degreased', data: 62, note: 'Oil spots lifted so the grinder does not smear them in.' },
  { key: 'Ground', data: 18, note: 'Diamond grinding opens the pores and takes off the weak top skin.' },
  { key: 'Vacuumed', data: 6, note: 'Dust out of the pores, or the primer bonds to dust.' },
  { key: 'Primed', data: 1, note: 'Sealed. Nothing left between the slab and the resin.' },
];
export default function FunnelDemo() {
  const [a, setA] = useState<number | null>(null);
  const s = stages[a ?? 0];
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>Prep, step by step</p>
      <h3 className="mb-5 mt-1 font-display text-xl font-semibold">What stands between the slab and the resin</h3>
      <FunnelChart data={stages} height={220} format={(v) => `${v}`} onActive={setA} />
      <p className="mt-4 min-h-[40px] text-sm"><span className="font-semibold">{s.key}.</span> <span style={{ color: 'var(--muted)' }}>{s.note}</span></p>
      <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>Illustrative, relative amounts of surface contamination. Not measured data.</p>
    </div>
  );
}
