import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { photoSrc, process, faq } from '@/config/content';
import { Marquee } from '@/components/library/marquee/Marquee';
import { LayerBuild } from '@/components/library/layer-build/LayerBuild';
import { BenefitIllustrations } from '@/components/library/benefit-illustrations/BenefitIllustrations';
import { ProofTiles } from '@/components/library/proof-tiles/ProofTiles';
import { StepRail } from '@/components/library/step-rail/StepRail';
import { LampCta } from '@/components/library/lamp-cta/LampCta';
import { Head, Rise, Stars, Mark } from './ui';
import { WaIcon } from './Hero';
import { useQuote, waLink } from './quote';
import { areaSlug, useArea } from './area';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;
const paras = (t: string) => t.split('\n');

// Proof band: the Google rating (checked live 15 Nov 2026), then their four testimonials rolling past.
export function Proof() {
  const { site } = useSite();
  return (
    <section aria-label="Reviews" className="seam relative overflow-hidden py-12 md:py-16" style={{ background: 'var(--bg2)' }}>
      <div className="glow glow--blue -left-40 -top-40" aria-hidden />
      <div className="wrap relative px-5 md:px-16">
        <a href={site.socials.google} target="_blank" rel="noreferrer" className="group flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="gild font-display text-[84px] font-medium leading-none tracking-[-.04em] tabular-nums md:text-[132px]">{site.proof.rating.toFixed(1)}</span>
            <div>
              <Stars size={22} />
              <p className="mt-2 font-display text-[22px] font-medium leading-tight md:text-[30px]">from {site.proof.reviewCount} Google reviews</p>
            </div>
          </div>
          <span className="press inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors group-hover:bg-white/5" style={{ borderColor: 'var(--line)' }}>
            <GoogleG /> Read them on Google ↗
          </span>
        </a>
      </div>
      <div className="mt-9 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <Marquee pauseOnHover className="[--duration:58s] [--gap:14px]">
          {site.reviews.map((r, i) => (
            <figure key={i} className="glass-card m-0 w-[300px] rounded-2xl p-4 md:w-[400px]">
              <Stars size={12} />
              <blockquote className="mt-2 line-clamp-4 text-[14px] leading-relaxed">“{r.text.replace(/\n/g, ' ')}”</blockquote>
              <figcaption className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>{r.name}, {r.town} · on their website</figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
function GoogleG() {
  return <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12a11.9 11.9 0 0 1 8.4 3.3l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12a11.9 11.9 0 0 1 8.4 3.3l5.7-5.7A20 20 0 0 0 6.3 14.7z" /><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.2 5.3C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" /></svg>;
}

// Services: the four driveway surfaces each build themselves on scroll (layer-build, colours sampled from their
// photos), then patios, turf and the rest with their own photos. Wording from their service pages.
const DRIVES = [
  { t: 'Block paving', d: 'All types of block paving, custom designs and motifs, laid on a thick sub-base.', v: 'block', c: { colours: ['#9c4a35', '#b5654a', '#7e3a2a'], joint: '#c9bba5', border: '#3b3734', pattern: 'herringbone' } },
  { t: 'Resin', d: 'A surface that looks like loose gravel, without the problems of loose stones.', v: 'resin', c: { colours: ['#c4a675', '#9c7f55', '#e2cfa8', '#7a6243'] } },
  { t: 'Tarmac', d: 'Hand and machine-lay, small private works to large projects. Black or red finish.', v: 'tarmac', c: { colours: ['#252628'] } },
  { t: 'Gravel', d: 'Low maintenance and permeable. Grids available to keep the stones in place.', v: 'gravel', c: { colours: ['#c9b48d', '#a99472', '#ddd2bb', '#8a7a62'] } },
] as const;
const MORE = [
  { t: 'Patios', d: 'Natural stone, granite, block paving, slabs and aggregates.', img: 'patio-stone', v: 'sandstone' as const },
  { t: 'Artificial grass and turf', d: 'Artificial grass installed, natural turf supplied and laid.', img: 'turf-rolls', v: 'turf' as const },
  { t: 'Fencing and gates', d: 'Panels, posts, side gates, garden gates, five bar and driveway gates.', img: 'fence-panels' },
  { t: 'Brickwork', d: 'Garden walls, retaining walls, steps, flower beds and edging.', img: 'brick-pier' },
  { t: 'Landscaping', d: 'Full garden landscaping: planning, creation and maintenance.', img: 'patio-lawn' },
];
export function Services() {
  return (
    <section id="services" aria-labelledby="svcH" className="section glow-sec">
      <div className="wrap">
        <Head id="svcH" eyebrow="Driveways" title="Four surfaces," accent="one team to lay them" lede="Scroll and each one goes down layer by layer. Design and planning, groundworks, drainage and installation, project managed from start to finish." />
        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {DRIVES.map((s, i) => (
            <Rise key={s.t} d={i * 0.06}>
              <a href="#design" className="glass-card press group block h-full overflow-hidden rounded-[var(--radius)] p-3">
                <div className="overflow-hidden rounded-2xl"><LayerBuild variant={s.v} colours={s.c} label={`${s.t} going down in layers`} /></div>
                <div className="px-2 pb-2 pt-4">
                  <h3 className="font-display text-[24px] font-medium">{s.t}</h3>
                  <p className="mt-1 text-[14px] leading-snug" style={{ color: 'var(--muted)' }}>{s.d}</p>
                </div>
              </a>
            </Rise>
          ))}
        </div>
        <h3 className="mt-14 font-display text-[clamp(26px,3.4vw,40px)] font-medium tracking-[-.02em]">And the rest of the garden</h3>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {MORE.map((s, i) => (
            <Rise key={s.t} d={i * 0.05} className={i === 0 ? 'col-span-2 md:col-span-1' : ''}>
              <div className="frame relative h-full overflow-hidden rounded-[var(--radius)]">
                <img src={photoSrc(s.img, 640)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover md:aspect-[3/4]" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(7,11,24,0) 30%, rgba(7,11,24,.92))' }} />
                <div className="absolute inset-x-0 bottom-0 p-3.5 md:p-4">
                  <h4 className="font-display text-[18px] font-medium leading-tight md:text-[20px]">{s.t}</h4>
                  <p className="mt-1 hidden text-[13px] leading-snug md:block" style={{ color: 'color-mix(in srgb, var(--ink) 78%, transparent)' }}>{s.d}</p>
                </div>
              </div>
            </Rise>
          ))}
        </div>
        <p className="mt-3 text-[12px]" style={{ color: 'var(--muted)' }}>Photos from sussexandsurreydrivewaysltd.co.uk.</p>
      </div>
    </section>
  );
}

// Benefits: only what their own pages say about each material.
export function Benefits() {
  return (
    <section aria-label="Why each surface" className="section !pt-4">
      <div className="wrap">
        <BenefitIllustrations eyebrow="Built to last" heading="What goes on under the surface"
          lead="From their driveway pages: what each material does, and why it is laid the way it is."
          items={[
            { illo: 'interlock', title: 'A thick sub-base', text: 'Block paving is laid on a thick sub-base to stop sagging and subsidence.' },
            { illo: 'drain', title: 'Gravel lets rain through', text: 'Gravel is permeable, so it needs no extra drainage to cope with run-off water.' },
            { illo: 'pattern', title: 'Patterns and inlays', text: 'Curves, edging kerbs, steps, circles, patterns and colours to suit your home.' },
          ]} />
      </div>
    </section>
  );
}

// Proof tiles: promises from their own site only.
export function Promises() {
  return (
    <section aria-label="What you get" className="section glow-sec !pt-6">
      <div className="wrap">
        <ProofTiles eyebrow="What you get" heading="Free to ask, start to finish"
          items={[
            { illo: 'visit', title: 'Free site visit', text: 'They come to you and talk through what you want.' },
            { illo: 'plans', title: 'Free design and planning', text: 'A design and planning service to suit you.' },
            { illo: 'prep', title: 'Groundworks and drainage', text: 'Ground prepared and drainage in before the surface.' },
            { illo: 'swatches', title: 'Your choice of material', text: 'Block, resin, tarmac or gravel, with advice on each.' },
            { illo: 'range', title: 'Small jobs to large', text: 'Hand and machine-lay tarmac, from private drives to large projects.' },
            { illo: 'match', title: 'Repairs too', text: 'Repairing, patching or cleaning your existing drive.' },
          ]} />
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section id="how" aria-label="How it works" className="section seam" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <StepRail eyebrow="How it works" heading="From first visit to finished drive" lead="Their process, from their driveways page." steps={process} />
      </div>
    </section>
  );
}

export function Reviews() {
  const { site } = useSite();
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % site.reviews.length), 9000); return () => clearInterval(t); }, [site.reviews.length]);
  const r = site.reviews[i];
  return (
    <section id="reviews" aria-labelledby="revH" className="section glow-sec">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Head id="revH" eyebrow="What customers say" title="First class," accent="start to finish" />
          <a href={site.socials.google} target="_blank" rel="noreferrer" className="press inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[14px]" style={{ borderColor: 'var(--line)' }}>
            <Stars size={13} /> {site.proof.rating.toFixed(1)} · {site.proof.reviewCount} reviews on Google ↗
          </a>
        </div>
        <div className="glass-card relative mt-10 min-h-[380px] rounded-[var(--radius)] p-6 md:mt-14 md:min-h-[340px] md:p-12">
          <AnimatePresence mode="wait">
            <motion.figure key={i} className="relative m-0" initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .4, ease: [0.23, 1, 0.32, 1] }}>
              <div className="flex items-center gap-3"><Stars size={15} /><span className="text-[13px] font-medium" style={{ color: 'var(--pop)' }}>{r.title}</span></div>
              <blockquote className="mt-4 max-w-[52ch] font-display text-[clamp(18px,2.3vw,28px)] font-medium leading-[1.3] tracking-[-.01em]">
                {paras(r.text).map((p, k) => <p key={k} className={k ? 'mt-3' : ''}>{k === 0 ? '“' : ''}{p}{k === paras(r.text).length - 1 ? '”' : ''}</p>)}
              </blockquote>
              <figcaption className="mt-5 text-[14px]"><b className="font-medium">{r.name}</b><span style={{ color: 'var(--muted)' }}>{`, ${r.town} · from their website`}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="mt-6 flex gap-1">
            {site.reviews.map((x, k) => <button key={k} onClick={() => setI(k)} aria-label={`Review from ${x.name}`} className="grid h-10 min-w-10 place-items-center"><span className="block h-1.5 rounded-full transition-[width,background-color] duration-300" style={{ width: k === i ? 26 : 10, background: k === i ? 'var(--accent)' : 'rgba(255,255,255,.18)' }} /></button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function About() {
  const { site } = useSite();
  return (
    <section id="about" aria-labelledby="aboutH" className="section !pt-6">
      <div className="wrap grid items-center gap-8 md:grid-cols-[1.1fr_.9fr] md:gap-14">
        <div>
          <Head id="aboutH" eyebrow="Who they are" title="Family-run," accent={`based in ${site.town}`}
            lede={`A family run business providing driveways, paving and landscaping across ${site.town}, Sussex, Surrey and surrounding areas. They pride themselves on reliability, quality workmanship and value for money.`} />
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a href={tel(site.phone)} className="btn-gold press flex h-[50px] items-center rounded-full px-6 text-[15px] font-semibold">Call {site.phone}</a>
            <a href={`mailto:${site.email}`} className="press flex h-[50px] items-center rounded-full border px-6 text-[15px] font-medium" style={{ borderColor: 'var(--line)' }}>Email them</a>
          </div>
        </div>
        <Rise d={0.08}>
          <div className="frame relative overflow-hidden rounded-[var(--radius)]">
            <img src={photoSrc('block-pattern', 1280)} alt="Patterned red and charcoal block paving" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="glass absolute bottom-3 left-3 flex items-center gap-3 rounded-2xl px-3.5 py-2.5"><Mark size={30} /><span className="text-[13px] leading-tight">{site.company}<br /><span style={{ color: 'var(--muted)' }}>Photo from their website</span></span></div>
          </div>
        </Rise>
      </div>
    </section>
  );
}

// Areas: only the towns named on their own site or in their testimonials. Each has its own page.
export function Areas() {
  const { site } = useSite();
  const here = useArea();
  return (
    <section id="areas" aria-labelledby="areaH" className="section seam" style={{ background: 'var(--bg2)' }}>
      <div className="glow glow--gold -right-40 top-10" aria-hidden />
      <div className="wrap relative">
        <Head id="areaH" eyebrow="Where they work" title={`Based in ${site.town},`} accent="across Sussex and Surrey" />
        <div className="mt-10 grid gap-3 md:mt-12 md:grid-cols-5">
          {site.areas.map((t) => {
            const r = site.reviews.find((x) => x.town === t);
            const on = here === t;
            return (
              <a key={t} href={areaSlug(t)} className="glass-card press flex flex-col justify-between rounded-2xl p-4 md:min-h-[190px] md:p-5" style={on ? { borderColor: 'var(--accent)' } : undefined}>
                <div>
                  <span className="text-[12px] font-medium" style={{ color: 'var(--pop)' }}>{t === site.town ? 'Their base' : r ? r.job : ''}</span>
                  <h3 className="mt-1 font-display text-[26px] font-medium">{t}</h3>
                </div>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>{t === site.town ? 'Family-run team, working out across both counties.' : r ? `“${r.title}”, ${r.name}` : ''}</p>
                <span className="mt-3 text-[13px] font-medium" style={{ color: 'var(--accent2)' }}>{`Driveways in ${t} →`}</span>
              </a>
            );
          })}
        </div>
        <p className="mt-4 text-[13px]" style={{ color: 'var(--muted)' }}>Not sure if you're covered? Call <a className="underline" href={tel(site.phone)}>{site.phone}</a>.</p>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faqH" className="section">
      <div className="wrap grid gap-8 md:grid-cols-[.8fr_1.2fr] md:gap-16">
        <Head id="faqH" eyebrow="Questions" title="Good to" accent="know" lede="Answers from their own pages." />
        <div className="divide-y border-y" style={{ borderColor: 'var(--line)' }}>
          {faq.map((f, i) => (
            <div key={i} style={{ borderColor: 'var(--line)' }}>
              <button className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[18px] font-medium md:text-[20px]" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {f.q}<span className="text-[22px] transition-transform duration-200" style={{ color: 'var(--accent)', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden">
                    <p className="pb-5 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Finale() {
  const { site } = useSite();
  const q = useQuote();
  return (
    <LampCta id="book" heading="Let's see your driveway."
      subline="Free site visit and estimate, no obligation. Driveways, patios and landscaping across Sussex and Surrey."
      primaryLabel="Book a free site visit" primaryHref="#design"
      whatsappHref={waLink(q)} phoneHref={tel(site.phone)} />
  );
}

export function Footer() {
  const { site } = useSite();
  return (
    <footer className="seam relative overflow-hidden px-5 pb-28 pt-16 md:px-16 md:pb-12 md:pt-20" style={{ background: 'var(--bg2)' }}>
      <div className="glow glow--blue -bottom-60 left-1/3" aria-hidden />
      <div className="wrap relative">
        <div className="flex items-center gap-4 md:gap-7" role="img" aria-label={site.company}>
          <Mark size={64} />
          <div aria-hidden>
            <div className="gild font-display font-semibold uppercase leading-[.9]" style={{ fontSize: 'clamp(28px, 7vw, 100px)', letterSpacing: '.04em' }}>Sussex &amp; Surrey</div>
            <div className="mt-[.45em] font-display font-medium uppercase" style={{ fontSize: 'clamp(12px, 2vw, 28px)', letterSpacing: '.6em', color: 'var(--muted)' }}>Driveways</div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 text-[14px] md:grid-cols-4" style={{ color: 'var(--muted)' }}>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Call</div><a href={tel(site.phone)}>{site.phone}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>WhatsApp</div><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">{site.whatsappDisplay}</a></div>
          <div className="col-span-2 md:col-span-1"><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Email</div><a href={`mailto:${site.email}`} className="break-all">{site.email}</a></div>
          <div className="col-span-2 md:col-span-1"><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Areas</div>{site.areas.map((t, i) => <span key={t}>{i ? ' · ' : ''}<a href={areaSlug(t)} className="hover:underline">{t}</a></span>)}</div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-[12px] md:flex-row md:justify-between" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <span>{site.company} · Driveways, patios and landscaping · {site.town}, {site.region}</span>
          <span>Demo by Clientgateway · photos from their website · hero and colours are illustrations</span>
        </div>
      </div>
    </footer>
  );
}

// Sticky phone bar: Call / WhatsApp / Design. Hidden on the hero, in the designer (it has its own bar) and at the footer.
export function StickyBar() {
  const { site } = useSite();
  const q = useQuote();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => {
      const mid = innerHeight * 0.5;
      const d = document.getElementById('design')?.getBoundingClientRect();
      const inDesign = d ? d.top < mid && d.bottom > mid : false;
      const foot = document.querySelector('footer')?.getBoundingClientRect();
      const atFoot = foot ? foot.top < innerHeight - 60 : false;
      setShow(scrollY > innerHeight * 0.6 && !inDesign && !atFoot);
    };
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f);
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f); };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.nav aria-label="Quick contact" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
          className="sticky-bar fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-40 grid grid-cols-3 gap-1.5 rounded-full p-1.5 md:hidden">
          <a href={tel(site.phone)} className="press flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-medium" style={{ background: 'rgba(255,255,255,.08)' }}><PhoneIcon /> Call</a>
          <a href={waLink(q)} target="_blank" rel="noreferrer" className="press flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}><WaIcon size={16} /> WhatsApp</a>
          <a href="#design" className="btn-gold press flex h-11 items-center justify-center rounded-full text-[14px] font-semibold">Design</a>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

function PhoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>;
}
