import { useState } from 'react';
import Swap from './Swap';
import { FINISHES, SPACES, TONES, type FinishId, type SpaceId, type Spec, type ToneId } from './data';

// "Design your surface": Space → Finish → Tone. The big stage re-pours with the chosen finish and tone,
// the "Your design" line carries the spec into the quote form.
export default function Design({ onQuote }: { onQuote: (s: Spec) => void }) {
  const [space, setSpace] = useState<SpaceId>('living');
  const [fin, setFin] = useState<FinishId>('metallic');
  const [tone, setTone] = useState<ToneId>('onyx');
  const sp = SPACES.find((s) => s.id === space)!;
  const fins = FINISHES.filter((f) => sp.fins.includes(f.id));
  const f = FINISHES.find((x) => x.id === fin)!;
  const t = TONES.find((x) => x.id === tone)!;
  // resin bound is stone, so only the stone tones make sense
  if (fin === 'bound' && !['carrara', 'smoke', 'champagne'].includes(tone)) queueMicrotask(() => setTone('champagne'));
  // Venetian uses the gold-leaf set
  const src = `/viz/${fin === 'venetian' ? 'venetian-gold' : fin}-${tone}-v1.webp`;

  const pickSpace = (id: SpaceId) => {
    setSpace(id);
    const s = SPACES.find((x) => x.id === id)!;
    if (!s.fins.includes(fin)) setFin(s.fins[0]);
  };

  return (
    <div className="dz">
      <div className="dz-stage">
        <Swap src={src} className="dz-swap" label={`Visualisation of a ${f.label.toLowerCase()} finish in ${t.label.toLowerCase()}`} />
        <p className="viz-note">Visualisation</p>
      </div>

      <div className="dz-panel">
        <fieldset className="dz-row">
          <legend>Space</legend>
          <div className="pills" role="radiogroup" aria-label="Space">
            {SPACES.map((s) => (
              <button type="button" key={s.id} role="radio" aria-checked={space === s.id} className={`pill ${space === s.id ? 'on' : ''}`} onClick={() => pickSpace(s.id)}>{s.label}</button>
            ))}
          </div>
        </fieldset>
        <fieldset className="dz-row">
          <legend>Finish</legend>
          <div className="pills" role="radiogroup" aria-label="Finish">
            {fins.map((x) => (
              <button type="button" key={x.id} role="radio" aria-checked={fin === x.id} className={`pill ${fin === x.id ? 'on' : ''}`} onClick={() => setFin(x.id)}>{x.label}</button>
            ))}
          </div>
          <p className="dz-note">{f.note}</p>
        </fieldset>
        <fieldset className="dz-row">
          <legend>Tone</legend>
          <div className="tones" role="radiogroup" aria-label="Tone">
            {TONES.filter((x) => fin !== 'bound' || ['carrara', 'smoke', 'champagne'].includes(x.id)).map((x) => (
              <button type="button" key={x.id} role="radio" aria-checked={tone === x.id} aria-label={x.label} className={`tone ${tone === x.id ? 'on' : ''}`} onClick={() => setTone(x.id)}>
                <i style={{ background: x.sw }} /><span>{x.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="yours" aria-live="polite">
          <p className="yours-v">Your design: {sp.label}, {f.label.toLowerCase()}, {t.label.toLowerCase()}.</p>
          <button type="button" className="btn btn-gold" onClick={() => onQuote({ space: sp.label, finish: f.label, tone: t.label })}>Get a quote for this design</button>
        </div>
      </div>
    </div>
  );
}
