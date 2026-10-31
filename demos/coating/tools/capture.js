import { createFloorScene } from '../src/scene.js';
window.capture = async (cfg) => {
  const c = document.getElementById('c');
  c.style.width = cfg.w + 'px'; c.style.height = cfg.h + 'px';
  const s = createFloorScene(c, { mode: cfg.mode || 'hero', capture: { cam: cfg.cam } });
  s.resize();
  if (cfg.heroAt != null) { s.playHero(cfg.type, cfg.key); s.start(); await new Promise(r => setTimeout(r, 50)); window.__s = s; return; }
  s.showStatic(cfg.type, cfg.key, cfg.poured !== false);
  if (cfg.pour != null) { s.uniforms.uPour.value = cfg.pour; s.uniforms.uOrigin.value.set(0.4, -2.5); }
  if (cfg.mirror === 0) s.uniforms.uMirrorOn.value = 0;
  if (cfg.noenv) s.scene.environment = null;
  s.renderOnce(); await new Promise(r => setTimeout(r, 200)); s.renderOnce();
};
