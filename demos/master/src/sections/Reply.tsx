import { useSite } from '@/src/lib/ctx';
import { estimate, gbp } from '@/config/trades/epoxy';
import { ReplyChat, type ChatMsg } from '@/components/library/reply-chat/ReplyChat';

// "How fast we reply": labelled How it works. The customer is shown as "You". Example conversation in the master.
export function Reply() {
  const { site, trade } = useSite();
  const ch = trade.copy.chat;
  const e = estimate(trade.pricing, { space: ch.space, finish: ch.finish, condition: trade.copy.quote.conditions[0][0] });
  const msgs: ChatMsg[] = [
    { from: 'you', text: ch.ask(site.town, e.m2), ...(ch.img ? { img: ch.img, imgLabel: 'Your photo' } : {}) },
    { from: 'them', text: `Thanks${ch.img ? ' for the photo' : ''}! For ${e.m2}m² in ${ch.finishWord} it's usually ${gbp(e.low)} to ${gbp(e.high)}${site.demo ? ' (example range)' : ''}. We check everything on a free survey first.` },
    { from: 'them', text: 'Tuesday 10am or Thursday 4pm?' },
    { from: 'you', text: 'Thursday works 👍' },
    { from: 'them', text: `Booked ✓ ${site.owner.first} will text you the evening before.` },
  ];
  const steps = [
    ['Send a photo', `WhatsApp or the form. ${ch.photoTip}`],
    ['Get a range', `We reply ${site.responseTime} with a rough price.`],
    ['Free survey', 'We check moisture and cracks, then fix the price in writing.'],
  ];
  return (
    <section id="how" aria-label="How it works" className="section overflow-hidden">
      <div className="wrap grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div>
          <p className="eyebrow">How it works{site.demo && ' (example conversation)'}</p>
          <h2 className="h2 mt-4 max-w-[13ch]">How fast <span className="serif" style={{ color: 'var(--accent2)' }}>we reply.</span></h2>
          <p className="lede mt-4 max-w-[44ch] max-md:hidden">Message a photo, get a price range back {site.responseTime}, then book a free survey. No call centre, no chasing.</p>
          <ol className="mt-8 hidden max-w-[460px] gap-5 md:grid">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border font-display text-sm" style={{ borderColor: 'var(--line)', color: 'var(--accent)' }}>{i + 1}</span>
                <div><p className="font-semibold">{t}</p><p className="mt-0.5 text-[14.5px]" style={{ color: 'var(--muted)' }}>{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <ReplyChat name={site.company} avatar={site.shortName.slice(0, 1)} status={`Usually replies ${site.responseTime}`} msgs={msgs} />
      </div>
    </section>
  );
}
