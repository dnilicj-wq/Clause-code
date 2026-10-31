// Renders still images from the live 3D scene (hero poster, gallery samples, OG image).
import { createSolarScene } from '../src/scene.js';
window.capture = async (cfg) => {
  const c = document.getElementById('c');
  c.style.width = cfg.w + 'px'; c.style.height = cfg.h + 'px';
  const s = createSolarScene(c, { mode: 'capture', capture: { cam: cfg.cam } });
  s.setCapture(cfg);
  s.resize(); s.renderOnce(); s.renderOnce();
  await new Promise((r) => setTimeout(r, 300));
  s.renderOnce();
  return c.toDataURL('image/png');
};
