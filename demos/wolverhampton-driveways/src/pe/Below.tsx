import { Proof, WhyResin, Services, Process, Reviews, GuaranteeAreas, Faq, Footer, StickyBar } from './sections';
import { Design } from './Design';
import { Corridor } from './Corridor';
import { Compare } from './Compare';

// Everything under the hero, lazy-loaded so the first chunk is just nav + hero.
export default function Below() {
  return (
    <>
      <Proof />
      <Design />
      <Compare />
      <Services />
      <Corridor />
      <GuaranteeAreas />
      <Reviews />
      <WhyResin />
      <Process />
      <Faq />
      <Footer />
      <StickyBar />
    </>
  );
}
