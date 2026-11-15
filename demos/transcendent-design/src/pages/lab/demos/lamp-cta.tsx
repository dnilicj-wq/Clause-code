import { LampCta } from '@/components/library/lamp-cta/LampCta';
import { presets, presetVars } from '@/config/presets';
import { useSite } from '@/src/lib/ctx';

// Lamp CTA at real size (scaled into the card): the live preset on top, Cloud Dancer (light) below.
function Frame({ vars, tone, label }: { vars?: Record<string, string>; tone: 'dark' | 'light'; label: string }) {
  return (
    <div className="relative h-[300px] overflow-hidden rounded-2xl" style={vars as React.CSSProperties}>
      <div style={{ width: '250%', marginLeft: '-75%', transform: 'scale(.4)', transformOrigin: 'top center' }}>
        <LampCta heading="Let's see your floor." subline="A free survey: we measure, test the slab and give you a fixed written price."
          primaryLabel="Book a free survey" primaryHref="#price" whatsappHref="https://wa.me/447700900000" tone={tone} />
      </div>
      <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px]" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>{label}</span>
    </div>
  );
}

export default function LampCtaDemo() {
  const { preset } = useSite();
  const cd = presets['cloud-dancer'];
  return (
    <div className="grid gap-3">
      <Frame tone={preset.dark ? 'dark' : 'light'} label={preset.name} />
      <Frame vars={presetVars(cd)} tone="light" label="Cloud Dancer (light)" />
    </div>
  );
}
