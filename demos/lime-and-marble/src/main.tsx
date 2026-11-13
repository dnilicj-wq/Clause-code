import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import './lime/lime.css';
import Home from './lime/Home';
import Burnish from './lime/Burnish';
const NotFound = lazy(() => import('./lime/NotFound'));

const cap = new URLSearchParams(location.search).get('cap');
if (cap) document.getElementById('boot')?.remove();
const isHome = location.pathname === '/' || location.pathname === '/index.html';
// Prerendered shell stays painted (keeps LCP); React mounts beside it, then the shell goes in the same frame.
const rootEl = document.getElementById('root')!;
const shell = document.getElementById('shell');
const app = document.createElement('div');
rootEl.appendChild(app);
const r = createRoot(app);
flushSync(() => r.render(
  <StrictMode>{cap ? <div style={{ position: 'fixed', inset: 0 }}><Burnish still={cap === 'polished' ? 1 : 0} className="hero-gl on" /></div> : isHome ? <Home /> : <Suspense fallback={null}><NotFound /></Suspense>}</StrictMode>,
));
shell?.remove();
