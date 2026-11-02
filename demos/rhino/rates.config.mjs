// ─────────────────────────────────────────────────────────────────────────────
//  RHINO COATING: ESTIMATOR RATES AND FORM SETTINGS (the only file David edits)
//
//  The estimator on the home page shows an INDICATIVE price range, always labelled
//  "indicative, confirmed after free survey". Rhino does not publish prices, so the
//  per-m² numbers below are PLACEHOLDERS. Set them to your real rates.
//
//  After editing: `npm run build`, then redeploy.
// ─────────────────────────────────────────────────────────────────────────────
export default {
  // £ per m², all-in (prep, materials, labour). [low, high].  ← SET YOUR REAL RATES
  systems: {
    'HB-200': { label: 'Rhino HB-200', finish: 'Solid high build', perM2: [45, 65] },
    'FB-400': { label: 'Rhino FB-400', finish: 'Full flake broadcast', perM2: [55, 80] },
    'M-Flow': { label: 'Rhino M-Flow', finish: 'Marble effect', perM2: [85, 120] },
  },

  // Space presets. m² values for garages come from Rhino's own cost guide
  // (single 15-18 m², double 30-36 m²). The visitor can adjust the size slider.
  spaces: {
    single: { label: 'Single garage', m2: 17, min: 10, max: 30 },
    double: { label: 'Double garage', m2: 33, min: 24, max: 60 },
    gym: { label: 'Home gym or garden room', m2: 20, min: 8, max: 60 },
    commercial: { label: 'Commercial or industrial', m2: 120, min: 40, max: 1000 },
  },

  // Finance shown next to the estimate: "from £X/month over 12 months interest-free".
  // Matches the offer on rhinocoating.co.uk: 0% for 12 months, then 9% APR.
  finance: { interestFreeMonths: 12, aprAfter: 9 },

  // ── Quote form ──
  // Paste a Web3Forms access key OR a Formspree endpoint. Leave both empty for demo
  // mode (the form completes without sending anything). No secrets live in code:
  // a Web3Forms access key is designed to be public.
  form: {
    web3formsAccessKey: '',             // e.g. from https://web3forms.com (free)
    formspreeEndpoint: '',              // e.g. 'https://formspree.io/f/xxxxxxx'
    notifyEmail: 'info@rhinocoating.co.uk',
  },
};
