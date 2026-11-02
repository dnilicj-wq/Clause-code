# Gafflow Resin Finishes demo (clientgateway-gafflow)

A new site for Gafflow Resin Finishes (Harry, Ollie, Lou and the crew; Gafflow Resin Systems Ltd, Eastbourne), built as a demo. It covers their three businesses, installations, training courses and the product shop, as one site. Live: https://clientgateway-gafflow.vercel.app

## Files that matter
| File | What it is |
|---|---|
| `rates.config.mjs` | **The file Gafflow edits.** Estimator £/m² rates per finish (PLACEHOLDERS: Gafflow publishes no install prices), space presets, minimum job, and the quote form key. |
| `site.config.mjs` | Business facts, trust lines, the metallic system layers, pigment palette, finishes, gallery, testimonials, courses and FAQs. Every fact is from gafflowresinfinishes.com. |
| `data/products-raw.json` | All 41 products from their WooCommerce store: name, price, variations, stock and description. |
| `data/legacy.json` | Terms, refund, privacy and policies pages, ported verbatim. |
| `src/js/pour.js` | The "Design your floor" WebGL2 metallic pour (one fragment shader, ~3 KB, lazy-loaded). |
| `content-inventory.md` | Crawl of the live site: every URL, title, meta, H1, business facts and the problems found. |
| `DESIGN.md` | Design brief and decisions. |
| `redirects.md` | URL map: all 65 live URLs keep their exact path, trailing slash included. |
| `beats-current-site.md` | Points for the reply to Gafflow. |

## Build and deploy
```bash
npm install && npm run build
```
```bash
npx vercel@latest deploy --prod --yes --scope dnilicj-2275s-projects --token "$VERCEL_TOKEN"
```
Audit build without the demo noindex: `NOINDEX=0 OUT=dist-launch node build.mjs`.

## The shop in this demo
Product, course and category pages are fully built (prices, variations, stock, schema). The "Buy now" and "Book my place" buttons hand off to the same product on Gafflow's live WooCommerce store, and `/checkout/` and `/my-account/` redirect there. At launch, pick one: keep WooCommerce as the cart and checkout on a subdomain, or move checkout to Shopify Buy Button or Stripe Payment Links.

## Connecting the quote form
Put a Web3Forms access key or a Formspree endpoint in `rates.config.mjs > form`. While both are empty the form runs in demo mode: it completes and shows the thank-you page without sending anything.

## Honest-content rules this build follows
- Only Gafflow's own photos, from their site and posters. The two Arturo PU images are labelled "Manufacturer image".
- Testimonials are quoted from their site (some shortened at a sentence end). There are no installation testimonials on their site, so the Google panel is an empty, labelled slot.
- No invented prices. Product and course prices are theirs. The estimator rates are placeholders, labelled "Indicative, confirmed after a site survey".
- No finance offer, warranty length or response time, because the live site makes none.
