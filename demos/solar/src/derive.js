// Pure helpers shared by the build (static HTML) and the browser (live values).
// Nothing here touches the DOM.

const r50 = (n) => Math.round(n / 50) * 50;
const r10 = (n) => Math.round(n / 10) * 10;
export const gbp = (n) => '£' + Math.round(n).toLocaleString('en-GB');

export function daysUntil(dateStr, now = new Date()) {
  const end = new Date(dateStr + 'T23:59:59');
  return Math.max(0, Math.ceil((end - now) / 86400000));
}

// Cautious UK estimate. Inputs: monthly bill (£), roof direction, battery choice.
export function estimate(P, { bill = 120, roof = 'unsure', battery = 'maybe' } = {}) {
  const usage = (bill * 12) / P.unitRate;                    // kWh a year
  const yieldK = P.yieldPerKwp[roof] || P.yieldPerKwp.unsure;
  const kw = P.panelWatts / 1000;
  const panels = Math.max(P.minPanels, Math.min(P.maxPanels, Math.round((usage * P.sizeToUsage) / yieldK / kw)));
  const kwp = panels * kw;
  const gen = kwp * yieldK;
  const withBatt = battery === 'yes';
  const self = Math.min(P.selfUse[withBatt ? 'battery' : 'panels'] * gen, usage);
  const base = self * P.unitRate + (gen - self) * P.exportRate;
  const low = r50(kwp * P.costPerKwp.low + (withBatt ? P.batteryCost.low : 0));
  const high = r50(kwp * P.costPerKwp.high + (withBatt ? P.batteryCost.high : 0));
  const saveLow = r10(base * P.savingsBand[0]);
  const saveHigh = r10(base * P.savingsBand[1]);
  const payLow = Math.max(1, Math.round(low / saveHigh));
  const payHigh = Math.max(payLow + 1, Math.round(high / saveLow));
  return { bill, roof, battery, usage, yieldK, panels, kwp, gen, self, low, high, saveLow, saveHigh, payLow, payHigh, withBatt };
}

export default function derive(config, now = new Date()) {
  const P = config.estimator;
  const s = estimate(P, { bill: 120, roof: 'south', battery: 'no' });
  const deadline = new Date(config.deadline.date + 'T12:00:00');
  return {
    DaysLeft: String(daysUntil(config.deadline.date, now)),
    DeadlineDate: deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    SampleLow: gbp(s.low), SampleHigh: gbp(s.high),
    SampleSaveLow: gbp(s.saveLow), SampleSaveHigh: gbp(s.saveHigh),
    SamplePayLow: String(s.payLow), SamplePayHigh: String(s.payHigh),
    SamplePanels: String(s.panels), SampleKwp: s.kwp.toFixed(2),
    TypicalKwp: s.kwp.toFixed(1),
    BatteryLow: gbp(P.batteryCost.low), BatteryHigh: gbp(P.batteryCost.high),
  };
}
