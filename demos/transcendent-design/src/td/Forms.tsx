import { useMemo, useState } from 'react';
import { site, wa } from './data';

// ---------- Free consultation request (requests only: Kieran confirms) ----------
const SLOTS = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export function Booking() {
  const days = useMemo(() => {
    const out: Date[] = []; const d = new Date(); d.setHours(12, 0, 0, 0);
    while (out.length < 10) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w > 0) out.push(new Date(d)); }
    return out;
  }, []);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [video, setVideo] = useState(false);
  const label = (s: string) => { const h = +s.split(':')[0]; return h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`; };
  const msg = video
    ? `Hi Kieran, I found you on your website. Could I send you some photos of my project first? ${slot ? `${fmt(days[day])} around ${label(slot)} would suit me for a chat.` : ''}`
    : `Hi Kieran, I found you on your website. Could you come out for a free consultation on ${fmt(days[day])}${slot ? ` around ${label(slot)}` : ''}? Happy to see some samples.`;

  return (
    <div className="book">
      <div className="seg" role="radiogroup" aria-label="Consultation type">
        <button role="radio" aria-checked={!video} className={!video ? 'on' : ''} onClick={() => setVideo(false)}>Come and see it</button>
        <button role="radio" aria-checked={video} className={video ? 'on' : ''} onClick={() => setVideo(true)}>Send photos first</button>
      </div>
      <p className="book-k">Pick a day <small>(Mon–Sat)</small></p>
      <div className="days" role="radiogroup" aria-label="Day">
        {days.map((d, i) => (
          <button key={i} role="radio" aria-checked={day === i} className={`day ${day === i ? 'on' : ''}`} onClick={() => setDay(i)}>
            <small>{d.toLocaleDateString('en-GB', { weekday: 'short' })}</small><b>{d.getDate()}</b><small>{d.toLocaleDateString('en-GB', { month: 'short' })}</small>
          </button>
        ))}
      </div>
      <p className="book-k">And a time <small>(9am–5pm)</small></p>
      <div className="slots" role="radiogroup" aria-label="Time">
        {SLOTS.map((s) => (
          <button key={s} role="radio" aria-checked={slot === s} className={`chip ${slot === s ? 'on' : ''}`} onClick={() => setSlot(s)}>{label(s)}</button>
        ))}
      </div>
      <a className="btn btn-gold book-go" href={wa(msg)} target="_blank" rel="noopener" title="Goes straight to Kieran's WhatsApp.">
        {video ? 'Send photos first' : `Request ${fmt(days[day])}${slot ? `, ${label(slot)}` : ''}`}
        <span aria-hidden="true">→</span>
      </a>
      <p className="fine">It’s a request, not a booking. Kieran replies on WhatsApp to confirm. Sundays are 9am–2pm.</p>
    </div>
  );
}

// ---------- Project planner (no prices) ----------
const WHAT = ['Floor', 'Walls', 'Bathroom / wet room', 'Kitchen', 'Garage', 'Commercial space'];
const MAT = ['Microcement', 'Epoxy resin', 'Venetian / decorative plaster', 'Polished concrete', 'Not sure yet'];
const SIZE = ['One wall or a small room', 'A full room', 'Several rooms', 'Whole floor or house'];

export function Planner() {
  const [step, setStep] = useState(0);
  const [what, setWhat] = useState<string[]>([]);
  const [mat, setMat] = useState('');
  const [size, setSize] = useState('');
  const [pc, setPc] = useState('');
  const [name, setName] = useState('');
  const [mob, setMob] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'wa'>('idle');
  const [err, setErr] = useState('');

  const summary = `Hi Kieran, it's ${name || '…'}. I'm planning: ${what.join(', ') || '…'} in ${mat || '…'}. Size: ${size || '…'}. Postcode: ${pc.toUpperCase() || '…'}. My mobile: ${mob || '…'}.`;
  const ok = [what.length > 0, !!mat, !!size, /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/.test(pc.trim()), name.trim().length > 1 && mob.replace(/\D/g, '').length >= 10];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (hp) return; // honeypot
    if (!ok[4]) { setErr('Pop your name and mobile in so Kieran can reply.'); return; }
    window.open(wa(summary), '_blank', 'noopener');
    if (!site.formKey) { setState('wa'); return; }
    setState('sending');
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: site.formKey, subject: `New project from the website: ${name}`, from_name: 'Transcendent Design website', name, phone: mob, postcode: pc, project: what.join(', '), material: mat, size, botcheck: '' }),
      });
      const j = await r.json();
      setState(j.success ? 'sent' : 'wa');
    } catch { setState('wa'); }
  };

  if (state === 'sent' || state === 'wa') {
    return (
      <div className="plan done" role="status">
        <p className="serif big">{state === 'sent' ? 'Sent. A real human will read this, promise.' : 'WhatsApp’s open with your details.'}</p>
        <p>{state === 'sent' ? 'Kieran & Josh have it by email too. They’ll be in touch.' : 'Just hit send there and it goes straight to Kieran.'}</p>
        <a className="btn btn-ghost" href={wa(summary)} target="_blank" rel="noopener">Open WhatsApp again</a>
      </div>
    );
  }

  const Choice = ({ opts, val, set, multi }: { opts: string[]; val: string | string[]; set: (v: string) => void; multi?: boolean }) => (
    <div className="chips wrap" role={multi ? 'group' : 'radiogroup'}>
      {opts.map((o) => {
        const on = Array.isArray(val) ? val.includes(o) : val === o;
        return <button type="button" key={o} role={multi ? 'checkbox' : 'radio'} aria-checked={on} className={`chip ${on ? 'on' : ''}`} onClick={() => set(o)}>{o}</button>;
      })}
    </div>
  );

  const Q = ['What are we doing?', 'Which finish?', 'Roughly how big?', 'Where is it?', 'Who’s asking?'];
  return (
    <form className="plan" onSubmit={submit} noValidate>
      <div className="plan-top">
        <span className="plan-n">{step + 1}<small>/5</small></span>
        <div className="plan-bar" aria-hidden="true"><i style={{ width: `${(step + 1) * 20}%` }} /></div>
      </div>
      <h3 className="plan-q" aria-live="polite">{Q[step]}</h3>
      {step === 0 && <Choice multi opts={WHAT} val={what} set={(v) => setWhat((w) => (w.includes(v) ? w.filter((x) => x !== v) : [...w, v]))} />}
      {step === 1 && <Choice opts={MAT} val={mat} set={(v) => { setMat(v); setTimeout(() => setStep(2), 220); }} />}
      {step === 2 && <Choice opts={SIZE} val={size} set={(v) => { setSize(v); setTimeout(() => setStep(3), 220); }} />}
      {step === 3 && (
        <label className="field"><span>Postcode</span>
          <input value={pc} onChange={(e) => setPc(e.target.value)} autoComplete="postal-code" placeholder="e.g. BL1" inputMode="text" maxLength={8} />
        </label>
      )}
      {step === 4 && (
        <>
          <label className="field"><span>First name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></label>
          <label className="field"><span>Mobile</span><input value={mob} onChange={(e) => setMob(e.target.value)} autoComplete="tel" inputMode="tel" /></label>
          <label className="hp" aria-hidden="true">Leave this empty<input tabIndex={-1} value={hp} onChange={(e) => setHp(e.target.value)} autoComplete="off" /></label>
        </>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <div className="plan-act">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 4
          ? <button key="next" type="button" className="btn btn-ink" disabled={!ok[step]} onClick={(e) => { e.preventDefault(); setErr(''); setStep(step + 1); }}>Next</button>
          : <button key="send" type="submit" className="btn btn-gold" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send to Kieran'}</button>}
      </div>
      <p className="fine">Every floor’s different, so Kieran &amp; Josh quote properly after a free consultation.</p>
    </form>
  );
}
