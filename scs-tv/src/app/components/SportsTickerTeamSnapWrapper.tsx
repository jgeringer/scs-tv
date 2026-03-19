import { useState, useEffect } from 'react';
import SportsTickerTeamSnap from './SportsTickerTeamSnap';

export default function SportsTickerTeamSnapWrapper() {
  const [hasError, setHasError] = useState(false);

  // Use a custom event to communicate error from child
  useEffect(() => {
    function handleTickerError(e: CustomEvent) {
      setHasError(true);
    }
    window.addEventListener('sportsTickerError', handleTickerError as EventListener);
    return () => window.removeEventListener('sportsTickerError', handleTickerError as EventListener);
  }, []);

  return hasError ? null : <SportsTickerTeamSnap onError={() => {
    const event = new CustomEvent('sportsTickerError');
    window.dispatchEvent(event);
  }} />;
}
