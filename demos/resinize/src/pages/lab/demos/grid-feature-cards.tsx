import { Ruler, Sparkles, Layers, Flame, Droplets, CalendarCheck } from 'lucide-react';
import { FeatureCard } from '@/components/library/grid-feature-cards/GridFeatureCards';

const features = [
  { title: 'Free survey', icon: Ruler, description: 'We measure and test the slab for damp before we price.' },
  { title: 'Diamond ground', icon: Sparkles, description: 'Opens the concrete so the primer grips instead of sitting on top.' },
  { title: 'Built up in coats', icon: Layers, description: 'Primer, base, finish and topcoat, each bonded to the last.' },
  { title: 'Made for hot tyres', icon: Flame, description: 'A bonded system designed to resist lifting under hot tyres.' },
  { title: 'Spills wipe off', icon: Droplets, description: 'Oil and brake fluid sit on the sealer instead of soaking in.' },
  { title: 'A clear timeline', icon: CalendarCheck, description: 'You know which days we are in and when the car goes back.' },
];
export default function Demo() {
  return (
    <div className="grid grid-cols-1 divide-x divide-y divide-dashed divide-line border border-dashed border-line sm:grid-cols-2 md:grid-cols-3">
      {features.map((f) => <FeatureCard key={f.title} feature={f} />)}
    </div>
  );
}
