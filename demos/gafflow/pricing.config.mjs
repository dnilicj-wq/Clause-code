// ─────────────────────────────────────────────────────────────────────────────
//  GAFFLOW ESTIMATOR PRICING: SET TO GAFFLOW'S REAL RATES
//
//  Every £ figure the estimator shows comes from this file and nowhere else.
//  Gafflow does not publish installation prices, so the numbers below are
//  EXAMPLE PLACEHOLDERS, not Gafflow's prices. The site labels the result
//  "Example range". Replace them with Gafflow's real rates before launch.
//
//  After editing: `npm run build`, then redeploy.
// ─────────────────────────────────────────────────────────────────────────────
export default {
  // £ per m², all-in (preparation, materials, labour). [low, high].  ← SET TO GAFFLOW'S REAL RATES
  finishes: {
    metallic: { label: 'Metallic epoxy', perM2: [95, 140] },
    marble: { label: 'Marble effect', perM2: [95, 140] },
    flake: { label: 'Flake or single colour', perM2: [55, 85] },
    pu: { label: 'PU comfort (Arturo)', perM2: [75, 115] },
    bound: { label: 'Resin bound', perM2: [70, 110] },
  },

  // Space presets. The visitor adjusts the size slider; `finishes` limits what each space offers.
  spaces: {
    kitchen: { label: 'Kitchen', m2: 20, min: 6, max: 60, finishes: ['metallic', 'marble', 'pu'] },
    hallway: { label: 'Hallway', m2: 10, min: 3, max: 40, finishes: ['metallic', 'marble', 'pu'] },
    bathroom: { label: 'Bathroom', m2: 6, min: 2, max: 20, finishes: ['metallic', 'marble'] },
    ground: { label: 'Whole ground floor', m2: 70, min: 30, max: 250, finishes: ['metallic', 'marble', 'pu'] },
    garage: { label: 'Garage', m2: 18, min: 10, max: 60, finishes: ['flake', 'metallic'] },
    commercial: { label: 'Bar, salon or shop', m2: 80, min: 20, max: 1000, finishes: ['metallic', 'marble', 'flake', 'pu'] },
    driveway: { label: 'Driveway or patio', m2: 50, min: 10, max: 300, finishes: ['bound'] },
  },

  // Smallest figure the estimator will show. ← SET TO GAFFLOW'S REAL MINIMUM
  minimumJob: 1200,
};
