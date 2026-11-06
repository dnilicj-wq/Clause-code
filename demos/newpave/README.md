# Newpave Ltd demo site

Demo for Charles Quinn, Newpave Ltd (New Pave Limited, company number 16762535), Donnington, Telford.
Live demo: https://clientgateway-newpave.vercel.app

Plain static site: `public/` is the whole website. No build step except the 3D designer bundle.

## The three things to show Charles first

1. **Hero swipe.** Swipe or drag across the cracked old drive and fresh resin pours over it. Tap the colour dots to change the blend.
2. **Design your driveway.** Pick resin, block, tarmac or porcelain, a colour, a size and any extras. The 3D house updates, the new surface is "laid" across the drive, and an example price range shows before any contact details are asked for.
3. **Booking flow.** "Book my free survey with this design" carries the design into a five-step booking (postcode check, optional photo, day and time, name and mobile). The last screen gives the customer a big WhatsApp button with everything pre-filled for Charles.

## Before go-live: CONFIRM list

Every placeholder on the site is a dashed orange `[CONFIRM: ...]` tag. Hide them all for a clean pitch by adding `class="no-confirm"` to `<html>`.

| What | Where | Notes |
|---|---|---|
| Example rates per m² (resin £70–120, block £60–110, tarmac £40–80, porcelain £90–150) | `public/js/config.js` `RATES` | Shown only as "Example range, confirmed after a free survey". |
| Extras prices (edging, drainage, steps, lighting, dig-out) | `public/js/config.js` `EXTRAS` | Same. |
| "Charles replies the same day" | booking, service and area pages | Brief asked for it. Charles must be happy to promise it. |
| Guarantee | resin page | Nothing claimed. Add only if he offers one in writing. |
| Insurance, trade bodies, ratings | nowhere | Not on his site, so not on ours. Add if he has them. |
| Fixed written quotes | Why Newpave card | Wording: "A fixed price, in writing." |
| Tidy site every day | Why Newpave card | |
| Aftercare offer | How it works | |
| Build-up wording (layer depths) | Layer section | Generic best practice. Check it matches how he builds. |
| Typical job durations | FAQ | |
| Deposit policy | FAQ | |
| Wait time before driving on tarmac | tarmac page | |
| Which towns the area-page photos were taken in | area pages | Photos are his, towns are not stated. |
| Photo of Charles | Owner section ("Your photo here") | |
| Google review link | Owner section, `SITE.googleReview` in `config.js` | Paste his Google Business Profile "ask for reviews" link. |
| Testimonials: Sarah Thompson, James Carter, Rebecca Jones | `config.js` `TESTIMONIALS`, hidden (`showTestimonials: false`) | On his current site with no source. Get the exact wording and permission, then set the flag to `true`. |
| Real-job photos are his own work | `IMAGES.md` | Two photos (compass rose, circle patio) looked like supplier shots and are not used. No stock images are used anywhere on the site (Adobe Stock files are listed as stock in IMAGES.md). |
| Survey days | booking step 4 | Offers the next 7 days including weekends. Trim if he doesn't survey on Sundays. |
| Form handler | `config.js` `SITE.formEndpoint` | Empty = demo mode: the lead goes to Charles by WhatsApp from the customer's phone. Paste the form handler URL (same pattern as KT) and leads are also POSTed as JSON, photo included. |

## Notes

- **Search engines.** The demo sends `X-Robots-Tag: noindex` and a blocking `robots.txt` so it never competes with his live site. At go-live: remove the header from `public/vercel.json`, swap `robots.txt` for the commented version and submit `sitemap.xml`. Canonicals already point at `https://newpaveltd.co.uk`.
- **Same URLs as his site.** `/services/resin-drives/`, `/services/block-paving/`, `/services/patios/`, `/services/tarmac-driveways/`, `/services/hard-landscaping/`, `/areas-covered/telford/`, `/areas-covered/wolverhampton/`, `/areas-covered/birmingham/` all exist, so his Google rankings carry over. `/services`, `/areas-covered`, `/gallery`, `/reviews`, `/contact` redirect to the right section.
- **Logo.** His logo file was a low-res PNG, so the diamond mark was rebuilt as SVG (`public/brand/mark.svg`, `logo.svg`) using his orange (#F26A1B) and charcoal (#34343C).
- **Photos.** Soft photos were upscaled with Lanczos and sharpened (Real-ESRGAN isn't installed on this Mac). No real before/after pairs exist, so there is no before/after slider yet.
- **Phone numbers.** One main number (07787 707154, also WhatsApp) everywhere; landline and freephone only in the booking contact list and the footer.

## Scripts

| Command | What it does |
|---|---|
| `node scripts/fetch-newpave-images.mjs` | Crawl his site and save the largest version of every image to `public/img/source/` |
| `node scripts/optimise-images.mjs` | Make AVIF/WebP sizes, `jobs.json` and `IMAGES.md` |
| `node scripts/build-pages.mjs` | Rebuild the service and area pages from the homepage header and footer |
| `npx esbuild src/config3d.js --bundle --format=esm --minify --outfile=public/js/config3d.js` | Rebuild the 3D designer |
| `node scripts/render-posters.mjs` | Re-render the hero and designer posters and the share image (needs the local server on :4610) |
| `node scripts/test-links.mjs` | Fails on any wrong phone number, un-filled WhatsApp link, missing page or image, em dash or lorem ipsum |
| `node scripts/test-flow.mjs [url]` | Phone end-to-end: designer, out-of-area postcode, photo, slot, details, WhatsApp summary |
| `node scripts/screens.mjs [url]` | Full-page screenshots at 390 and 1440 into `screenshots/` |

Deploy: `cd public && npx vercel@latest deploy --prod --yes --scope dnilicj-2275s-projects` (project `clientgateway-newpave`).
