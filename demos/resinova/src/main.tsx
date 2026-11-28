import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import './rv/rv.css';
import Home from './rv/Home';
const NotFound = lazy(() => import('./rv/NotFound'));

const isHome = location.pathname === '/' || location.pathname === '/index.html';
// Prerendered shell stays painted (keeps LCP); React mounts beside it, then the shell goes in the same frame.
if (!isHome) document.getElementById('hero-h')?.remove();
const rootEl = document.getElementById('root')!;
const shell = document.getElementById('shell');
const app = document.createElement('div');
rootEl.appendChild(app);
const r = createRoot(app);
flushSync(() => r.render(
  <StrictMode>{isHome ? <Home /> : <Suspense fallback={null}><NotFound /></Suspense>}</StrictMode>,
));
shell?.remove();
