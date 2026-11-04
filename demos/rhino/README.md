# Rhino Coating demo (clientgateway-rhino)

This is a premium site and booking funnel for Rhino Coating Ltd (David O'Rourke), built as a demo. It is live at https://clientgateway-rhino.vercel.app.

## Files that matter
| File | What it is |
|---|---|
| `rates.config.mjs` | **The file David edits.** Estimator £/m² rates (currently placeholders), space presets, the finance offer, and the form service key. |
| `site.config.mjs` | Business facts, systems, layer stack, FAQs, gallery and postcode areas. Every fact is from rhinocoating.co.uk. |
| `data/cities.mjs` | The 10 city pages, each with its own local angle. |
| `data/legacy.json` | Blog posts and legal pages ported from the live site (`tools/extract-legacy.py`). |
| `content-inventory.md` | Full crawl of the live site: every URL, title, meta, H1, claim, FAQ and image. |
| `DESIGN.md` | The design brief and how the five design skills were reconciled. |
| `redirects.md` | URL map; all 32 live slugs are kept, plus the host-level 301s to add at launch. |
| `beats-current-site.md` | Five points for Dan's reply to David. |

## Build and deploy
Build locally:

```bash
npm install && npm run build
```

Deploy:

```bash
npx vercel@latest deploy --prod --yes --scope dnilicj-2275s-projects --token "$VERCEL_TOKEN"
```

`npm run build` writes `dist/`. For an audit build without the demo's noindex, use:

```bash
NOINDEX=0 OUT=dist-launch node build.mjs
```

## Connecting the quote form
Put a Web3Forms access key or a Formspree endpoint in `rates.config.mjs > form`. Both are free tiers, and neither needs a secret in code.

While both are empty the form runs in demo mode: it completes and shows the thank-you page without sending anything. Photo attachments need a plan that accepts files (Formspree paid, or Web3Forms Pro). Otherwise customers can WhatsApp their photos.

## Honest-content rules this build follows
- Only Rhino's own photos and Instagram posts are used. The hero is the McLaren purple flake image from Rhino's Instagram, used as mood with no caption. The M-Flow image is a 3D render and is labelled as one.
- There are no invented reviews, names, stats or prices. The review panel is an empty, labelled slot for real Google reviews.
- The estimator shows ranges only, marked "Indicative, confirmed after free survey".
