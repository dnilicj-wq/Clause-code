import { DottedMap } from '@/components/library/dotted-map/DottedMap';
import { useSite } from '@/src/lib/ctx';

// Service-area map: Great Britain only, the base town pulsing, each covered town marked. Towns come from config/site.ts.
// Coordinates are plain geography (town centres); add a town here if a lead covers one that's missing.
const COORDS: Record<string, [number, number]> = {
  Leeds: [53.80, -1.55], Wakefield: [53.68, -1.50], Harrogate: [53.99, -1.54], Bradford: [53.80, -1.76], York: [53.96, -1.08],
  Huddersfield: [53.65, -1.78], Halifax: [53.73, -1.86], Dewsbury: [53.69, -1.63], Sheffield: [53.38, -1.47], Manchester: [53.48, -2.24],
  Liverpool: [53.41, -2.98], Birmingham: [52.49, -1.89], London: [51.51, -0.13], Bristol: [51.45, -2.59], Newcastle: [54.98, -1.61],
  Nottingham: [52.95, -1.15], Leicester: [52.64, -1.13], Hull: [53.74, -0.33], Doncaster: [53.52, -1.13], Glasgow: [55.86, -4.25], Edinburgh: [55.95, -3.19],
};
export default function DottedMapDemo() {
  const { site } = useSite();
  const towns = site.areas.filter((t) => COORDS[t]);
  const markers = towns.map((t) => ({ lat: COORDS[t][0], lng: COORDS[t][1], size: t === site.town ? 0.6 : 0.3, pulse: t === site.town, name: t }));
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,260px)_1fr]">
      <div className="relative mx-auto aspect-[5/6] w-full max-w-[260px]">
        <DottedMap width={50} height={60} mapSamples={2600} region={{ lat: { min: 50.0, max: 58.9 }, lng: { min: -10.6, max: 2.4 } }}
          markers={markers} dotRadius={0.36} dotColor="color-mix(in oklab, var(--muted) 50%, transparent)" markerColor="var(--accent)" pulse
          renderMarkerOverlay={({ marker, x, y }) => (marker as any).name === site.town ? (
            <g pointerEvents="none">
              <circle cx={x} cy={y} r={4.2} fill="var(--accent)" opacity={0.16} />
              <circle cx={x} cy={y} r={4.2} fill="none" stroke="var(--accent)" strokeOpacity={0.55} strokeWidth={0.18} strokeDasharray="0.6 0.5" />
              <text x={x + 5} y={y + 0.8} fontSize={2.6} fontWeight={600} fill="var(--ink)" style={{ fontFamily: 'var(--font-display)' }}>{site.town}</text>
            </g>
          ) : null} />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[.14em]" style={{ color: 'var(--muted)' }}>Where we work</p>
        <p className="mt-1 font-display text-[22px] font-semibold leading-tight">{site.town} and across {site.region}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {site.areas.map((a) => (
            <span key={a} className="rounded-full border px-2.5 py-1 text-[12px]" style={a === site.town ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' } : { borderColor: 'var(--line)', color: 'var(--muted)' }}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
