/**
 * EnrollFlo — Voice AI Agent
 *
 * Outbound AI voice call system:
 *   POST /voice/trigger   ← GHL webhook fires when tag "website-chatbot" is added
 *   POST /voice/response  ← Twilio calls this when the lead picks up
 *   POST /voice/gather    ← Twilio speech input loop
 *   POST /voice/status    ← Twilio call status updates
 *
 * Flow: Lead opts in → GHL webhook → Twilio dials lead → AI qualifies → books GHL appointment
 */

const OpenAI  = require('openai');
const twilio  = require('twilio');

/* Lazy-init so server starts even before credentials are filled in .env */
let _openai = null;
let _twilio = null;
const openai = new Proxy({}, {
  get: (_, k) => {
    if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
    return _openai[k];
  }
});
function getTwilio() {
  if (!_twilio) _twilio = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
  return _twilio;
}
const twilioClient = new Proxy({}, {
  get: (_, k) => getTwilio()[k]
});

const {
  TWILIO_NUMBER, SERVER_URL,
  GHL_KEY, LOCATION_ID, CALENDAR_ID
} = process.env;

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_HDR  = {
  'Authorization': `Bearer ${GHL_KEY}`,
  'Version': '2021-07-28',
  'Content-Type': 'application/json'
};

/* ── In-memory call sessions (callSid → session) ── */
const sessions = new Map();

/* ── System prompt ── */
const SYSTEM_PROMPT = `You are the EnrollFlo AI, an outbound voice assistant calling on behalf of EnrollFlo.

You are calling {{FIRST_NAME}}, who just opted in at EnrollFlo.com to learn how we help music educators fill their calendar with qualified enrollment calls on autopilot.

YOUR SINGLE GOAL: Qualify the lead and book them onto a free 20-minute Enrollment Discovery Call.

OPENING (first response only):
"Hi, is this {{FIRST_NAME}}? Great! This is the EnrollFlo AI — you just opted in on our site about booking more qualified enrollment calls. I've got two quick questions, then I can get you booked in for a free discovery call. Sound good?"

If no response or voicemail sounds: "Hey {{FIRST_NAME}}, this is the EnrollFlo AI. You signed up on our site — grab a slot at enrollflo.com or we'll follow up. Speak soon!"

QUALIFICATION — ask these in order, one at a time:
1. "What type of music education do you offer — production, vocal coaching, instrument lessons, or music business coaching?"
2. "And roughly what does your main program or mentorship sell for?"
3. "Are you already driving any traffic to your offer — through ads, content, or an email list?"

QUALIFICATION RULES:
- QUALIFIED: Has an offer above £500 AND any audience or traffic → book immediately using the book_appointment function.
- NOT READY: No offer, no audience, no traffic → "The system needs traffic to convert, so it works best once you have some audience. Come back when you do — this will be a game-changer. Can I follow up in a few weeks?" Then end warmly.
- UNSURE/BORDERLINE: Default to offering the discovery call.

BOOKING: When qualified, say "Perfect — you're exactly who this is built for. Let me grab you a slot on the calendar right now." → call book_appointment function → "Done! The calendar invite is heading to your email. It's only 20 minutes — no pitch, no pressure, just a walkthrough of what we'd build for your specific offer."

OBJECTION HANDLING:
- "I'm busy" → "The call is only 20 minutes. We have slots as early as tomorrow. Can we lock one in? We only onboard 3 studios a month."
- "What does it cost?" → "The discovery call is free. If we're a fit: £1,500 one-time setup and £997 a month — the AI setter alone replaces a human at £2,000 to £4,000 a month. All the detail is on the call. When can you do 20 minutes?"
- "I'll think about it" → "Of course — can I book a tentative slot? You can always reschedule. Slots go fast since we cap at 3 studios per month."
- "Not interested" → "No problem at all — have a great day!"
- "Are you real?" / "Are you a bot?" → "I'm an AI assistant working for EnrollFlo. I qualify leads and book calls so the team can focus on the actual conversations. Is it okay if we carry on?"

AFTER BOOKING: "You're all set, {{FIRST_NAME}}! Invite is on its way. Have a brilliant day!" → call end_call function.
NO BOOKING: "No problem — have a great day! Grab a slot anytime at enrollflo.com." → call end_call function.

RULES:
- Speak naturally and conversationally. Never sound scripted.
- Keep responses SHORT on a voice call — one or two sentences max per turn.
- Always identify as an AI if directly asked.
- Never invent prices, features, or details not in this prompt.
- If not responsive after two prompts, end the call politely.`;

