import { useEffect, useState } from 'react';
import { IconPhone } from '@tabler/icons-react';
import { useSite } from '@/src/lib/ctx';

export function Nav() {
  const { site } = useSite();
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setSolid(e.intersectionRatio < 0.92), { threshold: [0.92] });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return (
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <nav className="nav__in" aria-label="Main">
        <a href="#top" className="nav__brand">
          <img src="/client/logo-96-v1.webp" alt="" width={36} height={36} />
          <span>The Resin Originals</span>
        </a>
        <div className="nav__links">
          <a href="#work">Floors</a>
          <a href="#finishes">Finishes</a>
          <a href="#plan">Plan your floor</a>
        </div>
        <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="nav__call">
          <IconPhone size={17} stroke={1.7} aria-hidden /><span className="max-sm:hidden">{site.phone}</span><span className="sm:hidden">Call</span>
        </a>
      </nav>
    </header>
  );
}
