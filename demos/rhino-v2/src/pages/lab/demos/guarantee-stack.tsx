import { GuaranteeStack } from '@/components/library/guarantee-stack/GuaranteeStack';
export default function Demo() {
  return <GuaranteeStack heading="Sample promises (demo only)." items={[{ title: 'Sample promise one', text: 'Only use promises the client really makes.' }, { title: 'Sample promise two', text: 'Fewer than two: the section is left out.' }, { title: 'Sample promise three', text: 'Accent light runs along the bottom as you scroll.' }]} />;
}
