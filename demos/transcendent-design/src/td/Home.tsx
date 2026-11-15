import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Burnish from './Burnish';
import { faqs, reviews, services, site, wa } from './data';

const BeforeAfter = lazy(() => import('./BeforeAfter'));
const Estimator = lazy(() => import('./Estimator'));
const Gallery = lazy(() => import('./Gallery'));
const Forms = lazy(() => import('./FormsBundle'));

const WA_HI = 'Hi Kieran, I’ve just been looking at your website.';
const MATS = ['Microcement', 'Metallic epoxy', 'Venetian plaster'] as const;

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

export function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Transcendent Design, back to top">
      <img src="/client/logo-v1.webp" width={44} height={44} alt="" />
    </a>
  );
}

export default function Home() {
  useReveal();
  const [polished, setPolished] = useState(false);
  const [mat, setMat] = useState(0);
  const [dock, setDock] = useState(false);
  const [rev, setRev] = useState(0);
  const [faq, setFaq] = useState<number | null>(0);
  const hero = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const [heroStart, setHeroStart] = useState(false);
  const picked = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroStart(true), document.getElementById('boot') ? 850 : 150);
    const onCover = (e: Event) => { if ((e as CustomEvent).detail >= 0.6) setPolished(true); };
    addEventListener('cover', onCover);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) setPolished(true);
    // idle: the finish cycles through their three materials until someone picks one
    const cyc = reduce ? 0 : window.setInterval(() => { if (!picked.current && scrollY < innerHeight * 0.6) setMat((m) => (m + 1) % 3); }, 4200);
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting), { threshold: 0.15 });
    if (hero.current) io.observe(hero.current);
    let raf = 0;
    const scroll = () => {
      if (raf) return; raf = requestAnimationFrame(() => {
        raf = 0; const el = word.current; if (!el) return;
        const r = el.getBoundingClientRect(); const k = Math.min(1, Math.max(0, 1 - (r.top - innerHeight * 0.35) / (innerHeight * 0.65)));
        el.style.setProperty('--k', k.toFixed(3));
      });
    };
    addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => { clearTimeout(t); clearInterval(cyc); removeEventListener('cover', onCover); io.disconnect(); removeEventListener('scroll', scroll); };
  }, []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="nav-pill">
          <Logo />
          <nav aria-label="Main">
            <a href="#finishes">Finishes</a><a href="#work">Work</a><a href="#price">Price</a><a href="#consult">Contact</a>
          </nav>
          <span className="live"><i />Mon–Sat 9am–5pm</span>
          <a className="btn btn-gold sm nav-wa" href={wa(WA_HI)} target="_blank" rel="noopener" data-tip="Goes straight to Kieran’s phone.">WhatsApp Kieran</a>
        </div>
      </header>

      <main id="main">
        {/* HERO */}
        <section id="top" ref={hero} className={`hero ${polished ? 'polished' : ''}`}>
          <div className="hero-wall">
            <Burnish start={heroStart} mat={mat} className="hero-gl" label={`A bare concrete floor being trowelled into ${MATS[mat].toLowerCase()}`} />
          </div>
          <div className="hero-copy">
            <p className="eyebrow"><span className="dot" />Seamless surface specialists · Greater Manchester</p>
            <h1 className="h1"><span>One surface.</span><span className="h1-b">No joins.</span></h1>
            <p className="lede">Microcement, epoxy resin and Venetian plaster for floors, walls and wet rooms. Laid by hand by Kieran &amp; Josh.</p>
            <div className="mats" role="radiogroup" aria-label="Show the floor in">
              {MATS.map((m, i) => (
                <button key={m} role="radio" aria-checked={mat === i} className={`mat-chip ${mat === i ? 'on' : ''}`} onClick={() => { picked.current = true; setMat(i); }}>{m}</button>
              ))}
            </div>
            <div className="cta-row">
              <a className="btn btn-gold" href="#consult">Book a free consultation</a>
              <a className="btn btn-glass" href={wa(WA_HI)} target="_blank" rel="noopener">WhatsApp Kieran</a>
            </div>
            <p className="hint"><span className="hint-m">Move across the floor to put a shine on it. Illustration.</span><span className="hint-t">Swipe across the floor to put a shine on it. Illustration.</span></p>
          </div>
        </section>

        {/* PROOF BAND */}
        <section className="flex-band" aria-label="Why people pick them">
          <div className="band-track">
            {[0, 1].map((n) => (
              <p key={n} aria-hidden={n === 1}>
                <span><b>5.0</b> on Google · 8 reviews</span><i>◆</i>
                <span>Licensed <b>Topcret</b> installers</span><i>◆</i>
                <span><b>10+ years</b> in microcement &amp; resin</span><i>◆</i>
                <span>Samples made up <b>before</b> you choose</span><i>◆</i>
              </p>
            ))}
          </div>
        </section>

        {/* FINISHES */}
        <section id="finishes" className="sec">
          <div className="sec-head" data-r>
            <p className="kicker">What they lay</p>
            <h2 className="h2">Six finishes. <em>Zero grout lines.</em></h2>
          </div>
          <div className="svc">
            {services.map((s, i) => (
              <article className={`svc-card ${s.img ? '' : 'svc-ill'}`} key={s.k} tabIndex={0} data-r style={{ ['--i' as string]: i }}>
                {s.img
                  ? <img src={`/client/${s.img}-sm-v1.webp`} alt="" width={760} height={570} loading="lazy" />
                  : <img src="/posters/venetian-v1.webp" alt="" width={760} height={570} loading="lazy" />}
                {!s.img && <span className="tag">Illustration</span>}
                <div className="svc-txt">
                  <span className="svc-n">0{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* BEFORE / AFTER */}
        <section className="sec sec-paper2">
          <div className="sec-head" data-r>
            <p className="kicker">Before &amp; after</p>
            <h2 className="h2">Same room. <em>Drag to see it.</em></h2>
          </div>
          <Lazy h={620}><BeforeAfter /></Lazy>
        </section>

        {/* WORK */}
        <section id="work" className="sec sec-dark">
          <div className="sec-head" data-r>
            <p className="kicker">The work</p>
            <h2 className="h2">Real jobs. <em>Their photos.</em></h2>
          </div>
          <Lazy h={520}><Gallery /></Lazy>
        </section>

        {/* PRICE */}
        <section id="price" className="sec">
          <div className="sec-head" data-r>
            <p className="kicker">Straight on price</p>
            <h2 className="h2">What would my floor <em>roughly cost?</em></h2>
          </div>
          <Lazy h={420}><Estimator /></Lazy>
        </section>

        {/* PROCESS */}
        <section className="sec process sec-paper2">
          <div className="sec-head" data-r>
            <p className="kicker">How a job runs</p>
            <h2 className="h2">Samples first. <em>Then the floor.</em></h2>
          </div>
          <ol className="stack">
            {[
              { n: '01', t: 'Samples & colours', d: 'They make up samples and show you colours and design options before anything is decided.', img: 'vanity' },
              { n: '02', t: 'Prep', d: 'The base is checked, cleaned and primed. Old tiles can often stay, as long as they’re solid and well bonded.', img: 'on-site' },
              { n: '03', t: 'Laid by hand', d: 'Thin coats, about 3mm in all, trowelled on by their own specialist team, start to finish.', img: 'shower-lit' },
              { n: '04', t: 'Sealed', d: 'Sealed to protect it, in matte, satin or gloss. Then it’s yours.', img: 'metallic-kitchen' },
            ].map((s, i) => (
              <li className="card" key={s.n} style={{ ['--i' as string]: i }}>
                <div className="card-txt"><span className="card-n">{s.n}</span><h3>{s.t}</h3><p>{s.d}</p></div>
                <img src={`/client/${s.img}-sm-v1.webp`} alt={`${s.t}: a Transcendent Design job`} loading="lazy" width={600} height={760} />
              </li>
            ))}
          </ol>
        </section>

        {/* KIERAN & JOSH */}
        <section id="team" className="sec duo">
          <div className="duo-grid">
            <div className="duo-img" data-r>
              <img src="/client/on-site-sm-v1.webp" alt="Transcendent Design laying a floor on site" width={760} height={1140} loading="lazy" />
              <span className="tag">On site</span>
            </div>
            <div className="duo-txt" data-r>
              <p className="kicker">Who’ll be in your house</p>
              <h2 className="h2">Kieran <em>&amp;</em> Josh.</h2>
              <p className="sub">Every project is installed by their own specialist team, from consultation through to aftercare. Their reviews keep saying the same thing: clean, tidy, honest advice.</p>
              <div className="people">
                <a className="person" href={wa(WA_HI)} target="_blank" rel="noopener"><b>Kieran</b><span>{site.phone}</span><em>WhatsApp →</em></a>
                <a className="person" href={wa('Hi Josh, I’ve just been looking at your website.', site.phone2Intl)} target="_blank" rel="noopener"><b>Josh</b><span>{site.phone2}</span><em>WhatsApp →</em></a>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="sec reviews">
          <div className="sec-head" data-r>
            <p className="kicker">5.0 on Google · 8 reviews</p>
            <h2 className="h2">“Pure craftsmen <em>in their trade.</em>”</h2>
          </div>
          <div className="rstack" data-r>
            {reviews.map((r, i) => {
              const pos = (i - rev + reviews.length) % reviews.length;
              return (
                <figure key={r.who} className={`rcard p${Math.min(pos, 2)}`} aria-hidden={pos !== 0} onClick={() => setRev((rev + 1) % reviews.length)}>
                  <span className="stars" aria-label="5 stars">★★★★★</span>
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption><b>{r.who}</b><span>Google review · shown on transcendentdesignuk.com</span></figcaption>
                </figure>
              );
            })}
          </div>
          <div className="r-ui">
            <button className="btn btn-ghost sm" onClick={() => setRev((rev + 1) % reviews.length)}>Next review ({rev + 1}/{reviews.length})</button>
          </div>
        </section>

        {/* CONSULTATION */}
        <section id="consult" className="sec showroom">
          <div className="show-grid">
            <div className="show-l" data-r>
              <p className="kicker">Free consultation</p>
              <h2 className="h2">Let’s talk about <em>your project.</em></h2>
              <p className="sub">Based in Greater Manchester. Jobs done across the North West and the UK, from Liverpool and Bury to the Lake District, Belfast and Dundalk.</p>
              <address>{site.address.map((l) => <span key={l}>{l}</span>)}</address>
              <p className="show-hours"><span className="dot" />Mon–Sat 9am–5pm · Sun 9am–2pm</p>
              <div className="people">
                <a className="person" href={`tel:+${site.phoneIntl}`}><b>Kieran</b><span>{site.phone}</span><em>Call →</em></a>
                <a className="person" href={`tel:+${site.phone2Intl}`}><b>Josh</b><span>{site.phone2}</span><em>Call →</em></a>
              </div>
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
            <h2 className="h2">Tell them about it. <em>Five quick questions.</em></h2>
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

        {/* FINALE (lamp CTA) */}
        <section className="finale">
          <div className="finale-glow" aria-hidden="true" />
          <h2 className="h-fin" data-r>No grout. No joins.<br /><em>Kieran &amp; Josh on the other end of the phone.</em></h2>
          <div className="cta-row center" data-r>
            <a className="btn btn-gold" href={wa(WA_HI)} target="_blank" rel="noopener">WhatsApp Kieran</a>
            <a className="btn btn-glass" href="#consult">Book a free consultation</a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="word" ref={word} aria-hidden="true">Transcendent</div>
        <div className="foot-grid">
          <div><b>Transcendent Design</b><p>Surface specialists: microcement, epoxy resin, Venetian plaster and polished concrete. Greater Manchester, working UK-wide.</p></div>
          <div><b>Find us</b><p>{site.address.join(', ')}<br />Mon–Sat 9am–5pm, Sun 9am–2pm</p></div>
          <div><b>Talk</b><p>Kieran <a href={`tel:+${site.phoneIntl}`}>{site.phone}</a><br />Josh <a href={`tel:+${site.phone2Intl}`}>{site.phone2}</a><br /><a href={site.facebook} target="_blank" rel="noopener">Facebook</a></p></div>
        </div>
        <p className="foot-fine">Demo site by Clientgateway. Photos, reviews and prices from transcendentdesignuk.com; illustrations are labelled. Not live, not indexed.</p>
      </footer>

      <nav className={`dock ${dock ? 'show' : ''}`} aria-label="Quick contact">
        <a href={`tel:+${site.phoneIntl}`}>Call</a>
        <a href={wa(WA_HI)} target="_blank" rel="noopener" className="dock-wa">WhatsApp</a>
        <a href="#price">Price</a>
      </nav>
    </>
  );
}
