import './lib/fetchInterceptor.ts';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Progressive Web App (PWA) support on mobile devices
const isProdEnv = (import.meta as any).env?.PROD;

// Capture beforeinstallprompt globally as early as possible to prevent race conditions with component mounts
(window as any).deferredPWAInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPWAInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
});

const isIframe = typeof window !== 'undefined' && window.self !== window.top;

if ('serviceWorker' in navigator && isProdEnv && !isIframe) {
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Lumora ServiceWorker registered successfully:', reg.scope))
        .catch((err) => console.error('Lumora ServiceWorker registration failed:', err));
    } catch (e) {
      console.warn('Lumora ServiceWorker registration threw an error:', e);
    }
  });
}

// Auto-reload the page when service worker undergoes an active change (instantly loads fresh deploys for users)
if ('serviceWorker' in navigator && !isIframe) {
  let refreshing = false;
  try {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('Lumora ServiceWorker content updated! Auto-reloading client for fresh assets.');
      window.location.reload();
    });
  } catch (e) {
    console.warn('Lumora ServiceWorker controllerchange listener failed:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
