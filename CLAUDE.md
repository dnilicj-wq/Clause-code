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
Separate from EnrollFlo. The `demos/` folder holds solar, coating, lethal-precision, revive, rhino, gafflow, cmd-tiling and royal-resin. Each is its own Vercel project, `clientgateway-<name>` (scope `dnilicj-2275s-projects`). Before touching them, read `HANDOVER-clientgateway-demos.md`, plus `demos/<name>/README.md` where it exists (rhino, gafflow and royal-resin have one).

Deploy from the demo folder:

```bash
npx -y vercel@latest deploy --prod --yes --scope dnilicj-2275s-projects --token "$VERCEL_TOKEN"
```

Never print or commit `VERCEL_TOKEN`. Don't touch the `enrollflo` or `clientgateway` Vercel projects.

- **cmd-tiling** (CMD Tiling, Irchester, Northamptonshire) is a single-file `index.html` plus 6 PNG project photos. The user rejected their own redesign, so keep my original design and change only what is asked. Still placeholders: the review names and towns, the certificates, `[FORM ENDPOINT]`, and the CONFIRM tags.
- **royal-resin** (Royal Resin Ltd, Derby, owner Harry) is v2, "The Royal Gallery". Its `index.html` is built by a script outside the repo, so edit `demos/royal-resin/index.html` directly.
  - Look: ivory and stone walls, with dark only in the hero and the designer. Every floor carries a museum placard (location · m² · colourway).
  - Brand: the crest is redrawn in one gold, in `brand/`. Don't bring back his multi-colour logo.
  - Hero: the `video/hero-walkthrough.mp4` clip. On desktop it hangs as a framed portrait; on phones it plays full-screen.
  - Media: all video is Harry's own, from Vimeo, max 576×1024. Never show a video still wider than 576px; large slots use the full-size photos only.
  - Facts: use only those listed in the README. Captions come only from royalresin.uk/masterpiece-of-the-week. No prices, warranties or certifications.
  - Still to do before go-live: `FORM_ENDPOINT` must forward to harry@royalresin.uk, and the Google reviews link needs his Business Profile URL. Facebook needs a login, so nothing was taken from it.
  - Mobile rules:
    - The hero must be fully visible at 375px wide, with no entrance animations.
    - The sticky bar stays hidden over the hero and the form.
    - The cookie pill sits top-left and goes after the first scroll or 6 seconds.
    - The page must never be wider than the viewport.

## User preference
Minimal messages. Only message when important. User asks questions if needed.
