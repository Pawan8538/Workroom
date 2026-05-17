import { useEffect } from 'react';

export const useDoorkeeper = () => {
  useEffect(() => {
    // Visitor tracking logic
    const trackVisitor = async () => {
      try {
        await fetch('/api/doorkeeper/track', { method: 'POST' });
      } catch (err) {
        // Silent fail as it's a hidden tracker
      }
    };

    trackVisitor();
  }, []);
};
