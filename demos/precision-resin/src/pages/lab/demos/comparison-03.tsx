import { Comparison03 } from '@/components/library/comparison-03/Comparison03';
import { useSite } from '@/src/lib/ctx';

export default function Comparison03Demo() {
  const { trade } = useSite();
  return <Comparison03 eyebrow="Proper resin vs the shortcuts" heading="Three floors that look the same on day one" cols={trade.compare.cols} short={['Resin system', 'Floor paint', 'DIY kit']} rows={trade.compare.rows} note={trade.compare.note} cta={{ label: 'See your price', href: '/#price' }} />;
}
