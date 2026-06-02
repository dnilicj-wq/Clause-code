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

## User preference
Minimal messages. Only message when important. User asks questions if needed.
