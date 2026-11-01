# Clientgateway demo sites

Two re-skinnable conversion sites. Each folder is a separate Vercel project (set **Root Directory** to the folder).

| Folder | Niche | Signature moment |
|---|---|---|
| `solar/` | UK solar installer | Real-time 3D house: panels are lowered onto the roof; the "How it works" story scrubs survey scan, panel-by-panel quote, install, then evening battery glow |
| `coating/` | US epoxy / polyaspartic contractor | Real-time 3D garage: a bucket tips and a glossy flake coat spreads over cracked concrete; "Choose your look" lets visitors tap a finish to preview it |

## Tailor for a prospect (minutes)
1. Edit `site.config.mjs`: company, town, phone, owner, logo/brand colour (`brand`), reviews, jobs, team, pricing, service `areas`.
   Reviews/jobs/team text can use `{Company}`, `{Town}`, `{Owner}`, `{OwnerFirst}`.
2. `npm install && npm run build`, then deploy.

Demo mode: the defaults are believable fictional businesses (Brightside Solar, Harrogate; Summit Coatings, Boise).
The build **fails** if any `{Token}` used on a page is empty, so a prospect never sees a placeholder.
Date-based values (days to the 0% VAT deadline, "Now booking <month> installs", estimator samples) are
worked out at build and recalculated in the browser on load (`src/derive.js`).

Instant preview without a rebuild: `/?company=Northlight%20Energy&town=Leeds&phone=0113%20496%200199`.

## Built-in conversion mechanics
- Estimators always show the price range first (solar: price, yearly saving, payback; coating: $ range + monthly finance figure),
  then offer "Want the exact figure? Book a free survey/visit" (name, phone, postcode/ZIP, best time to call; coating adds a timeline qualifier).
- Cheaper-quote filter sections (solar comparison table + "send us your quote"; coating "$1.50/sq ft, here's what got skipped").
- Every form promises a reply within `{ResponseTime}` during working hours.
- Click-to-call everywhere; sticky mobile bar (coating adds Text us).
- Forms post JSON to `formEndpoint` (GHL / Zapier / Make webhook). Empty = simulated success.
- Events pushed to `dataLayer` (+ `gtag` / `fbq`): `call_click`, `cta_click`, `form_submit`, `estimator_start`, `estimator_step`,
  `estimator_complete`, `estimator_update`, `estimator_book_click`, `estimator_lead`, `faq_open`, `finish_preview`, `before_after_drag`. Add `?debug` to see them.
- `/areas/<town>/` pages, LocalBusiness JSON-LD, canonical + OG tags, sitemap, robots.

## Performance
3D starts once the page is idle on desktop, and on the first scroll/tap on touch devices. Machines without a GPU get the posters.
`?gl=force` / `?gl=off` override. Lighthouse mobile (local, brotli): solar 99, coating 89–90.

## Why it's built this way (research notes)
- Fear first, then proof: solar buyers fear mis-selling and vanishing installers; coating buyers fear peeling and "DIY kit with a markup". Both pages answer that fear before asking for anything.
- Instant estimators qualify and capture: competitors like MyGarageFloors lead with "online quote in 60 seconds"; GlossWorks uses a size selector first. Vendor data (Outgrow, Involve.me) suggests calculators beat static pages; treat as directional and A/B test the two capture modes.
- Show the real person: Conversion Rate Experts reported a 79% lead lift from putting a real team member on the page. Replace the photo slots with real owner/crew photos before launch.
- Scroll-scrubbed 3D (the Awwwards "product scroll" pattern) is used where it explains something: how the install works, why the floor won't fail, what the finish will look like. It is real-time WebGL, not video, so it stays sharp and light.

## Images
All imagery is rendered from the live 3D scenes (`tools/capture.*`). Swap in the prospect's real job photos at the same paths in `src/img/`.
