import { FitWidth } from '@/components/library/_shared/FitWidth';
import { Features8 } from '@/components/library/features-8/Features8';

export default function Demo() {
  return (
    <FitWidth width={1080}>
      <Features8 copy={{
        big: '4', bigLabel: 'Finish types', chartLabel: 'Coat build-up',
        cards: [
          { title: 'Tested before we quote', text: 'We check moisture and cracks on a free survey, so the price is real.' },
          { title: 'Built up in coats', text: 'Primer, base, finish and topcoat, each one bonded to the last.' },
          { title: 'Made for hot tyres', text: 'A bonded, built-up system designed to resist lifting under hot tyres.' },
          { title: 'From survey to finished floor', text: 'One team from the first visit to the topcoat.' },
        ],
        steps: [
          { label: 'Survey', img: '/demo/tex-slab-v1.webp' },
          { label: 'Grind & prime', img: '/demo/tex-primer-v1.webp' },
          { label: 'Finish & topcoat', img: '/demo/look-graphite-flake-v2.webp' },
        ],
      }} />
    </FitWidth>
  );
}
