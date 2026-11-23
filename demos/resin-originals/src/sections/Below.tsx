// Everything below the hero (own chunk, so the hero paints first).
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { IconPlayerPlayFilled, IconBrandWhatsapp, IconPhone, IconClipboardText, IconArrowLeft, IconBrandFacebook, IconSparkles, IconDroplet, IconShieldCheck } from '@tabler/icons-react';
import { useSite } from '@/src/lib/ctx';
import { LampCta } from '@/components/library/lamp-cta/LampCta';
import { JOBS, FILTERS, type Job, type Tag } from './jobs';
import { waLink } from './wa';

const ease = [0.22, 1, 0.36, 1] as const;
function useRise() {
  const reduce = useReducedMotion();
  return (d = 0) => (reduce ? {} : { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-10%' }, transition: { duration: 0.7, delay: d, ease } });
}

/* ---------- Real jobs: Signature 2, tap (or hover) a floor and it plays the clip from Dean's reel ---------- */
function Tile({ job, active, onPlay }: { job: Job; active: boolean; onPlay: () => void }) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current; if (!el || !job.clip) return;
    if (active) { if (!el.src) el.src = job.clip; el.play().catch(() => {}); } else el.pause();
  }, [active, job.clip]);
  const fine = typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;
  return (
    <article className="tile">
      <button type="button" className={`tile__media ${active ? 'is-active' : ''}`} onClick={onPlay} onMouseEnter={fine ? onPlay : undefined}
        aria-label={job.clip ? `Play the clip of ${job.title}` : job.title} aria-pressed={job.clip ? active : undefined}>
        <img src={job.still} alt={`${job.title}, laid by The Resin Originals`} loading="lazy" decoding="async" />
        {job.clip && <video ref={v} muted loop playsInline preload="none" aria-hidden />}
        {job.clip && <span className="tile__play" aria-hidden><IconPlayerPlayFilled size={14} /></span>}
      </button>
      <h3 className="tile__t">{job.title}</h3>
      <p className="tile__n">{job.note}</p>
      <p className="tile__tags">{job.tags.join(' / ')} <a href={job.src} target="_blank" rel="noopener">{job.clip ? 'Full video' : 'On Facebook'}</a></p>
    </article>
  );
}

