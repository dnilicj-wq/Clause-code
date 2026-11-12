// Premium page loader (home page only): isometric paving blocks drop into place in a wave over a cobalt glow,
// wordmark + progress line + counter, then a curtain wipe hands over to the hero's own 3D lay.
// Inspired by 21st.dev's isometric-cube and square-wave loaders, re-drawn in the lead's paving palette.
// Pure inline SVG + CSS (paints with the first frame); app.js drives the counter and the exit; CSS fail-safe hides it after 5 s.
export function loader({ name = '', tops = ['#47484c', '#8e9093', '#3c3d40', '#a0a2a5', '#525357'], accent = '#2F6BE0', bg = '#0B0C0F' } = {}) {
  const shade = (hex, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
  const W = 22, H = 11, T = 9, N = 4; // half-width, half-height of a block's top, block thickness, grid size
  let tiles = '';
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) { // draw back to front so near blocks overlap far ones
    const j = s - i; if (j < 0 || j >= N) continue;
    const cx = (i - j) * W, cy = (i + j) * H, c = tops[(i * 2 + j * 3) % tops.length];
    const top = `${cx},${cy - H} ${cx + W},${cy} ${cx},${cy + H} ${cx - W},${cy}`;
    const left = `${cx - W},${cy} ${cx},${cy + H} ${cx},${cy + H + T} ${cx - W},${cy + T}`;
    const right = `${cx + W},${cy} ${cx},${cy + H} ${cx},${cy + H + T} ${cx + W},${cy + T}`;
    tiles += `<g class="pl-t" style="--d:${(s * 110 + i * 25)}ms"><polygon points="${left}" fill="${shade(c, 0.62)}"/><polygon points="${right}" fill="${shade(c, 0.45)}"/><polygon points="${top}" fill="${c}"/><polyline points="${cx - W},${cy} ${cx},${cy - H} ${cx + W},${cy}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1"/></g>`;
  }
  const vb = `${-N * W - 4} ${-H - 50} ${2 * N * W + 8} ${2 * N * H + T + 62}`;
  return `<div class="pl" aria-hidden="true"><style>
html.pl-on{overflow:hidden}
.pl{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:radial-gradient(60% 45% at 50% 46%,${accent}24,transparent 70%),${bg};clip-path:inset(0 0 0 0);transition:clip-path .9s cubic-bezier(.76,0,.24,1);animation:plfail 0s 5s forwards}
.pl::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E")}
.pl-in{display:flex;flex-direction:column;align-items:center;gap:26px;transition:transform .6s cubic-bezier(.76,0,.24,1),opacity .45s ease}
.pl svg{width:min(56vw,230px);height:auto;overflow:visible;filter:drop-shadow(0 18px 26px rgba(0,0,0,.55))}
.pl-glow{fill:${accent};opacity:.32;filter:blur(14px)}
.pl-t{transform-box:fill-box;animation:pldrop 2.2s cubic-bezier(.22,1,.36,1) var(--d) infinite both}
@keyframes pldrop{0%{transform:translateY(-34px);opacity:0}18%{transform:translateY(0);opacity:1}22%{transform:translateY(-3px)}26%,72%{transform:translateY(0);opacity:1}90%,100%{transform:translateY(-22px);opacity:0}}
.pl-m{display:flex;flex-direction:column;align-items:center;gap:12px;font:600 11px/1 var(--bf,Inter,system-ui,sans-serif);letter-spacing:.24em;text-transform:uppercase;color:rgba(244,241,236,.86)}
.pl-n{font-family:var(--hf,inherit);font-weight:800;font-size:13px;letter-spacing:.3em;color:#f4f1ec}
.pl-bar{position:relative;width:148px;height:2px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden}
.pl-bar i{position:absolute;inset:0;transform-origin:0 50%;transform:scaleX(var(--p,0));background:linear-gradient(90deg,${accent},#7aa6ff);box-shadow:0 0 12px ${accent}}
.pl-c{font-variant-numeric:tabular-nums;letter-spacing:.12em;color:rgba(244,241,236,.55)}
.pl.out{clip-path:inset(0 0 100% 0)}
.pl.out .pl-in{transform:translateY(-28px);opacity:0}
@keyframes plfail{to{visibility:hidden;opacity:0}}
@media(prefers-reduced-motion:reduce){.pl{display:none}}
</style><script>if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('pl-on')</script><div class="pl-in"><svg viewBox="${vb}" role="presentation"><ellipse class="pl-glow" cx="0" cy="${(N - 1) * H + T}" rx="${N * W * 0.9}" ry="${N * H * 0.55}"/>${tiles}</svg><div class="pl-m"><span class="pl-n">${name}</span><span class="pl-bar"><i></i></span><span class="pl-c">Laying your drive <b>00</b></span></div></div></div>`;
}
