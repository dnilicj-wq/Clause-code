import { Timer } from 'lucide-react';
import { DitherGrowthChart } from '@/components/library/dither-growth-chart/DitherGrowthChart';

// Illustrative cure curve (smooth exponential approach), not product data. Shape only: fast early, slow finish.
const cure = (days: number) => 100 * (1 - Math.exp(-days / 1.6));
const mk = (n: number, span: number, lab: (d: number) => string) => {
  const ds = Array.from({ length: n }, (_, i) => (i / (n - 1)) * span);
  return { data: ds.map((d) => Math.round(cure(d) * 10) / 10), labels: ds.map(lab) };
};
const ranges = [
  { name: '24H', ...mk(25, 1, (d) => `${Math.round(d * 24)}h`) },
  { name: '3D', ...mk(37, 3, (d) => `${d.toFixed(1)} days`) },
  { name: '7D', ...mk(43, 7, (d) => `${d.toFixed(1)} days`) },
];
export default function DitherDemo() {
  return (
    <DitherGrowthChart ranges={ranges} defaultRange={2} yMax={100} yFormat={(v) => `${Math.round(v)}%`}
      headline={(v) => `${Math.round(v)}% cured`} subtitle="How a resin floor hardens after the pour" icon={<Timer className="h-5 w-5" />}
      badge="Illustrative" tooltip={(v) => `${Math.round(v)}% of full cure`}
      caption="Illustrative curve, not data for any product. Real cure times depend on the system and the temperature." />
  );
}
