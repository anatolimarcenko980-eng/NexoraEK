import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global safeguard for lightweight-charts teardown animation race conditions
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || (event?.error && event.error.message) || '';
      if (typeof msg === 'string' && (msg.includes('Object is disposed') || msg.includes('is disposed'))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event?.reason?.message || String(event?.reason || '');
      if (reason.includes('Object is disposed') || reason.includes('is disposed')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);
