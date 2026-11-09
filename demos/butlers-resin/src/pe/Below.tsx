import { Proof, BeforeAfter, Services, Process, Reviews, Areas, Faq, Footer, StickyBar } from './sections';
import { Survey } from './Survey';
import { Corridor } from './Corridor';

// Everything under the hero, lazy-loaded so the first chunk is just nav + hero.
export default function Below() {
  return (
    <>
      <Proof />
      <BeforeAfter />
      <Services />
      <Survey />
      <Corridor />
      <Process />
      <Reviews />
      <Areas />
      <Faq />
      <Footer />
      <StickyBar />
    </>
  );
}
