import { useState } from 'react';
import { PourHero } from '@/components/signature/pour-hero/PourHero';
import { Visualiser } from '@/components/signature/visualiser/Visualiser';
import { Nav, Dock, CursorGlow, useLenis } from '../sections/Chrome';
import { Services, Expand, Layers } from '../sections/Story';
import { Bento, Compare } from '../sections/Proof';
import { Quote } from '../sections/Quote';
import { Gallery, Reviews, Owner, Guarantee, Faq, Finale, Footer } from '../sections/Social';

// Default epoxy demo. Order follows the V3 brief (max 15 phone screens).
export default function Home() {
  useLenis();
  const [vis, setVis] = useState(false);
  return (
    <>
      <CursorGlow />
      <Nav />
      <main className="grain relative">
        <PourHero />
        <Services />
        <Expand onVisualise={() => setVis(true)} />
        <Layers />
        <Bento />
        <Compare />
        <Quote />
        <Gallery />
        <Reviews />
        <Owner />
        <Guarantee />
        <Faq />
        <Finale />
      </main>
      <Footer />
      <Dock />
      <Visualiser open={vis} onClose={() => setVis(false)} />
    </>
  );
}
