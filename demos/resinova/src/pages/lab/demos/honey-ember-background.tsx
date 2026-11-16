import { HoneyEmberBackground } from '@/components/library/honey-ember-background/HoneyEmberBackground';
import { DemoFrame } from '@/components/library/_shared/DemoFrame';

export default function Demo() {
  return (
    <DemoFrame kicker="Amber resin" title={<>Warm floors, <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)' }}>glowing finish.</span></>}>
      <HoneyEmberBackground />
    </DemoFrame>
  );
}
