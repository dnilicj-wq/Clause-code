import { useEffect, useRef, useState } from 'react';
import { AnimatedSparkline } from '@/components/library/sparkline/Sparkline';

// Example site readings (not real data) for "we check conditions before we pour".
const hours = ['7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm'];
const mk = (a: number[]) => a.map((value, i) => ({ label: hours[i], value }));
const cards = [
  { label: 'Slab temp', data: mk([6.5, 7.1, 8.0, 9.2, 10.4, 11.3, 12.0, 12.6]), suffix: '°C', good: 'up' as const },
  { label: 'Air humidity', data: mk([88, 86, 82, 77, 72, 68, 66, 64]), suffix: '%', good: 'down' as const, digits: 0 },
  { label: 'Dew point gap', data: mk([1.2, 1.6, 2.3, 3.1, 3.8, 4.4, 4.9, 5.3]), suffix: '°C', good: 'up' as const },
];
export default function SparklineDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setK((x) => x + 1), { threshold: 0.4 });
    ref.current && io.observe(ref.current); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>Before we pour</p>
      <h3 className="mb-4 mt-1 font-display text-xl font-semibold">We wait for the floor, not the clock</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <button key={c.label} className="text-left" onClick={() => setK((x) => x + 1)} aria-label={`Replay ${c.label}`}>
            <AnimatedSparkline label={c.label} data={c.data} valueSuffix={c.suffix} digits={c.digits ?? 1} goodWhen={c.good} replayKey={k} footnote="7am to 2pm" deltaMode="absolute" sparkClassName="h-16 sm:h-auto" />
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>Example readings, not real data. Resin needs the slab warm enough and dry enough; we check on the day.</p>
    </div>
  );
}
