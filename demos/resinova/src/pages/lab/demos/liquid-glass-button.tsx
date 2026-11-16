import { LiquidButton } from '@/components/library/liquid-glass-button/LiquidGlassButton';

// Glass needs something behind it to bend: shown over a metallic floor still, the way it sits on a hero.
export default function LiquidGlassDemo() {
  return (
    <div className="relative grid h-[220px] place-items-center overflow-hidden rounded-[calc(var(--radius)*.7)]">
      <img src="/demo/look-copper-metallic-v2.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.35))' }} />
      <div className="relative flex flex-wrap items-center justify-center gap-4">
        <LiquidButton className="rounded-full font-semibold text-white" tone="dark">See finishes</LiquidButton>
        <LiquidButton className="rounded-full font-semibold text-white" size="xl" tone="dark">Book a survey</LiquidButton>
      </div>
      <span className="ex-tag left-3 top-3">Example image</span>
    </div>
  );
}
