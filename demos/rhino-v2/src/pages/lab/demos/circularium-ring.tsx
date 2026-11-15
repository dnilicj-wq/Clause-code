import { useMemo } from 'react';
import { CirculariumRing } from '@/components/library/circularium-ring/CirculariumRing';
import { useSite } from '@/src/lib/ctx';

// Example week only (not data from any business): how many minutes per hour a busy workshop floor is in use.
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => '#' + hex(a).map((x, i) => Math.round(x + (hex(b)[i] - x) * t).toString(16).padStart(2, '0')).join('');

const week = Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => {
  const wk = d < 5, sat = d === 5;
  const open = wk ? h >= 8 && h < 18 : sat ? h >= 9 && h < 13 : false;
  if (!open) return h === 7 && wk ? 12 : 0;
  const lunch = h === 12 ? 0.45 : 1;
  const wobble = 0.85 + 0.15 * Math.sin(d * 1.7 + h * 0.9);
  return Math.round((wk ? 52 : 34) * lunch * wobble);
}));

export default function RingDemo() {
  const { preset } = useSite();
  const pal = useMemo(() => [0.3, 0.55, 0.8, 1].map((t) => mix(preset.bg, preset.accent, t)), [preset]);
  return (
    <div>
      <CirculariumRing data={week} palette={pal} defaultView="3d" title="A week on a workshop floor" subtitle="Example data · rings are days, slices are hours"
        unit="min in use" legendLabels={['Quiet', 'Busy']} levelNames={['Quiet', 'Light use', 'In use', 'Busy', 'Flat out']} ariaLabel="Example week of floor use by hour"
        hint="Monday innermost · drag to orbit" />
      <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>Example data, not from a real business. Shows why a working floor needs a hard-wearing system.</p>
    </div>
  );
}
