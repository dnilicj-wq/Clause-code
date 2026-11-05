// "See it in your garage": sends the visitor's photo to Gemini image edit and returns their space
// with the chosen floor installed. Key is server-side only (GEMINI_API_KEY).
// Limits: 3 renders per visitor (cookie + IP hash), 50 a day globally, 8 MB max upload.
// Note: in-memory counters reset on cold starts; good enough for a demo, swap for KV on a paid client.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

export const config = { api: { bodyParser: { sizeLimit: '9mb' } }, maxDuration: 60 };

const MODEL = 'gemini-2.5-flash-image';
const PER_VISITOR = 3;
const PER_DAY = 50;
const day = () => new Date().toISOString().slice(0, 10);
const counts = (globalThis as any).__vis ||= { day: day(), total: 0, by: {} as Record<string, number> };

const FINISHES: Record<string, string> = {
  'graphite-flake': 'a graphite grey decorative flake (chip) epoxy floor: dense broadcast of black, grey and white vinyl flakes under a clear gloss topcoat',
  'copper-metallic': 'a copper metallic epoxy floor: deep near-black base with flowing copper-bronze metallic swirls and lacing, high gloss',
  'pearl-metallic': 'a pearl white metallic epoxy floor: soft white and silver flowing metallic swirls, high gloss, bright',
  'midnight-metallic': 'a midnight blue metallic epoxy floor: very dark navy base with flowing blue metallic swirls, glassy high gloss',
  'storm-solid': 'a solid storm grey epoxy floor: one even mid-grey colour, smooth high gloss',
  'quartz-sand': 'a sand-coloured quartz resin floor: fine beige and cream quartz aggregate, satin finish, slight texture',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'busy', reason: 'not-configured' });

  if (counts.day !== day()) { counts.day = day(); counts.total = 0; counts.by = {}; }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const cookie = /vis=([a-f0-9]{16})/.exec(String(req.headers.cookie || ''))?.[1] || crypto.randomBytes(8).toString('hex');
  const who = crypto.createHash('sha256').update(ip + '|' + cookie).digest('hex').slice(0, 16);
  const ipOnly = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
  res.setHeader('Set-Cookie', `vis=${cookie}; Path=/; Max-Age=2592000; SameSite=Lax; Secure; HttpOnly`);
  if (counts.total >= PER_DAY || (counts.by[who] || 0) >= PER_VISITOR || (counts.by[ipOnly] || 0) >= PER_VISITOR * 2) {
    return res.status(429).json({ error: 'busy', reason: 'limit' });
  }

  const { image, mime, finish } = (req.body || {}) as { image?: string; mime?: string; finish?: string };
  if (!image || !mime || !/^image\/(jpeg|png|webp)$/.test(mime)) return res.status(400).json({ error: 'bad-image' });
  if (image.length > 8 * 1024 * 1024 * 1.37) return res.status(413).json({ error: 'too-big' });
  const desc = FINISHES[finish || ''] || FINISHES['graphite-flake'];

  const prompt = `Edit this photo. Replace ONLY the floor surface with ${desc}. Keep everything else exactly as it is: walls, doors, cars, objects, people, lighting, camera angle and perspective. The new floor must follow the existing floor's perspective and edges, run under objects naturally, and show realistic reflections of the room's lights. Photorealistic. Do not add text or logos.`;

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: image } }] }] }),
    });
    if (!r.ok) return res.status(503).json({ error: 'busy', reason: 'upstream-' + r.status });
    const j: any = await r.json();
    const part = j?.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data || p.inlineData);
    const data = part?.inline_data?.data || part?.inlineData?.data;
    const outMime = part?.inline_data?.mime_type || part?.inlineData?.mimeType || 'image/png';
    if (!data) return res.status(503).json({ error: 'busy', reason: 'no-image' });
    counts.total++; counts.by[who] = (counts.by[who] || 0) + 1; counts.by[ipOnly] = (counts.by[ipOnly] || 0) + 1;
    // the photo is never stored: it is only passed through to Gemini
    return res.status(200).json({ image: `data:${outMime};base64,${data}`, left: PER_VISITOR - counts.by[who] });
  } catch {
    return res.status(503).json({ error: 'busy', reason: 'network' });
  }
}
