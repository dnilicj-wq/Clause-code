// Pure maths, shared by the estimator and the finance calculator (and the tests).

const r10 = (n) => Math.round(n / 10) * 10;

// Indicative range: m² × [low, high] £/m² for the chosen system (rates.config.mjs).
export function estimate(R, { space, system, m2 }) {
  const area = Math.max(1, Math.round(m2 || R.spaces[space].m2));
  const [lo, hi] = R.systems[system].perM2;
  return { space, system, m2: area, low: r10(area * lo), high: r10(area * hi) };
}

// Rhino's offer: 0% for the first 12 months, then `aprAfter`% on the remaining balance.
// One level monthly payment M over `term` months that clears the balance exactly:
//   balance after the interest-free months  B = P - k·M
//   B must equal the present value of the remaining (term - k) payments at r = APR/12:
//   P - k·M = M · (1 - (1 + r)^-(term - k)) / r   →   M = P / (k + a)
// For terms within the interest-free period it is simply P / term, with no interest.
export function monthlyPlan(cost, deposit, term, { interestFreeMonths: k = 12, aprAfter = 9 } = {}) {
  const P = Math.max(0, cost - deposit);
  if (!P || !term) return { financed: P, monthly: 0, total: P, interest: 0 };
  let monthly;
  if (term <= k) monthly = P / term;
  else {
    const r = aprAfter / 100 / 12, n = term - k;
    const a = (1 - Math.pow(1 + r, -n)) / r;
    monthly = P / (k + a);
  }
  monthly = Math.round(monthly * 100) / 100;
  const total = Math.round(monthly * term * 100) / 100;
  return { financed: P, monthly, total, interest: Math.max(0, Math.round((total - P) * 100) / 100) };
}
