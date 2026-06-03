/**
 * EnrollFlo — GHL Integration Server
 *
 * Routes:
 *   GET  /api/slots          → available calendar slots from GHL (next 14 days)
 *   POST /api/book           → create GHL contact + appointment + pipeline opportunity
 *   GET  /                   → serves index.html
 */

const express = require('express');
const path    = require('path');
require('fs').existsSync('.env') && require('fs').readFileSync('.env','utf8')
  .split('\n').forEach(l => { const [k,...v]=l.split('='); if(k&&v.length) process.env[k.trim()]=v.join('=').trim(); });

const { setupVoiceRoutes } = require('./voice-agent');

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const {
  GHL_KEY, LOCATION_ID, CALENDAR_ID,
  PIPELINE_ID, STAGE_QUALIFIED,
  PORT = 3000, TIMEZONE = 'Europe/London'
} = process.env;

const GHL  = 'https://services.leadconnectorhq.com';
const HDR  = {
  'Authorization': `Bearer ${GHL_KEY}`,
  'Version':       '2021-07-28',
  'Content-Type':  'application/json',
  'Accept':        'application/json'
};

/* ── helpers ── */
async function ghl(method, path, body) {
  const res = await fetch(`${GHL}${path}`, {
    method,
    headers: HDR,
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(`GHL ${method} ${path} → ${res.status}`), { ghl: data });
  return data;
}

/** Generate fallback slots when GHL calendar has no open hours configured */
function fallbackSlots(days = 7) {
  const slots = {};
  const now   = new Date();
  let added   = 0;
  for (let i = 1; added < days; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekends
    const key = d.toISOString().split('T')[0];
    slots[key] = { slots: ['10:00','11:00','13:00','14:00','15:00','16:00'].map(t => `${key}T${t}:00`) };
    added++;
  }
  return slots;
}

/* ────────────────────────────────
   GET /api/slots
   Returns up to 14 days of available GHL slots.
   Falls back to generated slots if the calendar has no open hours set.
──────────────────────────────── */
app.get('/api/slots', async (req, res) => {
  try {
    const tz       = req.query.timezone || TIMEZONE;
    const now      = Date.now();
    const twoHours = now + 2 * 60 * 60 * 1000;           // respect GHL "book after 2h" setting
    const twoWeeks = now + 14 * 24 * 60 * 60 * 1000;

    const data = await ghl('GET',
      `/calendars/${CALENDAR_ID}/free-slots?startDate=${twoHours}&endDate=${twoWeeks}&timezone=${encodeURIComponent(tz)}`
    );

    // GHL returns { _dates_: { "YYYY-MM-DD": { slots: [...] } } }
    const dates = data?._dates_ || data?.data?._dates_ || {};
    const hasDates = Object.keys(dates).length > 0;

    if (!hasDates) {
      // Calendar open hours not yet configured in GHL — use fallback
      return res.json({ slots: fallbackSlots(7), source: 'fallback' });
    }

    // Normalise: keep only days with at least one slot, first 5 days
    const trimmed = {};
    let count = 0;
    for (const [day, val] of Object.entries(dates)) {
      if (count >= 5) break;
      const slotList = (val.slots || []).slice(0, 6);
      if (slotList.length) { trimmed[day] = { slots: slotList }; count++; }
    }

    res.json({ slots: trimmed, source: 'ghl' });
  } catch (err) {
    console.error('[slots]', err.message, err.ghl || '');
    // Always return something so the chatbot doesn't break
    res.json({ slots: fallbackSlots(7), source: 'fallback' });
  }
});

/* ────────────────────────────────
   POST /api/book
   Body: { firstName, email, phone, startTime, timezone, offerType, priceRange, trafficSource }
   1. Upsert GHL contact
   2. Create appointment
   3. Create pipeline opportunity (stage = Qualified)
──────────────────────────────── */
app.post('/api/book', async (req, res) => {
  const { firstName, email, phone, startTime, timezone, offerType, priceRange, trafficSource } = req.body;

  if (!firstName || !email || !phone || !startTime) {
    return res.status(400).json({ error: 'Missing required fields: firstName, email, phone, startTime' });
  }

  try {
    /* 1 ─ Upsert contact */
    let contact;
    try {
      const upsert = await ghl('POST', '/contacts/upsert', {
        locationId: LOCATION_ID,
        firstName,
        email,
        phone,
        source:     'EnrollFlo Website',
        tags:       ['website-chatbot', 'qualified-lead'],
        customFields: [
          { key: 'offer_type',    field_value: offerType    || '' },
          { key: 'price_range',   field_value: priceRange   || '' },
          { key: 'traffic_source',field_value: trafficSource|| '' }
        ]
      });
      contact = upsert.contact || upsert;
    } catch (e) {
      // upsert might not exist on all plans — fall back to create
      const created = await ghl('POST', '/contacts/', {
        locationId: LOCATION_ID,
        firstName, email, phone,
        source: 'EnrollFlo Website',
        tags: ['website-chatbot', 'qualified-lead']
      });
      contact = created.contact || created;
    }

    const contactId = contact?.id;
    if (!contactId) throw new Error('Contact ID not returned by GHL');

    /* 2 ─ Book appointment (20-min slot) */
    const start  = new Date(startTime);
    const end    = new Date(start.getTime() + 20 * 60 * 1000);
    const fmtISO = d => d.toISOString().replace('.000Z', '+00:00');

    /* 2 ─ Book appointment (non-fatal — fails gracefully if calendar has no open hours set) */
    let appt = null;
    try {
      appt = await ghl('POST', '/calendars/events/appointments', {
        calendarId:        CALENDAR_ID,
        locationId:        LOCATION_ID,
        contactId,
        startTime:         fmtISO(start),
        endTime:           fmtISO(end),
        title:             `Enrollment Discovery Call — ${firstName}`,
        appointmentStatus: 'confirmed',
        timezone:          timezone || TIMEZONE,
        toNotify:          true,
        address:           'Online — link in confirmation email'
      });
    } catch (e) {
      // Most common cause: calendar open hours not yet configured in GHL Settings → Calendars
      console.warn('[book] Appointment booking failed (non-fatal — configure calendar open hours in GHL):', e.message);
    }

    /* 3 ─ Create pipeline opportunity */
    let opportunity = null;
    try {
      const opp = await ghl('POST', '/opportunities/', {
        pipelineId:      PIPELINE_ID,
        locationId:      LOCATION_ID,
        pipelineStageId: STAGE_QUALIFIED,
        name:            `${firstName} — ${offerType || 'Music Educator'}`,
        status:          'open',
        contactId,
        source:          'Website Chatbot',
        monetaryValue:   1500
      });
      opportunity = opp.opportunity || opp;
    } catch (e) {
      console.warn('[book] Opportunity creation failed (non-fatal):', e.message);
    }

    console.log(`[book] ✓ Contact ${contactId} | Appt ${appt?.id} | Opp ${opportunity?.id}`);

    res.json({
      success:       true,
      contactId,
      appointmentId: appt?.id,
      opportunityId: opportunity?.id
    });

  } catch (err) {
    console.error('[book]', err.message, JSON.stringify(err.ghl || ''));
    res.status(500).json({ error: err.message, detail: err.ghl });
  }
});

/* ── Voice AI routes ── */
setupVoiceRoutes(app);

/* ── serve frontend ── */
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));

/* ── start server (local dev) or export for Vercel serverless ── */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  EnrollFlo running → http://localhost:${PORT}\n`);
  });
}

module.exports = app;
