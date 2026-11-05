import { lazy, Suspense } from 'react';
import { PourHero } from '@/components/signature/pour-hero/PourHero';
import { Nav, useLenis } from '../sections/Chrome';

const Below = lazy(() => import('../sections/Below'));

// Default epoxy demo. Order follows the V3 brief (max 15 phone screens).
// Hero + nav ship in the first chunk; the rest streams in straight after (keeps LCP on the hero).
export default function Home() {
  useLenis();
  return (
    <>
      <Nav />
      <main className="grain relative">
        <PourHero />
        <Suspense fallback={<div style={{ height: '100vh' }} />}>
          <Below />
        </Suspense>
      </main>
    </>
  );
}
