// ─────────────────────────────────────────────────────────────
// client/src/components/Hidden/TheObserver.jsx
// ─────────────────────────────────────────────────────────────
//
// THE OBSERVER
// ────────────
// This component renders nothing. Absolutely nothing.
// No DOM element. No canvas object. No pixel.
//
// On mount, it initializes the silent Doorkeeper tracking hook.
// This triggers the middleware to create two database entries:
// one for the real visitor, and one for The Observer — a hollow companion
// entry with no IP, no location, no browser, no device. Just a timestamp.
//
// This component exists in the React tree as proof that the
// Observer was summoned. If someone inspects the component
// tree in React DevTools, they will see "TheObserver" mounted.
// They will see that it returns null. They will see no state,
// no props, no refs.
//
// ─────────────────────────────────────────────────────────────

import { useDoorkeeper } from '../../hooks/useDoorkeeper';

const TheObserver = () => {
  // Silently initialize visitor tracking and summon The Observer
  useDoorkeeper();

  // ── It renders nothing. ──
  // It was never meant to be seen.
  return null;
};

export default TheObserver;
