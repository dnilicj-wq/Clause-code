import { useState } from 'react';
import { site, wa, ROOMS, FINISHES, SIZES } from './data';

const PC = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*(\d[A-Za-z]{2})?$/;
export const message = (p: { room: string[]; finish: string; size: string; pc: string; name: string; mob: string }) =>
  `Hi, I found AGD Venetian Plastering online. I'd like a quote.\nRoom: ${p.room.join(', ')}\nFinish: ${p.finish}\nSize: ${p.size}\nPostcode: ${p.pc.trim().toUpperCase()}\nName: ${p.name.trim()}\nMobile: ${p.mob.trim()}`;

// Quote planner: no prices. Ends by opening WhatsApp to AGD, pre-filled.
export function Planner() {
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState<string[]>([]);
  const [finish, setFinish] = useState('');
  const [size, setSize] = useState('');
  const [pc, setPc] = useState('');
  const [name, setName] = useState('');
  const [mob, setMob] = useState('');
  const [hp, setHp] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const ok = [room.length > 0, !!finish, !!size, PC.test(pc.trim()), name.trim().length > 1 && mob.replace(/\D/g, '').length >= 10];
  const text = message({ room, finish, size, pc, name, mob });

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    if (hp) return; // bot
    if (!ok[4]) { setErr('Add your first name and mobile so AGD can reply.'); return; }
    window.open(wa(text), '_blank', 'noopener');
    setDone(true);
    // site.formKey: when Dan adds a Web3Forms key, also email the same details here.
    void site.formKey;
  };

  if (done) {
    return (
      <div className="plan done" role="status">
        <p className="plan-q">WhatsApp is open with your details.</p>
        <p className="muted">Press send there and it goes straight to AGD Venetian Plastering.</p>
        <a className="btn btn-ghost" href={wa(text)} target="_blank" rel="noopener">Open WhatsApp again</a>
      </div>
    );
  }

  const Choice = ({ opts, val, set, multi }: { opts: string[]; val: string | string[]; set: (v: string) => void; multi?: boolean }) => (
    <div className="chips" role={multi ? 'group' : 'radiogroup'} aria-label={Q[step]}>
      {opts.map((o) => {
        const on = Array.isArray(val) ? val.includes(o) : val === o;
        return <button type="button" key={o} role={multi ? 'checkbox' : 'radio'} aria-checked={on} className={`chip ${on ? 'on' : ''}`} onClick={() => set(o)}>{o}</button>;
      })}
    </div>
  );
  const pick = (set: (v: string) => void, next: number) => (v: string) => { set(v); setTimeout(() => setStep(next), 200); };

  const Q = ['Which room?', 'Which finish?', 'Roughly how big?', 'Your postcode', 'Who’s asking?'];
  return (
    <form className="plan" onSubmit={submit} noValidate>
      <div className="plan-top" aria-hidden="true">
        {Q.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
      </div>
      <p className="plan-n">Step {step + 1} of 5</p>
      <h3 className="plan-q" aria-live="polite">{Q[step]}</h3>
      {step === 0 && <><p className="muted small">Pick as many as you like.</p><Choice multi opts={ROOMS} val={room} set={(v) => setRoom((r) => (r.includes(v) ? r.filter((x) => x !== v) : [...r, v]))} /></>}
      {step === 1 && <Choice opts={FINISHES} val={finish} set={pick(setFinish, 2)} />}
      {step === 2 && <Choice opts={SIZES} val={size} set={pick(setSize, 3)} />}
      {step === 3 && (
        <label className="field"><span>Postcode</span>
          <input value={pc} onChange={(e) => setPc(e.target.value)} autoComplete="postal-code" maxLength={8} aria-describedby="pc-help" />
          <small id="pc-help" className="muted">The first half is fine, for example SW1A.</small>
        </label>
      )}
      {step === 4 && (
        <div className="two">
          <label className="field"><span>First name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></label>
          <label className="field"><span>Mobile</span><input value={mob} onChange={(e) => setMob(e.target.value)} autoComplete="tel" inputMode="tel" /></label>
          <label className="hp" aria-hidden="true">Leave this empty<input tabIndex={-1} value={hp} onChange={(e) => setHp(e.target.value)} autoComplete="off" /></label>
        </div>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <div className="plan-act">
        {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 4
          ? <button key="next" type="button" className="btn btn-ink" disabled={!ok[step]} onClick={() => setStep(step + 1)}>Next</button>
          : <button key="send" type="submit" className="btn btn-berry">Send on WhatsApp</button>}
      </div>
      <p className="fine">No prices here. Every wall is different, so you get a proper quote.</p>
    </form>
  );
}
