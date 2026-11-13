import { AetherFlowHero } from '@/components/library/aether-flow-hero/AetherFlowHero';

export default function Demo() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-[calc(var(--radius)*.6)]">
      <AetherFlowHero badge="Commercial & warehouse" title="Floors for busy warehouses" cta="Book a free survey" />
    </div>
  );
}
