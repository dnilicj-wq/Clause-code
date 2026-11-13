import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Burnish from './Burnish';
import { faqs, reviews, site, team, wa } from './data';

const Grout = lazy(() => import('./Grout'));
const Room = lazy(() => import('./Room'));
const Gallery = lazy(() => import('./Gallery'));
const Forms = lazy(() => import('./FormsBundle'));

const WA_HI = 'Hi Craig, I’ve just been looking at your website.';

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-r]');
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function Lazy({ children, h }: { children: React.ReactNode; h: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(ref.current!); return () => io.disconnect();
  }, []);
  return <div ref={ref} style={on ? undefined : { minHeight: h }}>{on && <Suspense fallback={<div style={{ minHeight: h }} />}>{children}</Suspense>}</div>;
}

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Lime & Marble">
      <img src="/client/logo-v1.webp" width={44} height={44} alt="" />
    </button>
  );
}

function Robot({ show, close }: { show: boolean; close: () => void }) {
  if (!show) return null;
  return (
    <div className="robot" role="status">
      <p>Beep boop. Only joking. It’s Craig. Fancy a brew at the showroom?</p>
      <div><a className="btn btn-lime sm" href="#showroom" onClick={close}>Book a visit</a><button className="btn btn-ghost sm" onClick={close}>Ha. No.</button></div>
    </div>
  );
}

