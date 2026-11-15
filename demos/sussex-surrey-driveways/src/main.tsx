import { StrictMode, lazy, Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles.css';
import { SiteProvider } from './lib/ctx';
import Home from './pages/Home';

const Capture = lazy(() => import('./pages/Capture'));

const rootEl = document.getElementById('root')!;
const app = (<StrictMode>
    <SiteProvider>
      {location.pathname.startsWith('/capture')
        ? <Suspense fallback={null}><Capture /></Suspense>
        : <Home />}
    </SiteProvider>
  </StrictMode>);
// The hero is prerendered into #root (scripts/prerender.mjs): hydrate it so the first paint is kept, not repainted.
if (rootEl.firstElementChild && !location.pathname.startsWith('/capture')) hydrateRoot(rootEl, app);
else createRoot(rootEl).render(app);
