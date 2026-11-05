import { HeatStrip } from '@/components/library/heat-strip/HeatStrip';

// Illustrative shape only (not measured): tyres warm on a drive and stay warm for a while after parking.
const drive = [18, 22, 27, 31, 35, 38, 41, 43, 45, 46, 47, 48];
const parked = [47, 46, 44, 42, 40, 37, 34, 31, 28, 25, 22, 20];
const cells = [
  ...drive.map((v, k) => ({ v, phase: 'Driving home', label: `${k * 5} min` })),
  ...parked.map((v, k) => ({ v, phase: 'Parked on the floor', label: `${k * 5} min after parking` })),
];
export default function HeatStripDemo() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>Hot-tyre test</p>
      <h3 className="mb-5 mt-1 font-display text-xl font-semibold">Warm tyres stay warm after you park</h3>
      <HeatStrip cells={cells} min={15} max={50} format={(v) => `${v}°C`}
        phases={[{ from: 0, to: 11, name: 'Drive' }, { from: 12, to: 23, name: 'Parked' }]}
        caption="Illustration, not measured data. Thin paint can soften and lift under warm tyres; a bonded, built-up resin system is designed to stay put." />
    </div>
  );
}
