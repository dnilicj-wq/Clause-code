import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/library/radar-chart/RadarChart';

// Illustrative only: relative, not measured. Labelled on screen.
const data = [
  { k: 'Hot tyres', resin: 5, paint: 1 },
  { k: 'Chemicals', resin: 5, paint: 2 },
  { k: 'Abrasion', resin: 4, paint: 2 },
  { k: 'Easy clean', resin: 5, paint: 3 },
  { k: 'Looks', resin: 5, paint: 2 },
];
export default function RadarDemo() {
  return (
    <div>
      <ChartContainer config={{ resin: { label: 'Resin system', color: 'var(--accent)' }, paint: { label: 'Floor paint', color: 'var(--muted)' } }} className="mx-auto aspect-square max-h-[260px]">
        <RadarChart data={data} outerRadius="68%">
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <PolarAngleAxis dataKey="k" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
          <PolarGrid stroke="var(--line)" />
          <Radar dataKey="paint" fill="var(--muted)" fillOpacity={0.25} stroke="var(--muted)" />
          <Radar dataKey="resin" fill="var(--accent)" fillOpacity={0.45} stroke="var(--accent)" />
        </RadarChart>
      </ChartContainer>
      <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>Illustrative comparison, not test data</p>
    </div>
  );
}
