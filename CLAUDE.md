# EnrollFlo — Project Context

## What this is
Luxury one-page website funnel for EnrollFlo, a marketing agency selling "The Evergreen Enrollment Engine™" to music educators (£1,500 setup + £997/mo).

## Live deployment
- URL: https://enrollflo.vercel.app
- Vercel project: `dnilicj-2275s-projects/enrollflo`
- Vercel team scope: `dnilicj-2275s-projects`
- Git: branch `claude/luxury-agency-website-funnel-yBr8n` on `dnilicj-wq/Clause-code`

## Stack
- `index.html` — single-file luxury frontend (vanilla HTML/CSS/JS, no framework)
- `server.js` — Express backend, exports `module.exports = app` for Vercel
- `voice-agent.js` — Twilio + OpenAI voice AI, exports `setupVoiceRoutes(app)`
- `api/index.js` — Vercel serverless entry point (`require('../server')`)
- `vercel.json` — routes all traffic to `api/index.js`, includes `index.html`

## Design
- Gold (`#C8A96E`) / black (`#060606`) palette
- Playfair Display + Inter fonts
- Magnetic cursor, IntersectionObserver scroll reveal, grain texture overlay
- Sections: Hero → Ticker → Problem → Solution → Voice Demo → Chatbot Demo → Results → Pricing → CTA → Footer

## Features
1. **AI Chatbot** — qualifies leads (name/email/phone/offer/price/traffic), fetches GHL calendar slots, books appointments, creates GHL contacts + pipeline opportunities
2. **Voice Demo section** — phone input + country code selector, 60s SVG countdown ring, 3-step progress, calls `/voice/demo` → Twilio dials visitor
3. **Outbound Voice AI** — GPT-4o (Polly.Amy-Neural), qualifies + books during call, handles voicemail/AMD

## API routes
| Route | Purpose |
|---|---|
| `GET /api/slots` | GHL free slots (fallback if calendar unconfigured) |
| `POST /api/book` | Upsert GHL contact + appointment + pipeline opp |
| `POST /voice/trigger` | GHL webhook → Twilio outbound call |
| `POST /voice/response` | Twilio call answered → init session + AI opening |
| `POST /voice/gather` | Speech input loop |
| `POST /voice/status` | Call ended → tag GHL contact + cleanup |
| `POST /voice/demo` | Website demo → rate-limited Twilio call (1/number/10min) |

## GHL credentials
All set in Vercel env vars — see `.env` locally or Vercel dashboard. Keys: `GHL_KEY`, `LOCATION_ID`, `CALENDAR_ID`, `PIPELINE_ID`, `STAGE_QUALIFIED`, `SERVER_URL`.

## Pending (user must add to Vercel env then redeploy)
- `TWILIO_SID`, `TWILIO_AUTH`, `TWILIO_NUMBER` — activates voice demo + outbound calls
- `OPENAI_KEY` — activates AI conversation during calls
- GHL calendar open hours — needed for real slot fetching (currently uses fallback)

## Clientgateway demo sites
Separate from EnrollFlo. The `demos/` folder holds solar, coating, lethal-precision, revive, rhino, gafflow, cmd-tiling, royal-resin, colt and kt-construction. Each is its own Vercel project, `clientgateway-<name>` (scope `dnilicj-2275s-projects`). Before touching them, read `HANDOVER-clientgateway-demos.md`, plus `demos/<name>/README.md` where it exists (rhino, gafflow, royal-resin, colt and kt-construction have one).

Deploy from the demo folder:

```bash
npx -y vercel@latest deploy --prod --yes --scope dnilicj-2275s-projects --token "$VERCEL_TOKEN"
```

Never print or commit `VERCEL_TOKEN`. Don't touch the `enrollflo` or `clientgateway` Vercel projects.

Rules for all demos:
- **Image caching:** `vercel.json` caches images, fonts and brand files as immutable for a year. When an image changes, give it a new filename and update the references. Never overwrite a file in place; phones keep showing the old one.
- **Upscaling:** use Real-ESRGAN locally (CPU torch, model `RealESRGAN_x4plus.pth`), only for photos the user asks to sharpen. Use the client's real photos only, never generated imagery. The Higgsfield account was out of credits.
- **Blocked sources:** Checkatrade (Cloudflare) and Facebook (login) can't be fetched. Never invent reviews or work around a login; ask the user, or use clearly labelled placeholders.
- **Pitch images:** side-by-side "Your site today" vs "Your new site" images go in `demos/<name>/pitch/`, captured at a device scale factor of 2.

