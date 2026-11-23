import { GlintButton } from '@/components/library/glint-button/GlintButton';
import { presets, presetVars } from '@/config/presets';

export default function GlintButtonDemo() {
  return (
    <div className="grid gap-3">
      <div className="flex h-[130px] items-center justify-center rounded-2xl" style={{ background: 'var(--bg)' }}>
        <GlintButton href="#price">Book a free survey</GlintButton>
      </div>
      <div className="flex h-[130px] items-center justify-center rounded-2xl" style={{ ...(presetVars(presets['cloud-dancer']) as React.CSSProperties), background: 'var(--bg)' }}>
        <GlintButton href="#price">Get your price</GlintButton>
      </div>
    </div>
  );
}
