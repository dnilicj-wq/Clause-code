import { useEffect, useRef, useState } from 'react';
import { GlintButton } from '../glint-button/GlintButton';
import './lamp-cta.css';

// Lamp CTA: the finale every /new-lead build ends with, directly above the footer.
// Re-themed purely by preset tokens; pass tone="light" on light presets (more glow body).
// Secondary pill: WhatsApp when the client has a mobile, otherwise Call.
export type LampCtaProps = {
  heading: string;
  subline?: string;
  primaryLabel: string;
  primaryHref: string; // '#price' (on-page quote form) — never a pop-up
  whatsappHref?: string; // https://wa.me/44…?text=…  (mobile numbers only)
  phoneHref?: string; // tel:…  used when there is no mobile
  tone?: 'dark' | 'light';
  id?: string;
  className?: string;
};

export function LampCta({ heading, subline, primaryLabel, primaryHref, whatsappHref, phoneHref, tone = 'dark', id, className = '' }: LampCtaProps) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Same as motion's whileInView on V3: lights up on entering, resets when it leaves, replays next time.
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} id={id} aria-label="Book a survey" className={`lamp-cta ${tone === 'light' ? 'lamp-cta--light' : ''} ${on ? 'is-on' : ''} ${className}`}>
      <div className="lamp-cta__stage" aria-hidden>
        <div className="lamp-cta__cone lamp-cta__cone--l"><i className="b" /><i className="s" /></div>
        <div className="lamp-cta__cone lamp-cta__cone--r"><i className="s" /><i className="b" /></div>
        <div className="lamp-cta__fade" />
        <div className="lamp-cta__frost" />
        <div className="lamp-cta__glow" />
        <div className="lamp-cta__glow2" />
        <div className="lamp-cta__bar" />
        <div className="lamp-cta__cap" />
      </div>
      <div className="lamp-cta__body">
        <h2 className="lamp-cta__h">{heading}</h2>
        {subline && <p className="lamp-cta__sub">{subline}</p>}
        <div className="lamp-cta__ctas">
          <GlintButton href={primaryHref}>{primaryLabel}</GlintButton>
          {whatsappHref ? (
            <a className="lamp-cta__alt" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a>
          ) : phoneHref ? (
            <a className="lamp-cta__alt" href={phoneHref}>Call</a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
