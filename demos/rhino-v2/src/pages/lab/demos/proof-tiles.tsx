import { ProofTiles } from '@/components/library/proof-tiles/ProofTiles';
export default function Demo() {
  return <ProofTiles heading="…what it looks like, live." items={[{ illo: 'years', title: '20+ years', props: { value: '20+' } }, { illo: 'stars', title: '5.0 on Google', props: { value: '5.0' } }, { illo: 'prep', title: 'Ground prepared properly' }, { illo: 'shield', title: 'Fully insured' }, { illo: 'stamp', title: 'Written guarantee' }, { illo: 'visit', title: 'Survey at your home' }]} />;
}
