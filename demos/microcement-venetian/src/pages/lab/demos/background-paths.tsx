import { BackgroundPaths } from '@/components/library/background-paths/BackgroundPaths';

export default function Demo() {
  return (
    <div className="relative h-[260px] overflow-hidden rounded-[calc(var(--radius)*.6)] [&>div]:h-full">
      <BackgroundPaths title="Metallic swirl floors" cta="See the finishes" />
    </div>
  );
}
