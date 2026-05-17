// ─────────────────────────────────────────────────────────────
// client/src/components/Hidden/TheObserver.jsx
// ─────────────────────────────────────────────────────────────
//
// THE OBSERVER
// ────────────
// This component renders nothing. Absolutely nothing.
// No DOM element. No canvas object. No pixel.
//
// On mount, it makes a single silent POST to the backend's
// doorkeeper tracking endpoint. This triggers the middleware
// to create two database entries: one for the real visitor,
// and one for The Observer — an entry with no IP, no location,
// no browser, no device. Just a timestamp.
//
// This component exists in the React tree as proof that the
// Observer was summoned. If someone inspects the component
// tree in React DevTools, they will see "TheObserver" mounted.
// They will see that it returns null. They will see no state,
// no props, no refs. They will see that it made one network
// request and then went silent.
//
// If they remove this component from App.jsx, the Observer
// entries will still appear — because the middleware runs on
// every request, not just this one. This component is
// ceremonial. A formality. The Observer does not need it.
//
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';

const TheObserver = () => {
  useEffect(() => {
    // ── The summon ──
    // A single, quiet fetch. No response handling.
    // No error handling. No retry. If it fails, it fails.
    // The Observer does not depend on success.
    const summon = async () => {
      try {
        await fetch('http://localhost:5000/api/doorkeeper/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // An empty body. No data to send.
          // The backend will read the request headers instead.
          body: JSON.stringify({}),
        });
      } catch {
        // Silence.
      }
    };

    summon();
  }, []);

  // ── It renders nothing. ──
  // It was never meant to be seen.
  return null;
};

export default TheObserver;
