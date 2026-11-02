# Gafflow Resin Finishes demo (clientgateway-gafflow)

A new site for Gafflow Resin Finishes (Harry, Ollie, Lou and the crew; Gafflow Resin Systems Ltd, Eastbourne), built as a demo. It covers their three businesses, installations, training courses and the product shop, as one site. Live: https://clientgateway-gafflow.vercel.app

## Files that matter
| File | What it is |
|---|---|
| `pricing.config.mjs` | **Set to Gafflow's real rates.** Every £ figure the estimator shows (£/m² per finish, space presets, minimum). The current numbers are example placeholders; the site labels them "Example range". |
| `site.config.mjs` | The enquiry phone number (one value drives every `tel:` and `wa.me` link), the quote form key, business facts, trust lines, the metallic system layers, pigment palette, finishes, gallery, testimonials, courses and FAQs. Every fact is from gafflowresinfinishes.com. |
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
Every shop, product and course-booking link on the site points to Gafflow's existing shop pages on gafflowresinfinishes.com. Matching product and category pages are also built here at the same paths (for launch), and their "Buy now" and "Book my place" buttons hand off to the same product on Gafflow's live WooCommerce store, and `/checkout/` and `/my-account/` redirect there. At launch, pick one: keep WooCommerce as the cart and checkout on a subdomain, or move checkout to Shopify Buy Button or Stripe Payment Links.

## Connecting the quote form
Put a Web3Forms access key or a Formspree endpoint in `site.config.mjs > form`. While both are empty the form runs in demo mode: it completes and shows the thank-you page without sending anything.

## Honest-content rules this build follows
- Only Gafflow's own finished-job photos, checked for tools, debris and unfinished work. The two Arturo PU images are labelled "Manufacturer image".
- All 14 testimonials are copied word for word from their /testimonials/ and /courses/ pages, with names as shown there. There are none for installations, so the Google panel is an empty, labelled slot.
- No invented prices. Product and course prices are theirs. The estimator rates are placeholders, labelled "Example range".
- No finance offer, warranty length or response time, because the live site makes none.
