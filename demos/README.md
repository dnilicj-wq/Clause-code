# Clientgateway demo sites

Two re-skinnable conversion sites. Each folder is a separate Vercel project (set **Root Directory** to the folder).

| Folder | Niche | Signature moment |
|---|---|---|
| `solar/` | UK solar installer | Real-time 3D house: panels are lowered onto the roof; the "How it works" story scrubs survey scan, panel-by-panel quote, install, then evening battery glow |
| `coating/` | US epoxy / polyaspartic contractor | Real-time 3D garage: a bucket tips and a glossy flake coat spreads over cracked concrete; "Choose your look" lets visitors tap the floor to re-pour any finish |

## Tailor for a prospect (minutes)
1. Edit `site.config.mjs` (company, town, phone, reviews, jobs, pricing ranges, service areas).
2. `npm install && npm run build`, then deploy.

Instant preview without a rebuild: `/?company=Brightroof%20Solar&town=Harrogate&phone=01423%20555%20019`.
Unfilled tokens show as highlighted `{Token}` slots so nothing is invented.

## Built-in conversion mechanics
- Estimator with lead capture **before** or **after** the figure: `estimatorCapture` in config, or test with `?capture=before` / `?capture=after`.
- Click-to-call everywhere; sticky Call / Estimate bar on mobile.
- Short enquiry form (name, phone, postcode/ZIP, optional message) posting JSON to `formEndpoint` (GHL / Zapier / Make webhook). Empty = simulated success.
- Events pushed to `dataLayer` (+ `gtag` / `fbq` if present): `call_click`, `cta_click`, `form_submit`, `estimator_start`, `estimator_step`, `estimator_complete`, `estimator_lead`, `faq_open`, `finish_preview`, `before_after_drag`. Add `?debug` to see them fire on screen.
- `/areas/<town>/` location pages ("{Service} in {Town}"), LocalBusiness JSON-LD, sitemap, robots.

## Why it's built this way (research notes)
- Fear first, then proof: solar buyers fear mis-selling and vanishing installers; coating buyers fear peeling and "DIY kit with a markup". Both pages answer that fear before asking for anything.
- Instant estimators qualify and capture: competitors like MyGarageFloors lead with "online quote in 60 seconds"; GlossWorks uses a size selector first. Vendor data (Outgrow, Involve.me) suggests calculators beat static pages; treat as directional and A/B test the two capture modes.
- Show the real person: Conversion Rate Experts reported a 79% lead lift from putting a real team member on the page. Replace the photo slots with real owner/crew photos before launch.
- Scroll-scrubbed 3D (the Awwwards "product scroll" pattern) is used where it explains something: how the install works, why the floor won't fail, what the finish will look like. It is real-time WebGL, not video, so it stays sharp and light.

## Images
All imagery is rendered from the live 3D scenes (`tools/capture.*`) and labelled as sample renders on the page. Swap in real job photos at the same paths in `src/img/`.
