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

// If we are inside an iframe (like the AI Studio development preview), unregister any active
// service worker to ensure the browser loads the latest built files directly from the network.
if ('serviceWorker' in navigator && isIframe) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    let unregisteredAny = false;
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('Lumora: Unregistered active ServiceWorker from iframe to prevent cached assets in AI Studio preview.');
          unregisteredAny = true;
        }
      });
    }
    // If we unregistered any service worker, trigger a single reload after a tiny delay to load fresh assets.
    setTimeout(() => {
      if (unregisteredAny) {
        window.location.reload();
      }
    }, 300);
  });
}

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
