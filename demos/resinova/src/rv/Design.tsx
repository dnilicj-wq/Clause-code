import { useState } from 'react';
import Swap from './Swap';
import { FINISHES, SPACES, TONES, type FinishId, type SpaceId, type Spec, type ToneId } from './data';

// "Design your surface": Space → Finish → Tone. The big stage re-pours with the chosen finish and tone,
// the inset shows the kind of space, and the gold "Your design" card carries the spec into the quote form.
export default function Design({ onQuote }: { onQuote: (s: Spec) => void }) {
  const [space, setSpace] = useState<SpaceId>('living');
  const [fin, setFin] = useState<FinishId>('metallic');
  const [tone, setTone] = useState<ToneId>('onyx');
  const sp = SPACES.find((s) => s.id === space)!;
  const fins = FINISHES.filter((f) => sp.fins.includes(f.id));
  const f = FINISHES.find((x) => x.id === fin)!;
  const t = TONES.find((x) => x.id === tone)!;
  const src = `/viz/${fin}-${tone}-v1.webp`;

  const pickSpace = (id: SpaceId) => {
    setSpace(id);
    const s = SPACES.find((x) => x.id === id)!;
    if (!s.fins.includes(fin)) setFin(s.fins[0]);
  };

  return (
    <div className="dz">
      <div className="dz-stage">
        <Swap src={src} className="dz-swap" label={`Visualisation of a ${f.label.toLowerCase()} finish in ${t.label.toLowerCase()}`} />
        <span className="chip-viz">Visualisation</span>
        <figure className="dz-space" key={space}>
          <img src={`/viz/${sp.img}-sm-v1.webp`} alt={`Example image: a ${sp.label.toLowerCase()}`} width={400} height={500} loading="lazy" decoding="async" />
          <figcaption>{sp.label}<small>Example image</small></figcaption>
        </figure>
      </div>

      <div className="dz-panel">
        <fieldset className="dz-row">
          <legend><span className="dz-n">1</span>Space</legend>
          <div className="pills" role="radiogroup" aria-label="Space">
            {SPACES.map((s) => (
              <button type="button" key={s.id} role="radio" aria-checked={space === s.id} className={`pill ${space === s.id ? 'on' : ''}`} onClick={() => pickSpace(s.id)}>{s.label}</button>
            ))}
          </div>
        </fieldset>
        <fieldset className="dz-row">
          <legend><span className="dz-n">2</span>Finish</legend>
          <div className="pills" role="radiogroup" aria-label="Finish">
            {fins.map((x) => (
              <button type="button" key={x.id} role="radio" aria-checked={fin === x.id} className={`pill ${fin === x.id ? 'on' : ''}`} onClick={() => setFin(x.id)}>{x.label}</button>
            ))}
          </div>
          <p className="dz-note">{f.note}</p>
        </fieldset>
        <fieldset className="dz-row">
          <legend><span className="dz-n">3</span>Tone</legend>
          <div className="tones" role="radiogroup" aria-label="Tone">
            {TONES.map((x) => (
              <button type="button" key={x.id} role="radio" aria-checked={tone === x.id} aria-label={x.label} className={`tone ${tone === x.id ? 'on' : ''}`} onClick={() => setTone(x.id)}>
                <i style={{ background: x.sw }} /><span>{x.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="yours" aria-live="polite">
          <p className="yours-k">Your design</p>
          <p className="yours-v"><span>{sp.label}</span><span>{f.label}</span><span>{t.label}</span></p>
          <button type="button" className="btn btn-gold" onClick={() => onQuote({ space: sp.label, finish: f.label, tone: t.label })}>Get a quote for this design</button>
        </div>
      </div>
    </div>
  );
}
