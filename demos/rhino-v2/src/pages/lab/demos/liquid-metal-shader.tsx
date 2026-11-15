import { LiquidMetalShader } from '@/components/library/liquid-metal-shader/LiquidMetalShader';
import { DemoFrame } from '@/components/library/_shared/DemoFrame';

export default function Demo() {
  return (
    <DemoFrame kicker="Brand-colour metallic" title={<>Molten <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>metallic</span> epoxy</>}>
      <LiquidMetalShader />
    </DemoFrame>
  );
}
