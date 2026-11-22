import { Timeline } from '@/components/library/timeline/Timeline';
import { ScrollBox } from '../text-demo-helpers';
const steps: [string, string][] = [['Survey', 'Moisture test, measure, honest advice.'], ['Day 1', 'Grind, repair, prime.'], ['Day 2', 'Broadcast or metallic, then topcoat.'], ['After', 'Cure, then drive on.']];
export default function Demo() {
  return (
    <ScrollBox h={380}>
      {(ref) => <div className="[&>div>div:first-child]:!py-8"><Timeline container={ref as any} data={steps.map(([t, c]) => ({ title: t, content: <p className="text-[15px]" style={{ color: 'var(--muted)' }}>{c}</p> }))} /></div>}
    </ScrollBox>
  );
}
