import { LuminousTopography } from '@/components/library/luminous-topography/LuminousTopography';
import { DemoFrame } from '@/components/library/_shared/DemoFrame';

export default function Demo() {
  return (
    <DemoFrame kicker="Self-levelling" title={<>Every ridge, <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)' }}>levelled out.</span></>}>
      <LuminousTopography />
    </DemoFrame>
  );
}
