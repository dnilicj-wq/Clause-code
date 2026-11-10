// Serves the static site (assets) and takes quote requests at POST /api/quote.
// Leads + photos are stored in Workers KV (free tier). Wire to Bill's inbox at launch.
const MAX_PHOTOS = 6, MAX_BYTES = 8 * 1024 * 1024;
const clean = (v, n = 200) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/quote') {
      if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
      const wantsJson = (req.headers.get('accept') || '').includes('application/json');
      const fail = (error, status = 400) => wantsJson ? Response.json({ ok: false, error }, { status }) : new Response(error, { status });
      let fd;
      try { fd = await req.formData(); } catch { return fail('Bad form'); }
      if (clean(fd.get('company'))) return wantsJson ? Response.json({ ok: true }) : Response.redirect(url.origin + '/thanks/', 303); // bot
      const lead = {
        type: clean(fd.get('type'), 30), design: clean(fd.get('design'), 200), size: clean(fd.get('size'), 80), surface: clean(fd.get('surface'), 60),
        name: clean(fd.get('name'), 80), phone: clean(fd.get('phone'), 30), postcode: clean(fd.get('postcode'), 12).toUpperCase(), page: clean(fd.get('page'), 120),
        at: new Date().toISOString(), ua: clean(req.headers.get('user-agent'), 160),
      };
      if (!lead.name || lead.phone.replace(/\D/g, '').length < 10 || lead.postcode.replace(/\s/g, '').length < 5) return fail('Please add your name, phone and postcode.');
      const id = lead.at.replace(/[-:.TZ]/g, '').slice(0, 14) + '-' + crypto.randomUUID().slice(0, 8);
      const photos = fd.getAll('photos').filter((f) => f && typeof f === 'object' && f.size > 0 && f.size <= MAX_BYTES && /^image\//.test(f.type)).slice(0, MAX_PHOTOS);
      lead.photos = [];
      for (let i = 0; i < photos.length; i++) {
        const key = `photo:${id}:${i}`;
        await env.QUOTES.put(key, await photos[i].arrayBuffer(), { metadata: { type: photos[i].type, name: clean(photos[i].name, 80) } });
        lead.photos.push(key);
      }
      await env.QUOTES.put(`lead:${id}`, JSON.stringify(lead));
      return wantsJson ? Response.json({ ok: true, id }) : Response.redirect(url.origin + '/thanks/', 303);
    }
    return env.ASSETS.fetch(req);
  },
};
