import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import './agd/agd.css';
import Home from './agd/Home';
const NotFound = lazy(() => import('./agd/NotFound'));

const isHome = location.pathname === '/' || location.pathname === '/index.html';
// Prerendered shell stays painted (keeps LCP); React mounts beside it, then the shell goes in the same frame.
const rootEl = document.getElementById('root')!;
const shell = document.getElementById('shell');
const app = document.createElement('div');
rootEl.appendChild(app);
flushSync(() => createRoot(app).render(
  <StrictMode>{isHome ? <Home /> : <Suspense fallback={null}><NotFound /></Suspense>}</StrictMode>,
));
shell?.remove();
