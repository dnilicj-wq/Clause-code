// Pure maths for the estimator (and the tests).
const r10 = (n) => Math.round(n / 10) * 10;

// Indicative range: m² × [low, high] £/m² for the chosen finish (rates.config.mjs),
// never below the minimum job.
export function estimate(R, { space, finish, m2 }) {
  const area = Math.max(1, Math.round(m2 || R.spaces[space].m2));
  const [lo, hi] = R.finishes[finish].perM2;
  const min = R.minimumJob || 0;
  const low = Math.max(min, r10(area * lo));
  const high = Math.max(low + r10(min * 0.25), r10(area * hi));
  return { space, finish, m2: area, low, high };
}
