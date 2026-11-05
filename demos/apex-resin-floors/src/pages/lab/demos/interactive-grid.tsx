import { InteractiveGrid } from '@/components/library/interactive-grid/InteractiveGrid';
import { DemoFrame } from '@/components/library/_shared/DemoFrame';

export default function Demo() {
  return (
    <DemoFrame kicker="Move your cursor" title="Ground flat. Laser level." sub="A survey-grid background for the process section.">
      <InteractiveGrid />
    </DemoFrame>
  );
}
