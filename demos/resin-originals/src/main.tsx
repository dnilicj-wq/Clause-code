import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { SiteProvider } from './lib/ctx';
import Home from './pages/Home';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteProvider>
      <Home />
    </SiteProvider>
  </StrictMode>,
);
requestAnimationFrame(() => document.getElementById('boot')?.classList.add('out'));
