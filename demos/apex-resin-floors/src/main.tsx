import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles.css';
import { SiteProvider } from './lib/ctx';
import Home from './pages/Home';

const Lab = lazy(() => import('./pages/Lab'));
const Presets = lazy(() => import('./pages/Presets'));
const Capture = lazy(() => import('./pages/Capture'));
const Preview = lazy(() => import('./pages/Preview'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/lab/:category" element={<Lab />} />
            <Route path="/presets" element={<Presets />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/preview/:id" element={<Preview />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SiteProvider>
  </StrictMode>,
);
requestAnimationFrame(() => document.getElementById('boot')?.classList.add('out'));
