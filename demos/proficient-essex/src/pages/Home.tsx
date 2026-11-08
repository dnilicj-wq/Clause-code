import { lazy, Suspense, useEffect } from 'react';
import Lenis from 'lenis';
import { Hero } from '@/src/pe/Hero';
import { Nav } from '@/src/pe/Nav';
import { QuoteProvider } from '@/src/pe/quote';

const Below = lazy(() => import('@/src/pe/Below'));

function useLenis() {
  useEffect(() => {
    if (matchMedia('(pointer:coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    let raf = 0;
    const f = (t: number) => { l.raf(t); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => { cancelAnimationFrame(raf); l.destroy(); };
  }, []);
}

export default function Home() {
  useLenis();
  return (
    <QuoteProvider>
      <Nav />
      <main className="relative">
        <Hero />
        <Suspense fallback={<div style={{ height: '100vh' }} />}><Below /></Suspense>
      </main>
    </QuoteProvider>
  );
}
