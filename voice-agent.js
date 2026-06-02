/**
 * EnrollFlo — Voice AI (GHL Native)
 *
 * POST /voice/demo  → upserts GHL contact, adds "voice-demo-requested" tag
 *                     GHL workflow picks this up and triggers the Voice AI outbound call
 *
 * GHL setup required:
 *   1. LC Phone number assigned
 *   2. Conversation AI → Voice AI agent created with qualification prompt
 *   3. Workflow: trigger "Contact tag added: voice-demo-requested" → action "Make outbound call"
 *
 * Optional env var: GHL_VOICE_WORKFLOW_ID — if set, enrolls contact in workflow directly
 *                   (in addition to tag trigger, as a fallback)
 */

const GHL_BASE = 'https://services.leadconnectorhq.com';

function setupVoiceRoutes(app) {
  const demoCooldown = new Map();

  app.post('/voice/demo', async (req, res) => {
    const { phone, countryCode = '+44' } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'Phone number required.' });

    let clean = String(phone).replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = clean.slice(1);
    const fullNumber = countryCode + clean;

    if (fullNumber.replace(/\D/g, '').length < 9) {
      return res.status(400).json({ error: 'Please enter a valid phone number.' });
    }

    const now  = Date.now();
    const last = demoCooldown.get(fullNumber) || 0;
    if (now - last < 10 * 60 * 1000) {
      return res.status(429).json({ error: 'Please wait a few minutes before requesting another demo call.' });
    }
    demoCooldown.set(fullNumber, now);

    const { GHL_KEY, LOCATION_ID, GHL_VOICE_WORKFLOW_ID } = process.env;

    if (!GHL_KEY || !LOCATION_ID) {
      return res.status(503).json({ error: 'Voice demo not configured.' });
    }

    const headers = {
      'Authorization': `Bearer ${GHL_KEY}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    };

    try {
      const upsertRes = await fetch(`${GHL_BASE}/contacts/upsert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          locationId: LOCATION_ID,
          phone: fullNumber,
          source: 'Website Voice Demo',
          tags: ['website-demo', 'voice-demo-requested']
        })
      });

      if (!upsertRes.ok) {
        const err = await upsertRes.json().catch(() => ({}));
        console.error('[voice/demo] GHL upsert failed:', upsertRes.status, err);
        return res.status(500).json({ error: 'Could not start the call. Please check your number and try again.' });
      }

      const contactData = await upsertRes.json();
      const contactId = contactData.contact?.id || contactData.id;

      if (GHL_VOICE_WORKFLOW_ID && contactId) {
        await fetch(`${GHL_BASE}/contacts/${contactId}/workflow/${GHL_VOICE_WORKFLOW_ID}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ eventStartTime: new Date().toISOString() })
        }).catch(e => console.warn('[voice/demo] Workflow enroll failed (non-fatal):', e.message));
      }

      console.log(`[voice/demo] ✓ ${fullNumber} → contact ${contactId} tagged, Voice AI call triggered`);
      res.json({ success: true, contactId });
    } catch (e) {
      console.error('[voice/demo]', e.message);
      res.status(500).json({ error: 'Could not start the call. Please check your number and try again.' });
    }
  });

  console.log('  Voice AI routes: /voice/demo (GHL Native Voice AI)');
}

module.exports = { setupVoiceRoutes };
