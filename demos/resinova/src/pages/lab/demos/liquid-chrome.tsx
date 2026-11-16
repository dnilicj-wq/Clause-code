import { PresetLiquidChrome } from '@/components/library/liquid-chrome/PresetLiquidChrome';
import { DemoFrame } from '@/components/library/_shared/DemoFrame';

export default function Demo() {
  return (
    <DemoFrame kicker="Move or tap to ripple" title={<>Mirror gloss, <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>wall to wall.</span></>}>
      <PresetLiquidChrome />
    </DemoFrame>
  );
}