/* ── OpenAI tools ── */
const AI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Book the lead onto the Enrollment Discovery Call. Call this as soon as the lead agrees to book.',
      parameters: {
        type: 'object',
        properties: {
          preferred_time: {
            type: 'string',
            description: 'Any time preference the lead mentioned, or "next available" if none.'
          }
        },
        required: ['preferred_time']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'end_call',
      description: 'End the call gracefully. Call this when the conversation is complete — booking confirmed, lead disqualified, or lead says goodbye.',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            enum: ['booked', 'disqualified', 'not_interested', 'no_response']
          }
        },
        required: ['reason']
      }
    }
  }
];

/* ── GHL booking ── */
async function bookGHLAppointment(session) {
  try {
    /* Find next available slot (first working day, 10am) */
    const now   = new Date();
    let start   = new Date(now);
    start.setDate(start.getDate() + 1);
    // Skip weekends
    while (start.getDay() === 0 || start.getDay() === 6) start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 20 * 60 * 1000);
    const fmt = d => d.toISOString().replace('.000Z', '+00:00');

    /* 1. Upsert contact */
    let contactId = session.ghlContactId;
    if (!contactId) {
      const c = await fetch(`${GHL_BASE}/contacts/upsert`, {
        method: 'POST', headers: GHL_HDR,
        body: JSON.stringify({
          locationId: LOCATION_ID,
          firstName:  session.firstName,
          phone:      session.phone,
          tags:       ['voice-ai-called', 'qualified-lead'],
          source:     'Voice AI Callback'
        })
      }).then(r => r.json());
      contactId = c.contact?.id || c.id;
    }

    /* 2. Book appointment */
    const appt = await fetch(`${GHL_BASE}/calendars/events/appointments`, {
      method: 'POST', headers: GHL_HDR,
      body: JSON.stringify({
        calendarId: CALENDAR_ID, locationId: LOCATION_ID,
        contactId,
        startTime: fmt(start), endTime: fmt(end),
        title: `Enrollment Discovery Call — ${session.firstName}`,
        appointmentStatus: 'confirmed',
        timezone: 'Europe/London', toNotify: true,
        address: 'Online — link in confirmation email'
      })
    }).then(r => r.json());

    /* 3. Tag contact as booked */
    if (contactId) {
      await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
        method: 'POST', headers: GHL_HDR,
        body: JSON.stringify({ tags: ['call-booked', 'voice-ai-booked'] })
      });
    }

    console.log(`[voice] ✓ Booked: contact=${contactId} appt=${appt?.id}`);
    return { success: true, contactId, appointmentId: appt?.id, startTime: fmt(start) };
  } catch (e) {
    console.error('[voice] Booking failed:', e.message);
    return { success: false, error: e.message };
  }
}

/* ── Tag GHL contact with call outcome ── */
async function tagCallOutcome(session, outcome) {
  const contactId = session.ghlContactId;
  if (!contactId) return;
  try {
    await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: 'POST', headers: GHL_HDR,
      body: JSON.stringify({ tags: [`voice-ai-${outcome}`] })
    });
  } catch(e) { /* non-fatal */ }
}

/* ── Main AI conversation turn ── */
async function getAIResponse(callSid, userInput) {
  const session = sessions.get(callSid);
  if (!session) return { text: 'Sorry, something went wrong.', done: true };

  session.messages.push({ role: 'user', content: userInput });

  const prompt = SYSTEM_PROMPT.replace(/\{\{FIRST_NAME\}\}/g, session.firstName || 'there');

  let response = await openai.chat.completions.create({
    model:  'gpt-4o',
    messages: [{ role: 'system', content: prompt }, ...session.messages],
    tools:  AI_TOOLS,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 200
  });

  let msg = response.choices[0].message;

  /* Handle tool calls */
  if (msg.tool_calls?.length) {
    const tool = msg.tool_calls[0];
    session.messages.push(msg);
    let toolResult;

    if (tool.function.name === 'book_appointment') {
      session.booked = true;
      toolResult = await bookGHLAppointment(session);
    } else if (tool.function.name === 'end_call') {
      const reason = JSON.parse(tool.function.arguments || '{}').reason || 'ended';
      toolResult = { status: 'call_ending', reason };
    }

    session.messages.push({
      role: 'tool',
      tool_call_id: tool.id,
      content: JSON.stringify(toolResult)
    });

    /* Final spoken response after tool */
    const final = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: prompt }, ...session.messages],
      temperature: 0.7, max_tokens: 150
    });
    const finalText = final.choices[0].message.content;
    session.messages.push({ role: 'assistant', content: finalText });

    return { text: finalText, done: true, booked: session.booked };
  }

  /* Normal response */
  const text = msg.content || '';
  session.messages.push({ role: 'assistant', content: text });
  return { text, done: false, booked: false };
}

