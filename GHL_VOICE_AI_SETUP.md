# GHL Voice AI — 3-Step Manual Setup

The voice AI agent **"EnrollFlo — 60-Second Enrollment AI"** has been fully configured via API:
- ✅ Name, script, qualification logic, objection handling
- ✅ Booking prompt (tells agent to use appointment booking tool)
- ✅ Post-call email notification → daniilsgoloveckis@gmail.com
- ✅ Max call duration: 10 minutes | Timezone: Europe/London | 24/7 active

Three things must be completed in the GHL UI because the API doesn't expose these endpoints.

---

## Step 1 — Add the Appointment Booking Tool to the Agent

**Where:** GHL → AI Agents → Voice AI → "EnrollFlo — 60-Second Enrollment AI" → Actions/Tools tab

1. Open the agent in GHL
2. Find the **"Actions"** or **"Tools"** section
3. Click **"Add Action"** → select **"Appointment Booking"**
4. Select calendar: **"Enrollment Discovery Call — 20 mins"**
5. Set trigger phrase: `"book an appointment"` / `"schedule a call"` (or leave as default)
6. Save

This is what allows the AI to actually write the appointment into your GHL calendar during the call.

---

## Step 2 — Assign a Phone Number to the Agent

**Where:** GHL → AI Agents → Voice AI → Agent → Settings → Phone Number

The agent needs a GHL phone number to make outbound calls from.

1. If you don't have a number yet: GHL → Settings → Phone Numbers → Buy a Number (UK: +44)
2. In the agent settings, assign that number as the **outbound caller ID**

> **Note:** The number should ideally be a UK number (+44) so it doesn't get screened as spam
> by your UK-based leads.

---

## Step 3 — Wire Up the 60-Second Callback Workflow

**Where:** GHL → Automation → Workflows → "60-Second Lead Callback" (already exists as draft)

This workflow fires the AI call within 60 seconds of a new lead opting in.

### Trigger
- Type: **Contact Created** OR **Tag Added**
- Filter: Tag = `website-chatbot` (set when someone completes the chatbot on your site)

### Actions (in order)
1. **Wait** → 0 minutes (immediate — fire right away)
2. **Voice AI Call** → select agent: **"EnrollFlo — 60-Second Enrollment AI"**
   - Call from: [your GHL number from Step 2]
   - Call to: `{{contact.phone}}`
3. **Wait** → 5 minutes
4. **If/Else** → condition: appointment was booked (or tag "booked")
   - **Yes branch:** Update contact tag → add `call-booked`, move to pipeline stage "Qualified" (already done by website chatbot, but worth confirming)
   - **No branch:** Send SMS → "Hey {{contact.firstName}}, this is EnrollFlo — we tried to call you! Grab a slot here: [your calendar link]"

### Publish
Click **"Publish"** in the top right to make the workflow live.

---

## How the Full 60-Second Flow Works (Once All 3 Steps Are Done)

```
Lead opts in on website
        ↓
Chatbot qualifies them (name, email, phone, offer type)
        ↓
Contact created in GHL with tag: website-chatbot
        ↓ (workflow fires instantly)
AI calls their phone within 60 seconds
        ↓
AI qualifies further on the call (2-3 questions)
        ↓
AI books appointment directly into GHL calendar
        ↓
GHL sends confirmation email + calendar invite
        ↓
Post-call summary sent to daniilsgoloveckis@gmail.com
```

---

## Checklist

- [ ] Step 1: Appointment Booking action added to agent in GHL UI
- [ ] Step 2: UK phone number purchased and assigned to agent
- [ ] Step 3: "60-Second Lead Callback" workflow configured and published
- [ ] Calendar open hours set (GHL → Settings → Calendars → "Enrollment Discovery Call" → Availability → set Mon–Fri 9am–8pm or similar)
