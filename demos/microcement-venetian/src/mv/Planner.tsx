import { useState } from 'react';
import { site, wa } from './data';

// Quote planner: four taps, then name + mobile. Opens WhatsApp to James with everything filled in,
// and emails it too once site.formKey (Web3Forms) is set. No prices, and no "thanks" unless it really sent.
const ROOM = ['Bathroom', 'Wet room', 'Kitchen', 'Feature wall', 'Floor', 'Outdoor', 'Other'];
const FIN = ['Microcement', 'Venetian plaster', 'Not sure yet'];
const TILES = ['Yes', 'No', 'Not sure'];
const SIZE = ['One wall', 'A small room', 'A full room', 'Bigger than that'];
const PC = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*(\d[A-Za-z]{2})?$/;

export default function Planner() {
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState('');
  const [fin, setFin] = useState('');
  const [tiles, setTiles] = useState('');
  const [size, setSize] = useState('');
  const [pc, setPc] = useState('');
  const [name, setName] = useState('');
  const [mob, setMob] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'wa'>('idle');
  const [err, setErr] = useState('');

  const summary = `Hi James, it's ${name.trim() || '…'}. I'd like a quote for: ${room || '…'}, in ${fin || '…'}. Going over existing tiles: ${tiles || '…'}. Size: ${size || '…'}. Postcode: ${pc.trim().toUpperCase() || '…'}. My mobile: ${mob.trim() || '…'}. I'll send a photo of the room as it is now.`;
  const okContact = name.trim().length > 1 && mob.replace(/\D/g, '').length >= 10;
  const ok = [!!room, !!fin, !!tiles, !!size && PC.test(pc.trim()), okContact];

  const pick = (set: (v: string) => void, v: string) => { set(v); setTimeout(() => setStep((n) => Math.min(n + 1, 3)), 200); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (hp) return; // honeypot
    if (!okContact) { setErr('Pop your first name and mobile in so James can reply.'); return; }
    window.open(wa(summary), '_blank', 'noopener');
    if (!site.formKey) { setState('wa'); return; }
    setState('sending');
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: site.formKey, subject: `Quote request from the website: ${name}`, from_name: 'Microcement & Venetian Surfaces website', name, phone: mob, postcode: pc, room, finish: fin, over_tiles: tiles, size, botcheck: '' }),
      });
      const j = await r.json();
      setState(j.success ? 'sent' : 'wa');
    } catch { setState('wa'); }
  };

  if (state === 'sent' || state === 'wa') {
    return (
      <div className="plan done" role="status">
        <p className="big">{state === 'sent' ? 'Sent. James will get back to you himself.' : 'WhatsApp’s open with your details.'}</p>
        <p>{state === 'sent' ? 'It’s in his inbox too.' : 'Hit send there and it goes straight to James. Add a photo of the room as it is now while you’re at it.'}</p>
        <a className="btn btn-ghost" href={wa(summary)} target="_blank" rel="noopener">Open WhatsApp again</a>
      </div>
    );
  }

  const Choice = ({ opts, val, set }: { opts: string[]; val: string; set: (v: string) => void }) => (
    <div className="chips" role="radiogroup">
      {opts.map((o) => <button type="button" key={o} role="radio" aria-checked={val === o} className={`chip ${val === o ? 'on' : ''}`} onClick={() => pick(set, o)}>{o}</button>)}
    </div>
  );

  const Q = ['Which room?', 'Which finish?', 'Going over existing tiles?', 'Roughly how big, and where?', 'Who’s asking?'];
  return (
    <form className="plan" onSubmit={submit} noValidate>
      <div className="plan-top">
        <span className="plan-n">{step + 1}<small>/5</small></span>
        <div className="plan-bar" aria-hidden="true"><i style={{ transform: `scaleX(${(step + 1) / 5})` }} /></div>
      </div>
      <h3 className="plan-q" aria-live="polite">{Q[step]}</h3>
      {step === 0 && <Choice opts={ROOM} val={room} set={setRoom} />}
      {step === 1 && <Choice opts={FIN} val={fin} set={setFin} />}
      {step === 2 && <Choice opts={TILES} val={tiles} set={setTiles} />}
      {step === 3 && (
        <>
          <div className="chips" role="radiogroup" aria-label="Rough size">
            {SIZE.map((o) => <button type="button" key={o} role="radio" aria-checked={size === o} className={`chip ${size === o ? 'on' : ''}`} onClick={() => setSize(o)}>{o}</button>)}
          </div>
          <label className="field"><span>Postcode</span>
            <input value={pc} onChange={(e) => setPc(e.target.value)} autoComplete="postal-code" placeholder="e.g. RG14 1AA" maxLength={8} />
          </label>
        </>
      )}
      {step === 4 && (
        <>
          <label className="field"><span>First name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></label>
          <label className="field"><span>Mobile</span><input value={mob} onChange={(e) => setMob(e.target.value)} autoComplete="tel" inputMode="tel" /></label>
          <p className="snap"><b>Snap the room as it is now.</b> You can add the photo in WhatsApp in the next step.</p>
          <label className="hp" aria-hidden="true">Leave this empty<input tabIndex={-1} value={hp} onChange={(e) => setHp(e.target.value)} autoComplete="off" /></label>
        </>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <div className="plan-act">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 4
          ? <button key="next" type="button" className="btn btn-ink" disabled={!ok[step]} onClick={() => { setErr(''); setStep(step + 1); }}>Next</button>
          : <button key="send" type="submit" className="btn btn-water" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send to James'}</button>}
      </div>
      <p className="fine">No prices online: every room’s different, so James quotes after a quick look.</p>
    </form>
  );
}