- **cmd-tiling** (CMD Tiling, Irchester, Northamptonshire) is a single-file `index.html` plus 6 PNG project photos. The user rejected their own redesign, so keep my original design and change only what is asked. Still placeholders: the review names and towns, the certificates, `[FORM ENDPOINT]`, and the CONFIRM tags.
- **royal-resin** (Royal Resin Ltd, Derby, owner Harry) is v3, "fewer, better, bigger". Its `index.html` is built by a script outside the repo, so edit `demos/royal-resin/index.html` directly.
  - **Look:** backgrounds alternate ivory, espresso #14110E and stone #E9E3DA, with full-bleed floors between, and no two neighbouring sections share one. There are no white frames around photos.
  - **Brand:** the crest is one flat gold (#B8893B), a ring plus a 3-point crown, in `brand/`. It appears only in the header and the footer. Don't bring back the multi-colour logo, gradients or the crest used as an avatar.
  - **Hero:** the pearl marble kitchen photo with no video, a 20s drift and a bottom gradient only.
    - It's upscaled 4× with Real-ESRGAN: `images/hero/hero-d-1600`/`-2880` for desktop and `hero-m-780`/`-1170` for phones.
  - **Media:** video stills (max 576-720 wide) may only appear at thumbnail size. The collection shows a maximum of 6 floors. Never show customer names, number plates or tape.
  - **Facts:** use only those in the README, checked against the royalresin.uk text. The site doesn't say sample boards are free. No prices, warranties or certifications.
  - **Go-live:** `FORM_ENDPOINT` must forward to harry@royalresin.uk, and the Google reviews link needs his Business Profile URL.
  - **Mobile rules:**
    - The headline and both buttons must be visible on the first screen at 375-390px.
    - The sticky bar stays hidden over the hero and the form.
    - The cookie pill sits top-left and goes after the first scroll or 6 seconds.
    - The page must never be wider than the viewport.
    - Don't add `backdrop-filter` over the drifting hero; it costs about 400ms of TBT.

- **colt** (COLT Building Contractors, High Wycombe roofers) is a single-file `index.html`, plus `thank-you.html` and `privacy.html`. Its `index.html` is built by a script outside the repo, so edit the files directly.
  - **Palette:** built around their navy and yellow logo (navy #0b1d3a, paper #f4f1ec, logo yellow #facd01 for calls to action). Keep the logo unchanged, on light backgrounds only.
  - **Calls to action:** one primary label, "Get my free roof quote".
  - **Quote section:** a navy band with the white form card.
  - **Facts:** only those in `demos/colt/README.md`. Never invent reviews. The Checkatrade quotes are still placeholders (it blocks bots).
  - **Photos:** their own photos only. Images are cached as immutable, so give a changed image a new filename; never overwrite one in place.
    - The hero is the crew working on the roof of a big brick house (g-01r, upscaled 4×). The user chose it; keep it.
    - Recent work leads with finished roofs, then at most 2 shots captioned "How we build it".
  - **Reviews:** the three cards are visible placeholders until the client supplies real Checkatrade reviews.
  - **Mobile:** the page must stay under 12 phone screens (about 9,860px now).
  - **Anatomy:** a stepper over an inline cutaway SVG.

- **kt-construction** (KT Construction, microcement and decorative finishes, Hurstpierpoint/Crawley) is an 8-chapter one-page "journey": WebGL trowel hero, CSS 3D layer stack, Three.js room configurator (real KT colour codes and published 2026 rates), 3D photo corridor. Vercel project `clientgateway-kt-construction`. After editing `src/config3d.js`, re-bundle it to `js/config3d.js` with esbuild. Real KT photos only (their site mixes in AI/manufacturer renders). No review text (Facebook login).

## User preference
Minimal messages. Only message when important. User asks questions if needed.
