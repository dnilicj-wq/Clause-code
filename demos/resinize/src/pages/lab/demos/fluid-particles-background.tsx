import { FluidParticlesBackground } from '@/components/library/fluid-particles-background/FluidParticlesBackground';
import { DemoFrame } from '@/components/library/_shared/DemoFrame';

export default function Demo() {
  return (
    <DemoFrame kicker="Flake blends" title={<>Every flake, <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)' }}>suspended.</span></>}>
      <FluidParticlesBackground />
    </DemoFrame>
  );
}
