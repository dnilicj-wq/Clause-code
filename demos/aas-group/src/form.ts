// Six-step free-site-visit form. Submits by opening WhatsApp with the whole brief pre-written.
// To switch on a real endpoint later (e.g. a Cloudflare Worker that emails Ardian), set FORM_ENDPOINT:
// the brief is POSTed as JSON first, then WhatsApp still opens as the instant hand-off.
export const FORM_ENDPOINT = '';
const WA = '447777792227';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];

const data: Record<string, string> = {};
let spec: [string, string][] = [], specSize = 'Small', fromDesign = false, designed = false, specCalls = 0;
// first call is the default spec on page load; any later call means the visitor used the configurator
export function setSpecForForm(rows: [string, string][], size: string) { spec = rows; specSize = size; if (specCalls++ > 0) designed = true; if (fromDesign) paintMini(); }

function paintMini() {
  const box = $('#specMini'); box.hidden = false;
  $('#specMiniList').innerHTML = spec.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

// postcode -> the towns from their own site; everything else gets a friendly "we'll check"
function coverage(pc: string): { ok: boolean; town?: string } {
  const out = pc.toUpperCase().replace(/\s+/g, '').match(/^([A-Z]{1,2})(\d{1,2})[A-Z]?\d[A-Z]{2}$/) || pc.toUpperCase().trim().match(/^([A-Z]{1,2})(\d{1,2})[A-Z]?$/);
  if (!out) return { ok: false };
  const a = out[1], n = +out[2];
  if (a === 'NN') {
    if (n >= 1 && n <= 7) return { ok: true, town: 'Northampton' };
    if (n === 8 || n === 9 || n === 29) return { ok: true, town: 'Wellingborough' };
    if (n === 14) return { ok: true, town: 'Rothwell and Kettering' };
    if (n === 15 || n === 16) return { ok: true, town: 'Kettering' };
    return { ok: true, town: 'Northamptonshire' };
  }
  if (a === 'MK') return { ok: true, town: 'Milton Keynes' };
  if (a === 'LE' && n === 16) return { ok: true, town: 'Market Harborough' };
  if (a === 'CV' && n === 47) return { ok: true, town: 'Southam' };
  if (a === 'CV' && n >= 1 && n <= 6) return { ok: true, town: 'Coventry' };
  return { ok: false, town: '' };
}
const validPc = (s: string) => /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(s.trim());
const validTel = (s: string) => /^(?:\+?44|0)\d{9,10}$/.test(s.replace(/[\s()-]/g, ''));

export function initForm() {
  const form = $<HTMLFormElement>('#wiz'), steps = $$<HTMLFieldSetElement>('.wiz__step', form);
  const pill = $('#wizPill'), count = $('#wizCount'), back = $<HTMLButtonElement>('#wizBack');
  let cur = 1;
  const go = (n: number, dir = 1) => {
    cur = Math.max(1, Math.min(6, n));
    steps.forEach((s) => { const on = +s.dataset.step! === cur; s.hidden = !on; s.classList.toggle('is-on', on); s.classList.toggle('back', dir < 0); });
    pill.style.width = `${(cur / 6) * 100}%`; count.textContent = `Step ${cur} of 6`;
    back.hidden = cur === 1;
    const first = $('.wiz__step.is-on button.is-on, .wiz__step.is-on input, .wiz__step.is-on button', form) as HTMLElement | null;
    if (form.getBoundingClientRect().top < innerHeight && form.getBoundingClientRect().bottom > 0) first?.focus({ preventScroll: true });
  };
  $$('.choice', form).forEach((grp) => grp.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button'); if (!b) return;
    $$('button', grp).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    data[grp.dataset.name!] = b.dataset.v!;
    setTimeout(() => go(cur + 1), 220);
  }));
  back.addEventListener('click', () => go(cur - 1, -1));

  // postcode
  const pc = $<HTMLInputElement>('#pc'), pcNote = $('#pcNote');
  const checkPc = () => {
    const v = pc.value.trim(); pc.classList.remove('is-bad'); pcNote.classList.remove('is-warn');
    if (!v) { pcNote.textContent = ''; return; }
    pc.removeAttribute('aria-invalid');
    const c = coverage(v);
    if (c.ok) pcNote.textContent = `✓ We cover ${c.town}`;
    else if (validPc(v)) { pcNote.textContent = "Thanks. We'll check your area and confirm."; }
    else pcNote.textContent = '';
  };
  pc.addEventListener('input', () => { pc.value = pc.value.toUpperCase(); checkPc(); });
  const pcNext = () => {
    if (!validPc(pc.value)) { pc.setAttribute('aria-invalid', 'true'); pc.classList.add('is-bad'); pcNote.classList.add('is-warn'); pcNote.textContent = pc.value.trim() ? 'That doesn’t look like a full UK postcode yet, e.g. NN8 4AB.' : 'Please add your postcode so we can check we cover your area.'; pc.focus(); return; }
    pc.removeAttribute('aria-invalid');
    data.postcode = pc.value.trim().toUpperCase().replace(/^(.+?)(\d[A-Z]{2})$/, (_m, a, b) => `${a.trim()} ${b}`);
    go(5);
  };
  $('[data-next]', form).addEventListener('click', pcNext);
  pc.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pcNext(); } });

  // design hand-off: steps 1–2 come from the configurator
  document.addEventListener('aas:design', () => {
    fromDesign = true; paintMini();
    data.project = 'Full garden'; data.size = specSize;
    const pick = (name: string, v: string) => $$(`.choice[data-name="${name}"] button`, form).forEach((b) => b.classList.toggle('is-on', b.dataset.v === v));
    pick('project', 'Full garden'); pick('size', specSize);
    go(3);
    const note = document.createElement('p'); note.className = 'wiz__help'; note.textContent = 'Project and size filled in from your design.';
    const lg = $('[data-step="3"] legend', form); if (!lg.nextElementSibling?.classList.contains('wiz__help')) lg.after(note);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nm = $<HTMLInputElement>('#nm'), mb = $<HTMLInputElement>('#mb'), note = $('#contactNote');
    nm.classList.remove('is-bad'); mb.classList.remove('is-bad'); note.classList.remove('is-warn'); note.textContent = '';
    if (!nm.value.trim()) { nm.classList.add('is-bad'); note.classList.add('is-warn'); note.textContent = 'Just your first name is fine.'; nm.focus(); return; }
    if (!validTel(mb.value)) { mb.classList.add('is-bad'); note.classList.add('is-warn'); note.textContent = 'Could you check the number? A UK mobile like 07700 900123.'; mb.focus(); return; }
    if (!data.postcode || !validPc(data.postcode)) { go(4, -1); pc.classList.add('is-bad'); pc.setAttribute('aria-invalid', 'true'); pcNote.classList.add('is-warn'); pcNote.textContent = 'We need your postcode to check we cover your area, e.g. NN8 4AB.'; pc.focus(); return; }
    data.name = nm.value.trim(); data.mobile = mb.value.trim();
    const lines = [
      "Hi Ardian, I'd like to book a free site visit.",
      '',
      `Project: ${data.project ?? 'Not sure yet'}`,
      `Size: ${data.size ?? 'Not sure'}`,
      `Start: ${data.timing ?? 'Not sure'}`,
      `Postcode: ${data.postcode ?? ''}`,
      `Photos: ${data.photos ?? 'No photos yet'}`,
    ];
    if (fromDesign || designed) { lines.push('', 'My design (from your website):'); spec.forEach(([k, v]) => lines.push(`• ${k}: ${v}`)); }
    lines.push('', `Name: ${data.name}`, `Mobile: ${data.mobile}`);
    const msg = lines.join('\n');
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    if (FORM_ENDPOINT) { try { await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...data, spec: fromDesign || designed ? spec : null, message: msg }) }); } catch { /* WhatsApp still opens */ } }
    window.open(url, '_blank', 'noopener');
    $<HTMLAnchorElement>('#waAgain').href = url;
    steps.forEach((s) => (s.hidden = true)); $('.wiz__top', form).hidden = true; back.hidden = true;
    const done = $('#wizDone'); done.hidden = false; done.focus();
  });
  go(1);
}
