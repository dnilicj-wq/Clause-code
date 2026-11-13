import { PerspectiveTunnelHero } from '@/components/library/perspective-tunnel-hero/PerspectiveTunnelHero';

export default function Demo() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-[calc(var(--radius)*.6)]">
      <PerspectiveTunnelHero kicker="Warehouses & units" title="Aisle after aisle" sub="Commercial floors with marked bays." />
    </div>
  );
}
