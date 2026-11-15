import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles.css';
import { SiteProvider } from './lib/ctx';
import Home from './pages/Home';

const Capture = lazy(() => import('./pages/Capture'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SiteProvider>
  </StrictMode>,
);
requestAnimationFrame(() => document.getElementById('boot')?.classList.add('out'));