/* ── Build TwiML response ── */
function buildTwiML(text, action, done = false) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // Clean text for TTS (remove emojis, markdown)
  const clean = text.replace(/[^\x00-\x7F]/g, '').replace(/[*_#`]/g, '').trim();

  twiml.say({ voice: 'Polly.Amy-Neural', language: 'en-GB' }, clean);

  if (!done) {
    const gather = twiml.gather({
      input:         'speech',
      speechTimeout: 'auto',
      timeout:       6,
      action,
      method:        'POST'
    });
    // Silence fallback
    gather.pause({ length: 1 });
  } else {
    twiml.pause({ length: 1 });
    twiml.hangup();
  }

  return twiml.toString();
}

/* ── Route setup ── */
function setupVoiceRoutes(app) {
  /**
   * POST /voice/trigger
   * GHL webhook — fires when tag "website-chatbot" is added to a contact.
   * Body (GHL contact webhook payload): firstName, phone, email, contactId, tags
   */
  app.post('/voice/trigger', async (req, res) => {
    const body = req.body;

    // Support both GHL webhook formats
    const firstName   = body.firstName || body.first_name || body.contact?.firstName || 'there';
    const phone       = body.phone || body.phoneNumber || body.contact?.phone;
    const email       = body.email || body.contact?.email || '';
    const contactId   = body.contactId || body.id || body.contact?.id;
    const tags        = body.tags || body.contact?.tags || [];

    if (!phone) {
      console.log('[voice/trigger] Skipped — no phone number');
      return res.json({ status: 'skipped', reason: 'no_phone' });
    }

    if (!TWILIO_SID || !TWILIO_AUTH) {
      console.warn('[voice/trigger] Twilio not configured — see .env');
      return res.json({ status: 'skipped', reason: 'twilio_not_configured' });
    }

    try {
      const callbackUrl = `${SERVER_URL}/voice/response?` + new URLSearchParams({
        firstName, phone, email, contactId
      });

      const call = await twilioClient.calls.create({
        to:                   phone,
        from:                 TWILIO_NUMBER,
        url:                  callbackUrl,
        method:               'POST',
        statusCallback:       `${SERVER_URL}/voice/status`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent:  ['completed', 'no-answer', 'busy', 'failed'],
        timeout:              30,
        machineDetection:     'Enable'
      });

      console.log(`[voice/trigger] ✓ Calling ${phone} | SID: ${call.sid}`);
      res.json({ status: 'calling', callSid: call.sid, to: phone });
    } catch (e) {
      console.error('[voice/trigger] Twilio error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * POST /voice/response
   * Twilio calls this when the lead picks up. Initialises session and fires opening.
   */
  app.post('/voice/response', async (req, res) => {
    const { CallSid, AnsweredBy } = req.body;
    const { firstName, phone, email, contactId } = req.query;

    // If voicemail detected, leave a short message and hang up
    if (AnsweredBy && AnsweredBy !== 'human') {
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say({ voice: 'Polly.Amy-Neural', language: 'en-GB' },
        `Hey ${firstName || 'there'}, this is the EnrollFlo AI. You signed up on our site to learn about booking more enrollment calls. Grab a slot at enroll-flo dot com, or we will follow up. Speak soon!`
      );
      twiml.hangup();
      return res.type('text/xml').send(twiml.toString());
    }

    // Init session
    sessions.set(CallSid, {
      firstName:    firstName || 'there',
      phone, email, contactId,
      ghlContactId: contactId,
      messages:     [],
      booked:       false
    });

    try {
      const { text, done } = await getAIResponse(CallSid, '[call started — say your opening]');
      const twiml = buildTwiML(text, `/voice/gather?callSid=${CallSid}`, done);
      res.type('text/xml').send(twiml);
    } catch (e) {
      console.error('[voice/response]', e.message);
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say({ voice: 'Polly.Amy-Neural', language: 'en-GB' },
        `Hi ${firstName || 'there'}! This is EnrollFlo calling. Please visit enrollflo.com to book a call. Have a great day!`
      );
      twiml.hangup();
      res.type('text/xml').send(twiml.toString());
    }
  });

  /**
   * POST /voice/gather
   * Handles each speech input turn — runs AI, returns next TwiML.
   */
  app.post('/voice/gather', async (req, res) => {
    const { callSid } = req.query;
    const { SpeechResult, Confidence } = req.body;

    const input = SpeechResult?.trim() || '';
    console.log(`[voice/gather] ${callSid} | "${input}" (conf: ${Confidence})`);

    try {
      const { text, done, booked } = await getAIResponse(callSid, input || '[silence]');
      const twiml = buildTwiML(text, `/voice/gather?callSid=${callSid}`, done);
      res.type('text/xml').send(twiml);
    } catch (e) {
      console.error('[voice/gather]', e.message);
      // Graceful fallback — keep call alive
      const twiml = buildTwiML(
        "Sorry, I didn't catch that. Could you say that again?",
        `/voice/gather?callSid=${callSid}`
      );
      res.type('text/xml').send(twiml);
    }
  });

  /**
   * POST /voice/status
   * Twilio status callback — cleans up session, logs outcome.
   */
  app.post('/voice/status', async (req, res) => {
    const { CallSid, CallStatus, CallDuration } = req.body;
    const session = sessions.get(CallSid);

    if (session) {
      const outcome = session.booked ? 'booked' : CallStatus;
      console.log(`[voice/status] ${CallSid} | status=${CallStatus} | duration=${CallDuration}s | booked=${session.booked}`);
      await tagCallOutcome(session, outcome);
      sessions.delete(CallSid);
    }

    res.sendStatus(200);
  });

  /**
   * POST /voice/demo
   * Website visitors enter their phone number to receive a live AI demo call.
   * Rate-limited to one demo call per number per 10 minutes.
   */
  const demoCooldown = new Map();

  app.post('/voice/demo', async (req, res) => {
    const { phone, countryCode = '+44' } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'Phone number required.' });

    // Normalise: strip non-digits, remove leading 0, prepend country code
    let clean = String(phone).replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = clean.slice(1);
    const fullNumber = countryCode + clean;

    if (fullNumber.replace(/\D/g, '').length < 9) {
      return res.status(400).json({ error: 'Please enter a valid phone number.' });
    }

    // Rate limit: one demo per number per 10 minutes
    const now  = Date.now();
    const last = demoCooldown.get(fullNumber) || 0;
    if (now - last < 10 * 60 * 1000) {
      return res.status(429).json({ error: 'Please wait a few minutes before requesting another demo call.' });
    }
    demoCooldown.set(fullNumber, now);

    const sid    = process.env.TWILIO_SID;
    const auth   = process.env.TWILIO_AUTH;
    const from   = process.env.TWILIO_NUMBER;
    const srvUrl = process.env.SERVER_URL;

    if (!sid || !auth || sid.startsWith('AC') === false || auth === 'your_twilio_auth_token') {
      return res.status(503).json({ error: 'Voice demo not yet live — Twilio credentials not configured.' });
    }

    try {
      // Create GHL contact (non-fatal)
      try {
        await fetch(`${GHL_BASE}/contacts/upsert`, {
          method: 'POST', headers: GHL_HDR,
          body: JSON.stringify({
            locationId: LOCATION_ID,
            phone: fullNumber,
            source: 'Website Voice Demo',
            tags: ['website-demo', 'voice-demo']
          })
        });
      } catch (_) { /* non-fatal */ }

      const call = await getTwilio().calls.create({
        to:                   fullNumber,
        from,
        url:                  `${srvUrl}/voice/response?firstName=Friend`,
        method:               'POST',
        statusCallback:       `${srvUrl}/voice/status`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent:  ['completed', 'no-answer', 'busy', 'failed'],
        timeout:              30,
        machineDetection:     'Enable'
      });

      console.log(`[voice/demo] ✓ Demo call to ${fullNumber} | SID: ${call.sid}`);
      res.json({ success: true, callSid: call.sid });
    } catch (e) {
      console.error('[voice/demo]', e.message);
      res.status(500).json({ error: 'Could not start the call. Please check your number and try again.' });
    }
  });

  console.log('  Voice AI routes: /voice/trigger | /voice/response | /voice/gather | /voice/status | /voice/demo');
}

module.exports = { setupVoiceRoutes };
