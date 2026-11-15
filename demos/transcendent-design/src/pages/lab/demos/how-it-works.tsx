import { MessageSquareText, Ruler, Sparkles } from 'lucide-react';
import { HowItWorks } from '@/components/library/how-it-works/HowItWorks';
import { FitWidth } from '@/components/library/_shared/FitWidth';

const steps = [
  { icon: <MessageSquareText className="h-6 w-6" />, title: 'Send a photo', description: 'WhatsApp or the form. Any phone photo of the floor is fine.', benefits: ['A rough price range back', 'No call centre', 'No obligation'] },
  { icon: <Ruler className="h-6 w-6" />, title: 'Free survey', description: 'We measure, check for damp and look at the cracks.', benefits: ['Moisture test on the slab', 'Pick your finish in person', 'Fixed price in writing'] },
  { icon: <Sparkles className="h-6 w-6" />, title: 'We lay the floor', description: 'Grind, prime, build the coats and seal, then let it cure.', benefits: ['Agreed days and times', 'Each coat explained', 'Cure times before you drive on'] },
];
export default function Demo() {
  return <FitWidth width={1000}><HowItWorks heading="How it works" intro="Three steps from a phone photo to a finished floor." steps={steps} className="py-8 sm:py-10" /></FitWidth>;
}
