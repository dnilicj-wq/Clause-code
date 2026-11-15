import { Proof, Services, Benefits, Promises, Process, Reviews, About, Areas, Faq, Finale, Footer, StickyBar } from './sections';
import { Design } from './Design';
import { Corridor } from './Corridor';

// Everything under the hero, lazy-loaded so the first chunk is just nav + hero.
export default function Below() {
  return (
    <>
      <Proof />
      <Services />
      <Design />
      <Benefits />
      <Promises />
      <Reviews />
      <Corridor />
      <Process />
      <About />
      <Areas />
      <Faq />
      <Finale />
      <Footer />
      <StickyBar />
    </>
  );
}
