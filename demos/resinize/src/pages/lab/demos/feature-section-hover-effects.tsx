import { IconRuler2, IconDroplet, IconFlame, IconSparkles, IconShieldCheck, IconCalendarTime, IconCurrencyPound, IconMessageCircle } from '@tabler/icons-react';
import { FeaturesSectionWithHoverEffects } from '@/components/library/feature-section-hover-effects/FeatureSectionHoverEffects';
import { FitWidth } from '@/components/library/_shared/FitWidth';

const features = [
  { title: 'Free survey', description: 'We measure, test the slab for damp and look at the cracks before we price.', icon: <IconRuler2 /> },
  { title: 'Diamond ground', description: 'Grinding opens the concrete so the primer can grip, instead of sitting on top.', icon: <IconSparkles /> },
  { title: 'Built up in coats', description: 'Primer, base, finish and topcoat, each one bonded to the last.', icon: <IconDroplet /> },
  { title: 'Made for hot tyres', description: 'A bonded system designed to resist the lifting that thin paint suffers.', icon: <IconFlame /> },
  { title: 'Price before contact', description: 'See a range on the site first. The survey fixes it in writing.', icon: <IconCurrencyPound /> },
  { title: 'A clear timeline', description: 'You know which days we are in, and when the car can go back.', icon: <IconCalendarTime /> },
  { title: 'Written guarantee', description: 'Set to the business’s own written guarantee terms.', icon: <IconShieldCheck /> },
  { title: 'Straight answers', description: 'Message a photo and get a straight reply, not a sales script.', icon: <IconMessageCircle /> },
];
export default function Demo() {
  return <FitWidth width={1000}><FeaturesSectionWithHoverEffects features={features} /></FitWidth>;
}
