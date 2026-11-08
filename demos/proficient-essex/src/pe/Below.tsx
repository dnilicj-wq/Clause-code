import { Proof, WhyResin, Services, Process, Reviews, GuaranteeAreas, Faq, Footer, StickyBar } from './sections';
import { Design } from './Design';
import { Corridor } from './Corridor';

// Everything under the hero, lazy-loaded so the first chunk is just nav + hero.
export default function Below() {
  return (
    <>
      <Proof />
      <Design />
      <Corridor />
      <WhyResin />
      <Services />
      <Process />
      <Reviews />
      <GuaranteeAreas />
      <Faq />
      <Footer />
      <StickyBar />
    </>
  );
}
