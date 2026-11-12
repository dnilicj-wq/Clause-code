// Serves the static site and takes quote requests at POST /api/quote (stored in Workers KV, keyed per site).
const clean = (v, n = 200) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/quote') {
      if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
      let fd;
      try { fd = await req.formData(); } catch { return Response.json({ ok: false, error: 'Bad form' }, { status: 400 }); }
      if (clean(fd.get('company'))) return Response.json({ ok: true });
      const lead = {
        site: url.hostname, service: clean(fd.get('service'), 60), size: clean(fd.get('size'), 60), surface: clean(fd.get('surface'), 60), design: clean(fd.get('design'), 300), town: clean(fd.get('town'), 60),
        name: clean(fd.get('name'), 80), phone: clean(fd.get('phone'), 30), postcode: clean(fd.get('postcode'), 12).toUpperCase(), page: clean(fd.get('page'), 120),
        at: new Date().toISOString(),
      };
      if (!lead.name || lead.phone.replace(/\D/g, '').length < 10) return Response.json({ ok: false, error: 'Please add your name and phone.' }, { status: 400 });
      const id = `${url.hostname.split('.')[0]}:${lead.at.replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomUUID().slice(0, 6)}`;
      if (env.QUOTES) await env.QUOTES.put(`lead:${id}`, JSON.stringify(lead));
      return Response.json({ ok: true, id });
    }
    return env.ASSETS.fetch(req);
  },
};
