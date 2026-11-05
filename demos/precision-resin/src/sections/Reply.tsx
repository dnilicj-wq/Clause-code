import { useEffect } from 'react';
import { useSite } from '@/src/lib/ctx';
import { estimate, gbp } from '@/config/trades/epoxy';
import { ReplyChat, type ChatMsg } from '@/components/library/reply-chat/ReplyChat';

// "How fast we reply": labelled How it works. The customer is shown as "You". Example conversation in the master.
export function Reply() {
  const { site, trade } = useSite();
  const ch = trade.copy.chat;
  // warm the photo so its bubble never appears empty
  useEffect(() => { if (ch.img) { const i = new Image(); i.src = ch.img; } }, [ch.img]);
  const e = estimate(trade.pricing, { space: ch.space, finish: ch.finish, condition: trade.copy.quote.conditions[0][0] });
  const msgs: ChatMsg[] = [
    { from: 'you', text: ch.ask(site.town, e.m2), ...(ch.img ? { img: ch.img, imgLabel: 'Your photo' } : {}) },
    { from: 'them', text: `Thanks! For ${e.m2}m² with the old paint ground off, ${ch.finishWord} is roughly ${gbp(e.low)} to ${gbp(e.high)} (example range). Can you send a photo of the floor?` },
    { from: 'you', text: 'Sent 👍 We can clear it at the weekend.' },
    { from: 'them', text: `Great, ${site.owner.first || 'we'} will come back to you with a proper price.` },
  ];
  const steps = [
    ['Send a photo', `WhatsApp or the form. ${ch.photoTip}`],
    ['Get a range', `${site.owner.first || 'We'} replies with a rough price.`],
    ['Proper price', 'Once the floor has been seen, you get a real price.'],
  ];
  return (
    <section id="how" aria-label="How it works" className="theme-light section overflow-hidden">
      <div className="wrap grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div>
          <p className="eyebrow">How it works (example conversation)</p>
          <h2 className="h2 mt-4 max-w-[13ch]">Send a photo. <span className="serif" style={{ color: 'var(--accent2)' }}>Get a price.</span></h2>
          <p className="lede mt-4 max-w-[44ch] max-md:hidden">WhatsApp {site.owner.first || 'us'} the size and a photo of the floor. Lines open {site.hours}. No call centre.</p>
          <ol className="mt-8 hidden max-w-[460px] gap-5 md:grid">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border font-display text-sm" style={{ borderColor: 'var(--line)', color: 'var(--accent)' }}>{i + 1}</span>
                <div><p className="font-semibold">{t}</p><p className="mt-0.5 text-[14.5px]" style={{ color: 'var(--muted)' }}>{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <ReplyChat name={site.company} avatar={site.shortName.slice(0, 1)} status={`Open ${site.hours}`} msgs={msgs} />
      </div>
    </section>
  );
}
