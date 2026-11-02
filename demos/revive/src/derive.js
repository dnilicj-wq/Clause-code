// Pure helpers shared by the build (static HTML) and the browser (live values).

const r10 = (n) => Math.round(n / 10) * 10;
const r100 = (n) => Math.round(n / 100) * 100;
export const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
const perFt = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));

export function estimate(P, { space = 'two', sqft, finish = 'flake', condition = 'good' } = {}) {
  const s = Number(sqft || P.spaces[space]?.sqft || 484);
  const [lo, hi] = P.perSqft[finish];
  const add = P.condition[condition] || 0;
  const low = r10(Math.max(P.minimumJob, s * (lo + add)));
  const high = r10(Math.max(P.minimumJob * 1.25, s * (hi + add)));
  return { space, sqft: s, finish, condition, low, high };
}

// Monthly payment on an amortised loan (example finance figure).
export function monthly(amount, apr, months) {
  const r = apr / 100 / 12;
  return r ? (amount * r) / (1 - Math.pow(1 + r, -months)) : amount / months;
}

export function bookingMonth(now = new Date(), leadDays = 21) {
  const d = new Date(now.getTime() + leadDays * 86400000);
  return d.toLocaleDateString('en-US', { month: 'long' });
}

export default function derive(config, now = new Date()) {
  const P = config.estimator;
  const s = estimate(P, { space: 'two', finish: 'flake', condition: 'good' });
  const f = config.finance;
  return {
    BookingMonth: bookingMonth(now, config.leadTimeDays),
    SampleLow: usd(s.low), SampleHigh: usd(s.high),
    TypicalLow: usd(r100(s.low)), TypicalHigh: usd(r100(s.high)),
    FlakePrice: perFt(P.perSqft.flake[0]), MetallicPrice: perFt(P.perSqft.metallic[0]), SolidPrice: perFt(P.perSqft.solid[0]),
    MinimumJob: usd(P.minimumJob),
    FinanceFrom: usd(Math.ceil(monthly(s.low, f.apr, f.months))),
    FinanceExample: `Example: ${usd(s.low)} over ${f.months} months at ${f.apr}% APR, with approved credit.`,
  };
}
