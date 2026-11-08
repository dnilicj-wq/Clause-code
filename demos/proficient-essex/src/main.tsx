import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { SiteProvider } from './lib/ctx';
import Home from './pages/Home';

const Capture = lazy(() => import('./pages/Capture'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteProvider>
      {location.pathname.startsWith('/capture')
        ? <Suspense fallback={null}><Capture /></Suspense>
        : <Home />}
    </SiteProvider>
  </StrictMode>,
);
requestAnimationFrame(() => document.getElementById('boot')?.classList.add('out'));
