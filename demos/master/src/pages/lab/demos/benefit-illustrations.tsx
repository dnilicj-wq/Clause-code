import { BenefitIllustrations } from '@/components/library/benefit-illustrations/BenefitIllustrations';
export default function Demo() {
  return <BenefitIllustrations heading="One seamless surface." items={[{ illo: 'seamless', title: 'No grout lines', text: 'One continuous surface with no joints.' }, { illo: 'wipe', title: 'Wipes clean', text: 'Once sealed, spills wipe away.' }, { illo: 'tyre', title: 'Hot tyres leave no mark', text: 'Epoxy example.' }, { illo: 'drain', title: 'Rain drains through', text: 'Resin bound example.' }]} />;
}
