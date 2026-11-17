import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { IconDroplet, IconHomeHeart, IconPalette, IconShieldCheck, IconSparkles } from '@tabler/icons-react';
import Pour from './Pour';
import { faqs, reviews, site, wa, WA_HI, type Spec } from './data';

const Design = lazy(() => import('./Design'));
const Marble = lazy(() => import('./Marble'));
const Planner = lazy(() => import('./Planner'));

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll<HTMLElement>('[data-r]:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function Lazy({ children, h, id }: { children: React.ReactNode; h: number; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '800px 0px' });
    io.observe(ref.current!); return () => io.disconnect();
  }, []);
  return <div ref={ref} id={id} style={on ? undefined : { minHeight: h }}>{on && <Suspense fallback={<div style={{ minHeight: h }} />}>{children}</Suspense>}</div>;
}

// His wordmark from the Instagram flyer, redrawn flat: wide-set RESINOVA over gold hairlines and PREMIUM SURFACES.
export function Wordmark({ w = 150 }: { w?: number }) {
  return (
    <svg className="wm" width={w} height={w * 0.26} viewBox="0 0 300 78" role="img" aria-label="RESINOVA, Premium Surfaces">
      <defs>
        <linearGradient id="wmg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#F3E3B6" /><stop offset=".45" stopColor="#C9A86A" /><stop offset="1" stopColor="#8E713F" /></linearGradient>
      </defs>
      <text x="150" y="44" textAnchor="middle" fill="currentColor" style={{ font: '600 44px var(--disp)', letterSpacing: '7px' }}>RESINOVA</text>
      <path d="M8 62h66M226 62h66" stroke="url(#wmg)" strokeWidth="1.4" />
      <text x="150" y="66.5" textAnchor="middle" fill="url(#wmg)" style={{ font: '500 11.5px var(--body)', letterSpacing: '5.2px' }}>PREMIUM SURFACES</text>
    </svg>
  );
}

const SERVICES = [
  { id: 'floors', t: 'Floors', d: 'Metallic, flake and solid colour epoxy, polished concrete and microcement.', img: 'space-living', alt: 'a living room with a pearl and grey metallic resin floor' },
  { id: 'worktops', t: 'Worktops & tables', d: 'Resin countertops and epoxy table coatings, poured as one surface.', img: 'space-svc-worktop', alt: 'a kitchen island with a pearl, charcoal and gold metallic marble epoxy worktop' },
  { id: 'venetian', t: 'Venetian plaster', d: 'Marble-effect walls and ceilings, polished by hand, with gold leaf.', img: 'space-svc-venetian', alt: 'a lounge with polished Venetian marble walls and ceiling veined with gold leaf' },
  { id: 'walls', t: 'Walls', d: 'Resin and microcement wall finishes.', img: 'space-wall', alt: 'a charcoal Venetian plaster feature wall' },
  { id: 'bathrooms', t: 'Bathrooms', d: 'Microcement bathrooms, walls and floors.', img: 'space-bathroom', alt: 'a bathroom finished in stone-grey microcement' },
  { id: 'driveways', t: 'Driveways', d: 'Resin bound and resin bonded driveways.', img: 'space-driveway', alt: 'a house with a golden resin bound driveway' },
  { id: 'commercial', t: 'Commercial', d: 'Polyurethane commercial floors.', img: 'space-commercial', alt: 'a commercial space with a seamless grey resin floor' },
];

const WHY = [
  { I: IconDroplet, t: 'Waterproof & seamless', d: 'One continuous surface. No grout lines, no joins.' },
  { I: IconShieldCheck, t: 'Durable & long-lasting', d: 'Made for kitchens, garages and busy floors.' },
  { I: IconSparkles, t: 'Stunning finishes', d: 'Metallic, marble, flake, plaster or stone.' },
  { I: IconHomeHeart, t: 'Increases property value', d: 'A finish people notice the moment they walk in.' },
  { I: IconPalette, t: 'Bespoke designs', d: 'Your colours, your pattern. Never off the shelf.' },
];

const STEPS = [
  { t: 'Free quote', d: 'Send a photo on WhatsApp. We look at the space and talk through what you want.' },
  { t: 'Your design', d: 'Finish, colour and pattern, designed around your space and style.' },
  { t: 'Preparation', d: 'The surface is cleaned, repaired and primed so the resin bonds properly.' },
  { t: 'The pour', d: 'Laid by hand, layer by layer, and worked into its final pattern.' },
  { t: 'Cure & reveal', d: 'It sets, it’s sealed, and the space is handed back to you.' },
];

