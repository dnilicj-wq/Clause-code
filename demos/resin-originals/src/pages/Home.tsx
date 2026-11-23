import { lazy, Suspense, useEffect, useState } from 'react';
import { Nav } from '../sections/Nav';
import { Hero } from '../sections/Hero';

const Below = lazy(() => import('../sections/Below'));

// The Resin Originals (Dean). Hero + nav ship first; everything else streams in after (keeps LCP on the hero).
export default function Home() {
  // load the rest after the page's load event so it never competes with the hero for LCP
  const [rest, setRest] = useState(false);
  useEffect(() => {
    const go = () => setTimeout(() => setRest(true), 0);
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
    return () => removeEventListener('load', go);
  }, []);
  return (
    <>
      <Nav />
      <main className="grain relative">
        <Hero />
        <Suspense fallback={<div style={{ height: '100vh' }} />}>{rest ? <Below /> : <div style={{ height: '100vh' }} />}</Suspense>
      </main>
    </>
  );
}