export function Work() {
  const [f, setF] = useState<'All' | Tag>('All');
  const [active, setActive] = useState<string | null>(null);
  const list = useMemo(() => JOBS.filter((j) => f === 'All' || j.tags.includes(f)), [f]);
  const rise = useRise();
  return (
    <section id="work" aria-label="Recent floors" className="section">
      <div className="wrap">
        <motion.h2 {...rise()} className="h2">Floors we've laid.</motion.h2>
        <motion.p {...rise(0.05)} className="lede mt-4">Real jobs, straight from our Facebook page. Tap a floor to see it move.</motion.p>
        <div className="chips" role="group" aria-label="Filter floors">
          {FILTERS.map((x) => (
            <button key={x} type="button" aria-pressed={f === x} className={`chip ${f === x ? 'is-on' : ''}`} onClick={() => { setF(x); setActive(null); }}>{x}</button>
          ))}
        </div>
        <motion.div layout className="tiles">
          <AnimatePresence mode="popLayout">
            {list.map((job) => (
              <motion.div key={job.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25, ease }}>
                <Tile job={job} active={active === job.slug} onPlay={() => setActive(job.slug)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- The four finishes from his page bio ---------- */
const FIN = [
  { k: 'Metallic', img: '/client/jobs/kitchen-silver-v1.webp', alt: 'Silver metallic epoxy floor in a kitchen', line: 'No two floors are ever identical.', big: true },
  { k: 'Flake', img: '/client/jobs/garage-flake-v1.webp', alt: 'Grey flake epoxy garage floor with a red track logo', line: 'Flake for garages, with your logo set into the floor if you want one.' },
  { k: 'Quartz', img: '/client/jobs/clinic-quartz-v1.webp', alt: 'Blue quartz epoxy floor with coving in a clinic theatre room', line: 'Seamless quartz, laid for an eye clinic theatre room.' },
  { k: 'Commercial', img: '/client/jobs/reception-v1.webp', alt: 'White and grey marble effect epoxy floor in a reception', line: 'Receptions, clinics and workshops.' },
];
export function Finishes() {
  const rise = useRise();
  return (
    <section id="finishes" aria-label="Finishes" className="section section--alt">
      <div className="wrap">
        <motion.h2 {...rise()} className="h2">Four finishes.</motion.h2>
        <div className="fins">
          {FIN.map((x, i) => (
            <motion.a {...rise(i * 0.06)} key={x.k} href="#plan" className={`fin ${x.big ? 'fin--big' : ''}`} data-finish={x.k}>
              <img src={x.img} alt={x.alt} loading="lazy" decoding="async" />
              <div className="fin__txt">
                <h3>{x.k} epoxy</h3>
                <p>{x.line}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Designed with you: his own words ---------- */
export function Together() {
  const rise = useRise();
  const pts = [
    { i: IconSparkles, t: 'High gloss that reflects light around the room.' },
    { i: IconShieldCheck, t: 'Highly resistant to scratches, impact and spills.' },
    { i: IconDroplet, t: 'Completely seamless, so you just wipe it clean.' },
  ];
  return (
    <section aria-label="Designed with you" className="section">
      <div className="wrap together">
        <motion.blockquote {...rise()} className="quote">
          <p>“All floors are bespoke and created together with the client to make sure the design and colours and ratios are all perfect!”</p>
          <footer>The Resin Originals, on Facebook</footer>
        </motion.blockquote>
        <ul className="pts">
          {pts.map(({ i: I, t }, n) => (
            <motion.li {...rise(0.08 + n * 0.06)} key={t}><I size={22} stroke={1.5} aria-hidden /><span>{t}</span></motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Quote planner (no prices): space, finish, size, postcode, name + mobile, then WhatsApp ---------- */
const SPACES = ['Garage', 'Kitchen or living area', 'Whole ground floor', 'Reception or commercial', 'Something else'];
const FINISHES = [
  { k: 'Metallic', img: '/client/jobs/home-cream-v1.webp' },
  { k: 'Flake', img: '/client/jobs/garage-flake-v1.webp' },
  { k: 'Quartz', img: '/client/jobs/clinic-quartz-v1.webp' },
  { k: 'Not sure yet', img: '/client/jobs/garage-red-v1.webp' },
];
const SIZES = ['Single garage', 'Double garage', 'One room', 'A few rooms', 'Large commercial area'];
const PC = /^[A-Z]{1,2}\d[A-Z\d]?(\s*\d[A-Z]{2})?$/i;
const MOB = /^(?:\+?44|0)7\d{9}$/;
export const cleanMobile = (s: string) => s.replace(/[\s()-]/g, '');

export function Planner() {
  const { site } = useSite();
  const [step, setStep] = useState(0);
  const [a, setA] = useState({ space: '', finish: '', size: '', postcode: '', name: '', mobile: '' });
  const [err, setErr] = useState('');
  const reduce = useReducedMotion();
  const set = (k: keyof typeof a, v: string) => { setA((p) => ({ ...p, [k]: v })); setErr(''); };
  const pick = (k: keyof typeof a, v: string) => { set(k, v); setTimeout(() => setStep((s) => s + 1), reduce ? 0 : 160); };
  const preview = FINISHES.find((f) => f.k === a.finish)?.img || '/client/jobs/home-cream-v1.webp';
  const okPc = PC.test(a.postcode.trim());
  const okMob = MOB.test(cleanMobile(a.mobile)) && a.name.trim().length > 1;
  const text = `Hi Dean, I'd like a quote for an epoxy floor.\nSpace: ${a.space}\nFinish: ${a.finish}\nRough size: ${a.size}\nPostcode: ${a.postcode.trim().toUpperCase()}\nName: ${a.name.trim()}\nMobile: ${a.mobile.trim()}`;
  const next = () => {
    if (step === 3 && !okPc) return setErr('Please enter a UK postcode, for example M14 5AB.');
    if (step === 4) {
      if (a.name.trim().length < 2) return setErr('Please add your name.');
      if (!MOB.test(cleanMobile(a.mobile))) return setErr('Please add a UK mobile number, for example 07700 900123.');
    }
    setStep((s) => s + 1);
  };
  const labels = ['Space', 'Finish', 'Size', 'Postcode', 'You'];
  const opts = (k: 'space' | 'size', list: string[]) => (
    <div className="opts">{list.map((o) => <button key={o} type="button" className={`opt ${a[k] === o ? 'is-on' : ''}`} onClick={() => pick(k, o)}>{o}</button>)}</div>
  );
  return (
    <section id="plan" aria-label="Plan your floor" className="section section--alt">
      <div className="wrap plan">
        <div className="plan__preview" aria-hidden>
          <AnimatePresence mode="wait">
            <motion.img key={preview} src={preview} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} />
          </AnimatePresence>
          <span className="plan__pv">{a.finish && a.finish !== 'Not sure yet' ? `${a.finish}, one of our floors` : 'One of our floors'}</span>
        </div>
        <div className="plan__card">
          <span className="plan__tag"><IconBrandWhatsapp size={16} stroke={1.8} aria-hidden /> Get a quote</span>
          <h2 className="h2 plan__h">Plan your floor.</h2>
          <p className="lede mt-3">Five quick questions. It goes to Dean on WhatsApp, no prices guessed here.</p>
          <ol className="steps" aria-label="Progress">
            {labels.map((l, i) => <li key={l} className={i < step ? 'done' : i === step ? 'now' : ''} aria-current={i === step ? 'step' : undefined}>{l}</li>)}
          </ol>
          <div className="plan__body" aria-live="polite">
            {step === 0 && <><p className="q">What's the space?</p>{opts('space', SPACES)}</>}
            {step === 1 && (<><p className="q">Which finish?</p>
              <div className="opts opts--img">{FINISHES.map((f) => (
                <button key={f.k} type="button" className={`opt opt--img ${a.finish === f.k ? 'is-on' : ''}`} onClick={() => pick('finish', f.k)}>
                  <img src={f.img} alt="" loading="lazy" /><span>{f.k}</span>
                </button>))}
              </div></>)}
            {step === 2 && <><p className="q">Roughly how big?</p>{opts('size', SIZES)}</>}
            {step === 3 && (<form onSubmit={(e) => { e.preventDefault(); next(); }}>
              <label className="q" htmlFor="pc">Your postcode</label>
              <input id="pc" className="inp" value={a.postcode} onChange={(e) => set('postcode', e.target.value)} autoComplete="postal-code" autoCapitalize="characters" placeholder="e.g. M14 5AB" aria-invalid={!!err} aria-describedby="perr" />
              <button className="btn btn--gold mt-4" type="submit">Next</button></form>)}
            {step === 4 && (<form onSubmit={(e) => { e.preventDefault(); next(); }}>
              <label className="q" htmlFor="nm">Your first name</label>
              <input id="nm" className="inp" value={a.name} onChange={(e) => set('name', e.target.value)} autoComplete="given-name" />
              <label className="q mt-4" htmlFor="mb">Your mobile</label>
              <input id="mb" className="inp" value={a.mobile} onChange={(e) => set('mobile', e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="07700 900123" aria-invalid={!!err} aria-describedby="perr" />
              <button className="btn btn--gold mt-4" type="submit">Check my details</button></form>)}
            {step === 5 && (<div>
              <p className="q">All set, {a.name.trim()}.</p>
              <dl className="sum">
                {(['space', 'finish', 'size', 'postcode'] as const).map((k) => <div key={k}><dt>{k === 'size' ? 'Rough size' : k[0].toUpperCase() + k.slice(1)}</dt><dd>{k === 'postcode' ? a[k].trim().toUpperCase() : a[k]}</dd></div>)}
              </dl>
              <a id="plan-send" className="btn btn--gold btn--wide" href={okMob && okPc ? waLink(site.whatsapp, text) : '#plan'} target="_blank" rel="noopener">
                <IconBrandWhatsapp size={20} stroke={1.6} aria-hidden /> Send to Dean on WhatsApp
              </a>
              <p className="fine">Opens WhatsApp with your answers filled in. Nothing is sent until you press send. Or call <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>.</p>
            </div>)}
            <p id="perr" className="err" role="alert">{err}</p>
          </div>
          {step > 0 && <button type="button" className="back" onClick={() => { setStep((s) => s - 1); setErr(''); }}><IconArrowLeft size={16} aria-hidden /> Back</button>}
        </div>
      </div>
    </section>
  );
}

/* ---------- Finale (Lamp CTA, mandatory) + footer + mobile dock ---------- */
export function Finale() {
  const { site } = useSite();
  return (
    <LampCta
      heading="Want it down before spring?"
      subline="Floors wanted for spring get booked in early, so it's worth starting the conversation now."
      primaryLabel="Plan my floor"
      primaryHref="#plan"
      whatsappHref={waLink(site.whatsapp, "Hi Dean, I'd like a floor done before spring.")}
    />
  );
}

export function Footer() {
  const { site } = useSite();
  return (
    <footer className="foot">
      <div className="wrap foot__in">
        <div className="foot__brand">
          <img src="/client/logo-96-v1.webp" alt="The Resin Originals logo" width={72} height={72} loading="lazy" />
          <div><p className="foot__name">The Resin Originals</p><p className="foot__tag">Epoxy resin floors</p></div>
        </div>
        <ul className="foot__links">
          <li><a href={`tel:${site.phone.replace(/\s/g, '')}`}><IconPhone size={17} aria-hidden /> {site.phone}</a></li>
          <li><a href={waLink(site.whatsapp, 'Hi Dean, ')} target="_blank" rel="noopener"><IconBrandWhatsapp size={17} aria-hidden /> WhatsApp</a></li>
          <li><a href={site.socials.facebook} target="_blank" rel="noopener"><IconBrandFacebook size={17} aria-hidden /> Facebook</a></li>
        </ul>
      </div>
      <p className="wrap foot__small">Preview site made for The Resin Originals by Clientgateway.</p>
    </footer>
  );
}

export function Dock() {
  const { site } = useSite();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const seen = new Map<Element, boolean>();
    const hero = document.getElementById('top'); const plan = document.getElementById('plan'); const foot = document.querySelector('.foot');
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => seen.set(e.target, e.isIntersecting));
      setShow(!seen.get(hero!) && !seen.get(plan!) && !seen.get(foot!));
    }, { threshold: 0.05 });
    [hero, plan, foot].forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <nav aria-label="Quick contact" className={`dock ${show ? 'is-on' : ''}`} aria-hidden={!show}>
      <a href={`tel:${site.phone.replace(/\s/g, '')}`} tabIndex={show ? 0 : -1}><IconPhone size={20} stroke={1.7} aria-hidden />Call</a>
      <a href={waLink(site.whatsapp, 'Hi Dean, ')} target="_blank" rel="noopener" tabIndex={show ? 0 : -1}><IconBrandWhatsapp size={20} stroke={1.7} aria-hidden />WhatsApp</a>
      <a href="#plan" className="dock__gold" tabIndex={show ? 0 : -1}><IconClipboardText size={20} stroke={1.7} aria-hidden />Quote</a>
    </nav>
  );
}

export default function Below() {
  return (
    <>
      <Work />
      <Finishes />
      <Together />
      <Planner />
      <Finale />
      <Footer />
      <Dock />
    </>
  );
}