export default function Home() {
  useReveal();
  const [dock, setDock] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [swirled, setSwirled] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const steps = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting), { threshold: 0.12 });
    if (hero.current) io.observe(hero.current);
    // the "how it works" line fills as each step reaches the middle of the screen
    const so = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('lit', e.isIntersecting || e.boundingClientRect.top < 0)), { rootMargin: '0px 0px -45% 0px' });
    steps.current?.querySelectorAll('li').forEach((li) => so.observe(li));
    return () => { io.disconnect(); so.disconnect(); };
  }, []);

  const toQuote = (s: Spec) => { setSpec({ ...s }); document.getElementById('quote')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="nav-bar">
          <a className="logo" href="#top" aria-label="RESINOVA Premium Surfaces, back to top"><Wordmark w={132} /></a>
          <nav aria-label="Main">
            <a href="#services">Surfaces</a><a href="#design">Design yours</a><a href="#how">How it works</a><a href="#faq">FAQ</a>
          </nav>
          <a className="btn btn-gold sm nav-q" href="#quote">Free quote</a>
        </div>
      </header>

      <main id="main">
        {/* HERO: the pour */}
        <section id="top" ref={hero} className="hero">
          <Pour />
          <span className="chip-viz hero-chip">Visualisation</span>
          <div className="hero-copy">
            <p className="kicker">Premium resin surfaces · UK</p>
            <h1 className="h1">Floors, walls and worktops, <em>poured to be one of a kind.</em></h1>
            <p className="lede">Premium resin, microcement and Venetian plaster for homes, garages, kitchens and commercial spaces. UK-based, every design bespoke.</p>
            <div className="cta-row">
              <a className="btn btn-gold" href="#design">Design your surface</a>
              <a className="btn btn-glass" href={wa(WA_HI)} target="_blank" rel="noopener">WhatsApp us</a>
            </div>
          </div>
        </section>

        {/* SERVICES: gallery wall */}
        <section id="services" className="sec">
          <div className="sec-head" data-r>
            <h2 className="h2">Every surface, <em>one material.</em></h2>
            <p className="sub">Floors, walls, worktops, bathrooms and driveways, for homes and commercial spaces.</p>
          </div>
          <div className="wall">
            {SERVICES.map((s, i) => (
              <article className={`card card-${s.id}`} key={s.id} data-r style={{ ['--i' as string]: i % 3 }}>
                <div className="card-img">
                  <img src={`/viz/${s.img}-v1.webp`} srcSet={`/viz/${s.img}-sm-v1.webp 400w, /viz/${s.img}-v1.webp 900w`} sizes="(min-width: 900px) 40vw, 78vw" alt={`Example image: ${s.alt}`} width={900} height={1125} loading="lazy" decoding="async" />
                  <span className="ex">Example image</span>
                </div>
                <div className="card-txt"><h3 className="h3">{s.t}</h3><p>{s.d}</p></div>
              </article>
            ))}
          </div>
          <p className="swipe-note" aria-hidden="true">Swipe for all seven →</p>
        </section>

        {/* DESIGN YOUR SURFACE */}
        <section id="design" className="sec sec-deep">
          <div className="sec-head" data-r>
            <p className="kicker">Design your surface</p>
            <h2 className="h2">Pick a space. <em>Pour a finish.</em></h2>
            <p className="sub">Three taps and the surface re-pours in front of you. Then send the design to us for a quote.</p>
          </div>
          <Lazy h={900}><Design onQuote={toQuote} /></Lazy>
        </section>

        {/* WHY RESIN */}
        <section id="why" className="sec why">
          <div className="why-grid">
            <h2 className="h2" data-r>Why resin.</h2>
            <ul className="why-list">
              {WHY.map(({ I, t, d }, i) => (
                <li key={t} data-r style={{ ['--i' as string]: i }}>
                  <span className="why-ic" aria-hidden="true"><I size={26} stroke={1.4} /></span>
                  <div><h3>{t}</h3><p>{d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* EVERY POUR IS DIFFERENT */}
        <section id="every-pour" className={`marble ${swirled ? 'swirled' : ''}`}>
          <Lazy h={560}><Marble className="marble-gl" onTouched={() => setSwirled(true)} /></Lazy>
          <div className="marble-copy">
            <h2 className="h2">Every pour <em>is different.</em></h2>
            <p>No two RESINOVA floors are ever the same.</p>
            <p className="marble-hint" aria-hidden="true"><span className="hint-m">Move across it to swirl the pigment</span><span className="hint-t">Drag your finger to swirl the pigment</span></p>
          </div>
        </section>

        {/* WORK IN PROGRESS */}
        <section id="work" className="sec wip">
          <div className="wip-grid">
            <figure className="wip-vid" data-r>
              <video src="/client/reel-mid-pour-v1.mp4" poster="/client/reel-mid-pour-v1.webp" muted loop playsInline autoPlay preload="none" aria-label="RESINOVA’s latest project mid-pour: marble-effect walls and floor in white, grey and gold" />
              <figcaption>Latest project, mid-pour<small>Filmed on the job · from {site.handle}</small></figcaption>
            </figure>
            <div data-r style={{ ['--i' as string]: 1 }}>
              <p className="kicker">Meet RESINOVA</p>
              <h2 className="h2">Real pours, <em>filmed on the job.</em></h2>
              <p className="sub">RESINOVA is a new UK company doing one thing: premium resin surfaces, designed for each space. This is a live job, filmed mid-pour: marble-effect walls and floor in white, grey and gold. Finished projects go up here as they’re handed over.</p>
              <ul className="facts">
                <li><b>Based</b>UK-based</li>
                <li><b>For</b>Homes and commercial spaces</li>
                <li><b>Designs</b>Bespoke, every time</li>
                <li><b>Quotes</b>From a photo on WhatsApp</li>
              </ul>
              <a className="link" href={site.instagram} target="_blank" rel="noopener">Follow the work on Instagram →</a>
            </div>
          </div>
        </section>

        {reviews.length > 0 && (
          <section id="reviews" className="sec" aria-label="Reviews">
            <div className="pulls">
              {reviews.map((r) => <figure className="pull" key={r.who}><blockquote>“{r.text}”</blockquote><figcaption>{r.who} · {r.source}</figcaption></figure>)}
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section id="how" className="sec sec-deep">
          <div className="sec-head" data-r>
            <h2 className="h2">From first photo <em>to final reveal.</em></h2>
          </div>
          <ol className="steps" ref={steps}>
            {STEPS.map((s, i) => (
              <li key={s.t}><span className="st-n">{i + 1}</span><div><h3 className="h3">{s.t}</h3><p>{s.d}</p></div></li>
            ))}
          </ol>
        </section>

        {/* QUOTE */}
        <section id="quote" className="sec">
          <div className="quote-grid">
            <div data-r>
              <p className="kicker">Free quote · no prices online</p>
              <h2 className="h2">Tell us about <em>your space.</em></h2>
              <p className="sub">Four quick steps. It lands on our WhatsApp with everything filled in.</p>
              <ul className="contact">
                <li><a href={wa(WA_HI)} target="_blank" rel="noopener">Message us on WhatsApp</a></li>
                <li><a href={site.instagram} target="_blank" rel="noopener">Instagram {site.handle}</a></li>
                <li>UK-based</li>
              </ul>
            </div>
            <Lazy h={460}><Planner spec={spec} /></Lazy>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="sec faq">
          <div className="sec-head" data-r>
            <h2 className="h2">Good <em>questions.</em></h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div className={`qa ${faq === i ? 'open' : ''}`} key={f.q}>
                <button aria-expanded={faq === i} onClick={() => setFaq(faq === i ? null : i)}>{f.q}<span aria-hidden="true">+</span></button>
                <div className="qa-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* FINALE */}
        <section className="finale">
          <div className="fin-bg" aria-hidden="true"><img src="/posters/hero-end-d-v1.webp" alt="" width={1344} height={752} loading="lazy" decoding="async" /></div>
          <h2 className="h-fin" data-r>Poured once.<br /><em>Admired for years.</em></h2>
          <div className="cta-row center" data-r>
            <a className="btn btn-gold" href="#design">Design your surface</a>
            <a className="btn btn-glass" href={wa(WA_HI)} target="_blank" rel="noopener">WhatsApp us</a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand"><Wordmark w={200} /><p>UK-based · bespoke designs</p></div>
          <div><b>Talk to us</b><p><a href={wa(WA_HI)} target="_blank" rel="noopener">Message us on WhatsApp</a><br /><a href={site.instagram} target="_blank" rel="noopener">Instagram {site.handle}</a></p></div>
          <div><b>Surfaces</b><p>Floors · Walls · Worktops<br />Bathrooms · Driveways · Commercial</p></div>
        </div>
        <p className="foot-fine">Demo by Clientgateway. Images marked “Example image” or “Visualisation” are illustrations, not RESINOVA jobs. Not live, not indexed.</p>
      </footer>

      <nav className={`dock ${dock ? 'show' : ''}`} aria-label="Quick contact">
        <a href={`tel:+${site.phoneIntl}`}>Call</a>
        <a href={wa(WA_HI)} target="_blank" rel="noopener" className="dock-wa">WhatsApp</a>
        <a href="#quote">Quote</a>
      </nav>
    </>
  );
}
