import { Proof, WhyResin, Services, Floors, Story, Process, Reviews, Faq, Finale, Footer, StickyBar } from './sections';
import { Design } from './Design';
import { Corridor } from './Corridor';

// Everything under the hero, lazy-loaded so the first chunk is just nav + hero.
export default function Below() {
  return (
    <>
      <Proof />
      <Services />
      <Corridor />
      <Floors />
      <Story />
      <Reviews />
      <WhyResin />
      <Process />
      <Design />
      <Faq />
      <Finale />
      <Footer />
      <StickyBar />
    </>
  );
}