export default function Home() {
  useReveal();
  const [polished, setPolished] = useState(false);
  const [dock, setDock] = useState(false);
  const [robot, setRobot] = useState(false);
  const taps = useRef<number[]>([]);
  const [rev, setRev] = useState(0);
  const [faq, setFaq] = useState<number | null>(0);
  const hero = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const [heroStart, setHeroStart] = useState(false);

  useEffect(() => {
    // start the trowel just as the loader lifts
    const t = setTimeout(() => setHeroStart(true), document.getElementById('boot') ? 950 : 150);
    const onCover = (e: Event) => { if ((e as CustomEvent).detail >= 0.6) setPolished(true); };
    addEventListener('cover', onCover);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setPolished(true);
    // dock after the hero
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting), { threshold: 0.15 });
    if (hero.current) io.observe(hero.current);
    // easter egg: type "robot"
    let buf = '';
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      buf = (buf + e.key.toLowerCase()).slice(-5); if (buf === 'robot') setRobot(true);
      if (e.key === 'Escape') setRobot(false);
    };
    addEventListener('keydown', key);
    // footer wordmark burnishes in with scroll
    let raf = 0;
    const scroll = () => {
      if (raf) return; raf = requestAnimationFrame(() => {
        raf = 0; const el = word.current; if (!el) return;
        const r = el.getBoundingClientRect(); const k = Math.min(1, Math.max(0, 1 - (r.top - innerHeight * 0.35) / (innerHeight * 0.65)));
        el.style.setProperty('--k', k.toFixed(3));
      });
    };
    addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => { clearTimeout(t); removeEventListener('cover', onCover); io.disconnect(); removeEventListener('keydown', key); removeEventListener('scroll', scroll); };
  }, []);

  const logoTap = () => {
    const now = Date.now(); taps.current = [...taps.current.filter((t) => now - t < 2500), now];
    if (taps.current.length >= 5) { setRobot(true); taps.current = []; } else if (scrollY > 40) scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="nav-pill">
          <Logo onClick={logoTap} />
          <nav aria-label="Main">
            <a href="#materials">Materials</a><a href="#work">Work</a><a href="#team">Team</a><a href="#showroom">Showroom</a>
          </nav>
          <span className="live"><i />Showroom by appointment</span>
          <a className="btn btn-ink sm nav-wa" href={wa(WA_HI)} target="_blank" rel="noopener" data-tip="Goes straight to Craig. Not a bot.">WhatsApp Craig</a>
        </div>
      </header>
      <Robot show={robot} close={() => setRobot(false)} />

      <main id="main">
        {/* HERO */}
        <section id="top" ref={hero} className={`hero ${polished ? 'polished' : ''}`}>
          <div className="hero-wall">
            <Burnish start={heroStart} className="hero-gl" label="A lime plaster wall being burnished to a marble shine" />
          </div>
          <div className="hero-copy">
            <p className="eyebrow"><span className="dot" />Microcement &amp; Venetian plaster · Chichester</p>
            <h1 className="h1"><span>Polished by hand.</span><span className="h1-b">Not by robots.</span></h1>
            <p className="lede">Seamless microcement and Venetian plaster, trowelled layer by layer by Craig and the team in Chichester.</p>
            <div className="cta-row">
              <a className="btn btn-lime" href="#showroom">Book a showroom visit</a>
              <a className="btn btn-glass" href={wa(WA_HI)} target="_blank" rel="noopener" data-tip="Goes straight to Craig. Not a bot.">WhatsApp Craig</a>
            </div>
            <p className="hint"><span className="hint-m">Move across the wall to give it another burnish.</span><span className="hint-t">Swipe sideways across the wall to burnish it.</span></p>
          </div>
        </section>

        {/* QUIET FLEX */}
        <section className="flex-band" aria-label="As featured on Grand Designs">
          <p data-r>As featured on <em>Grand Designs</em>: Venetian plaster and Forcrete bathroom walls.</p>
          <a href={site.episode} target="_blank" rel="noopener" data-r>Watch the episode <span aria-hidden="true">↗</span></a>
        </section>

        {/* TWO MATERIALS */}
        <section id="materials" className="sec">
          <div className="sec-head" data-r>
            <p className="kicker">Two materials, one craft</p>
            <h2 className="h2">Stone-like walls and floors, <em>without the stone.</em></h2>
          </div>
          <div className="split">
            <article className="mat" tabIndex={0} data-r>
              <img src="/client/shower-sm-v1.webp" alt="Walk-in shower finished in microcement" width={760} height={1013} loading="lazy" />
              <div className="mat-txt">
                <h3>Microcement</h3>
                <p>A thin, seamless coat of cement, fine aggregates, resins and pigments. Floors, walls, worktops, splashbacks, even furniture.</p>
                <p className="mat-more">No grout lines. Matte through to high gloss. Indoors and out.</p>
              </div>
            </article>
            <article className="mat" tabIndex={0} data-r>
              <img src="/client/lounge-corner-sm-v1.webp" alt="Lounge with soft polished plaster walls" width={760} height={1013} loading="lazy" />
              <div className="mat-txt">
                <h3>Venetian plaster</h3>
                <p>Slaked lime and marble dust, polished until it looks like marble or natural stone. Depth you want to touch.</p>
                <p className="mat-more">Cleans with mild soap and water. Custom pigments and textures.</p>
              </div>
            </article>
          </div>
          <div className="grout-wrap" data-r>
            <div className="sec-head tight">
              <p className="kicker">Lose the grout</p>
              <h3 className="h3">Drag across the tiles.</h3>
            </div>
            <Lazy h={560}><Grout /></Lazy>
          </div>
        </section>

        {/* WHERE IT GOES */}
        <section className="sec sec-paper2">
          <div className="sec-head" data-r>
            <p className="kicker">Where it goes</p>
            <h2 className="h2">Floor, walls, worktop. <em>Even the terrace.</em></h2>
          </div>
          <Lazy h={520}><Room /></Lazy>
          <p className="also" data-r>Also: bathrooms, kitchens, living areas, shops, cafés and offices, pool surrounds and patios.</p>
        </section>

        {/* WORK */}
        <section id="work" className="sec sec-dark">
          <div className="sec-head" data-r>
            <p className="kicker">The work</p>
            <h2 className="h2">Real jobs. <em>Real homes.</em></h2>
          </div>
          <Lazy h={520}><Gallery /></Lazy>
        </section>

        {/* MADE BY HAND */}
        <section className="sec process">
          <div className="sec-head" data-r>
            <p className="kicker">How it’s done</p>
            <h2 className="h2">Made by hand. <em>Layer after layer.</em></h2>
          </div>
          <ol className="stack">
            {[
              { n: '01', t: 'Prep', d: 'The surface is checked, repaired and primed so every coat has something to hold on to. Old tiles can often stay.', img: 'sanding' },
              { n: '02', t: 'Base coats', d: 'The first coats go on by trowel to build a strong, even body. On microcement, that’s the strength layer.', img: 'craig-skim' },
              { n: '03', t: 'Finish coat', d: 'Thin, fine coats, laid by hand. This is where the colour and the soft, cloudy movement come from.', img: 'craig-trowel' },
              { n: '04', t: 'Burnish & seal', d: 'Venetian plaster is burnished with a steel trowel until it shines. Microcement is sealed to protect it.', img: 'team-shower' },
            ].map((s, i) => (
              <li className="card" key={s.n} style={{ ['--i' as string]: i }}>
                <div className="card-txt"><span className="card-n">{s.n}</span><h3>{s.t}</h3><p>{s.d}</p></div>
                <img src={`/client/${s.img}${s.img === 'team-shower' ? '' : '-sm'}-v1.webp`} alt={`${s.t}: the Lime & Marble team at work`} loading="lazy" width={600} height={760} />
              </li>
            ))}
          </ol>
          <p className="fine center">A general guide to the craft. Every job’s different, and Craig talks you through yours.</p>
        </section>

        {/* TEAM */}
        <section id="team" className="sec sec-paper2">
          <div className="sec-head" data-r>
            <p className="kicker">Who’ll be in your house</p>
            <h2 className="h2">A family firm, <em>since 2017.</em></h2>
            <p className="sub">Founded by Craig, who’s still on the tools. Roots in traditional plastering.</p>
          </div>
          <div className="team">
            {team.map((m) => (
              <div className={`member ${m.key === 'craig' ? 'craig' : ''}`} key={m.key} data-r>
                <img src={`/client/${m.img}-v1.webp`} alt={`${m.name}, ${m.role}`} width={600} height={750} loading="lazy" />
                <div className="m-txt"><b>{m.name}</b><span>{m.role}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEWS */}
        <section className="sec reviews">
          <div className="sec-head" data-r>
            <p className="kicker">In their words</p>
            <h2 className="h2">“The floor is <em>a piece of art.</em>”</h2>
          </div>
          <div className="rstack" data-r>
            {reviews.map((r, i) => {
              const pos = (i - rev + reviews.length) % reviews.length;
              return (
                <figure key={r.who} className={`rcard p${pos}`} aria-hidden={pos !== 0} onClick={() => setRev((rev + 1) % reviews.length)}>
                  <blockquote>{r.text}</blockquote>
                  <figcaption><b>{r.who}</b><span>Client · from limeandmarble.com</span></figcaption>
                </figure>
              );
            })}
          </div>
          <div className="r-ui">
            <button className="btn btn-ghost sm" onClick={() => setRev((rev + 1) % reviews.length)}>Next review ({rev + 1}/{reviews.length})</button>
            {site.googleReviews && <a className="btn btn-ghost sm" href={site.googleReviews} target="_blank" rel="noopener">Google reviews ↗</a>}
          </div>
        </section>

        {/* SHOWROOM */}
        <section id="showroom" className="sec showroom">
          <div className="show-grid">
            <div className="show-l" data-r>
              <p className="kicker">The showroom</p>
              <h2 className="h2">Come and <em>touch it.</em></h2>
              <p className="sub">Photos only get you so far. Run your hand over the samples, see the finishes for real, and talk it through with Craig.</p>
              <address>
                {site.address.map((l) => <span key={l}>{l}</span>)}
              </address>
              <p className="show-hours"><span className="dot" />By appointment · Monday to Friday · 8am to 3pm</p>
              <a className="map" href={site.maps} target="_blank" rel="noopener" aria-label="Open the showroom in Google Maps">
                <img src="/client/map-v1.webp" alt="" width={768} height={768} loading="lazy" />
                <i className="pin" style={{ left: '44.1%', top: '61.5%' }} />
                <small>© OpenStreetMap contributors</small>
              </a>
              <p className="fine">Shared with sister company <a href={site.qube} target="_blank" rel="noopener">Qube</a>, who make bespoke furniture, so there’s plenty to look at.</p>
            </div>
            <div className="show-r" data-r>
              <Lazy h={520}><Forms which="booking" /></Lazy>
            </div>
          </div>
        </section>

        {/* PLANNER */}
        <section id="plan" className="sec sec-paper2">
          <div className="sec-head" data-r>
            <p className="kicker">Got a project?</p>
            <h2 className="h2">Tell Craig about it. <em>Five taps.</em></h2>
          </div>
          <Lazy h={420}><Forms which="planner" /></Lazy>
        </section>

        {/* FAQ */}
        <section className="sec faq">
          <div className="sec-head" data-r>
            <p className="kicker">Straight answers</p>
            <h2 className="h2">Questions people <em>actually ask.</em></h2>
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
          <div className="finale-glow" aria-hidden="true" />
          <h2 className="h-fin" data-r>Real wall. Real hands.<br /><em>Real person on the other end of the phone.</em></h2>
          <div className="cta-row center" data-r>
            <a className="btn btn-lime" href={wa(WA_HI)} target="_blank" rel="noopener" data-tip="Goes straight to Craig. Not a bot.">WhatsApp Craig</a>
            <a className="btn btn-glass" href="#showroom">Book a visit</a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="word" ref={word} aria-hidden="true">Lime &amp; Marble</div>
        <div className="foot-grid">
          <div><b>Lime &amp; Marble Ltd</b><p>Microcement and Venetian plaster installers. Family-run, Chichester, West Sussex.</p></div>
          <div><b>Visit</b><p>{site.address.join(', ')}<br />By appointment, Mon–Fri, 8am–3pm</p></div>
          <div><b>Talk</b><p><a href={`tel:+${site.phoneIntl}`}>{site.phone}</a><br /><a href={`mailto:${site.email}`}>{site.email}</a><br /><a href={site.instagram} target="_blank" rel="noopener">Instagram @limeandmarble</a><br /><a href={site.qube} target="_blank" rel="noopener">Qube furniture</a></p></div>
        </div>
        <p className="foot-fine">Demo site by Clientgateway. Photos and reviews from limeandmarble.com; illustrations are labelled. Not live, not indexed.</p>
      </footer>

      <nav className={`dock ${dock ? 'show' : ''}`} aria-label="Quick contact">
        <a href={`tel:+${site.phoneIntl}`}>Call</a>
        <a href={wa(WA_HI)} target="_blank" rel="noopener" className="dock-wa">WhatsApp</a>
        <a href="#showroom">Book visit</a>
      </nav>
    </>
  );
}
