import { useEffect, useState } from 'react';
import { site, wa, type Spec } from './data';

// Quote form: Space → Finish → rough size + postcode → name + mobile. Opens WhatsApp with everything
// written out, and emails it too once site.formKey (Web3Forms) is set. No prices anywhere.
const SPACE = ['Kitchen worktop', 'Living floor', 'Garage', 'Bathroom', 'Feature wall', 'Driveway', 'Commercial space', 'Something else'];
const FIN = ['Metallic marble', 'Solid gloss', 'Flake', 'Microcement', 'Venetian plaster', 'Resin bound', 'Not sure yet'];
const SIZE = ['Small', 'Medium', 'Large', 'Not sure'];
const PC = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*(\d[A-Za-z]{2})?$/;

export default function Planner({ spec }: { spec: Spec | null }) {
  const [step, setStep] = useState(0);
  const [space, setSpace] = useState('');
  const [fin, setFin] = useState('');
  const [tone, setTone] = useState('');
  const [size, setSize] = useState('');
  const [pc, setPc] = useState('');
  const [name, setName] = useState('');
  const [mob, setMob] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'wa'>('idle');
  const [err, setErr] = useState('');

  // a design from the configurator lands here pre-filled, straight onto the size question
  useEffect(() => {
    if (!spec) return;
    setSpace(spec.space); setFin(spec.finish); setTone(spec.tone); setStep(2); setState('idle');
  }, [spec]);

  const design = `${space || '…'}, ${fin || '…'}${tone ? ` in ${tone}` : ''}`;
  const summary = `Hi RESINOVA, it's ${name.trim() || '…'}. I'd like a quote for: ${design}. Rough size: ${size || '…'}. Postcode: ${pc.trim().toUpperCase() || '…'}. My mobile: ${mob.trim() || '…'}. I'll send a photo of the space as it is now.`;
  const okContact = name.trim().length > 1 && mob.replace(/\D/g, '').length >= 10;
  const ok = [!!space, !!fin, !!size && PC.test(pc.trim()), okContact];

  const pick = (set: (v: string) => void, v: string, clearTone = false) => { set(v); if (clearTone) setTone(''); setTimeout(() => setStep((n) => Math.min(n + 1, 2)), 200); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (hp) return; // honeypot
    if (!okContact) { setErr('Pop your first name and mobile in so we can reply.'); return; }
    window.open(wa(summary), '_blank', 'noopener');
    if (!site.formKey) { setState('wa'); return; }
    setState('sending');
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: site.formKey, subject: `Quote request from the website: ${name}`, from_name: 'RESINOVA website', name, phone: mob, postcode: pc, space, finish: fin, tone, size, botcheck: '' }),
      });
      const j = await r.json();
      setState(j.success ? 'sent' : 'wa');
    } catch { setState('wa'); }
  };

  if (state === 'sent' || state === 'wa') {
    return (
      <div className="plan done" role="status">
        <p className="big">{state === 'sent' ? 'Sent. We’ll be in touch shortly.' : 'WhatsApp’s open with your details.'}</p>
        <p>{state === 'sent' ? 'It’s in our inbox too.' : 'Hit send there and it comes straight to us. Add a photo of the space as it is now while you’re at it.'}</p>
        <a className="btn btn-ghost" href={wa(summary)} target="_blank" rel="noopener">Open WhatsApp again</a>
      </div>
    );
  }

  const Choice = ({ opts, val, set, label, clearTone }: { opts: string[]; val: string; set: (v: string) => void; label: string; clearTone?: boolean }) => (
    <div className="pills" role="radiogroup" aria-label={label}>
      {opts.map((o) => <button type="button" key={o} role="radio" aria-checked={val === o} className={`pill ${val === o ? 'on' : ''}`} onClick={() => pick(set, o, clearTone)}>{o}</button>)}
    </div>
  );

  const Q = ['Which space?', 'Which finish?', 'Roughly how big, and where?', 'Who’s asking?'];
  return (
    <form className="plan" onSubmit={submit} noValidate>
      <div className="plan-top">
        <span className="plan-n">{step + 1}<small>/4</small></span>
        <div className="plan-bar" aria-hidden="true"><i style={{ transform: `scaleX(${(step + 1) / 4})` }} /></div>
      </div>
      {step >= 2 && space && fin && <p className="plan-spec">Your design: <b>{design}</b></p>}
      <h3 className="plan-q" aria-live="polite">{Q[step]}</h3>
      {step === 0 && <Choice opts={SPACE} val={space} set={setSpace} label="Space" clearTone />}
      {step === 1 && <Choice opts={FIN} val={fin} set={setFin} label="Finish" clearTone />}
      {step === 2 && (
        <>
          <div className="pills" role="radiogroup" aria-label="Rough size">
            {SIZE.map((o) => <button type="button" key={o} role="radio" aria-checked={size === o} className={`pill ${size === o ? 'on' : ''}`} onClick={() => setSize(o)}>{o}</button>)}
          </div>
          <label className="field"><span>Postcode</span>
            <input value={pc} onChange={(e) => setPc(e.target.value)} autoComplete="postal-code" placeholder="e.g. SW1A 1AA" maxLength={8} />
          </label>
        </>
      )}
      {step === 3 && (
        <>
          <label className="field"><span>First name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></label>
          <label className="field"><span>Mobile</span><input value={mob} onChange={(e) => setMob(e.target.value)} autoComplete="tel" inputMode="tel" /></label>
          <p className="snap"><b>Snap the space as it is now.</b> You can add the photo in WhatsApp in the next step.</p>
          <label className="hp" aria-hidden="true">Leave this empty<input tabIndex={-1} value={hp} onChange={(e) => setHp(e.target.value)} autoComplete="off" /></label>
        </>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <div className="plan-act">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3
          ? <button key="next" type="button" className="btn btn-ink" disabled={!ok[step]} onClick={() => { setErr(''); setStep(step + 1); }}>Next</button>
          : <button key="send" type="submit" className="btn btn-gold" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send on WhatsApp'}</button>}
      </div>
    </form>
  );
}
