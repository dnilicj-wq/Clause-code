// Everything below the hero, in its own chunk so the hero paints before this JS is parsed.
import { useState } from 'react';
import { Visualiser } from '@/components/signature/visualiser/Visualiser';
import { Services, Expand, Layers } from './Story';
import { Bento, Compare } from './Proof';
import { Quote } from './Quote';
import { Gallery, Reviews, Owner, Guarantee, Faq, Finale, Footer } from './Social';
import { Dock, CursorGlow } from './Chrome';

export default function Below() {
  const [vis, setVis] = useState(false);
  return (
    <>
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
      <Footer />
      <Dock />
      <CursorGlow />
      <Visualiser open={vis} onClose={() => setVis(false)} />
    </>
  );
}
