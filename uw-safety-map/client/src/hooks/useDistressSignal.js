import { useState, useRef, useCallback } from 'react';
import { UW_CENTER } from '../constants';

const COUNTDOWN_START = 3;

export function useDistressSignal({ socket, userLocation, mapCenter }) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'countdown' | 'sent' | 'error'
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const intervalRef = useRef(null);

  function clearTimer() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function getLocation() {
    if (userLocation && userLocation.lat != null && userLocation.lng != null) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    const center = mapCenter || UW_CENTER;
    return { lat: center[0], lng: center[1] };
  }

  function emitSignal() {
    const { lat, lng } = getLocation();
    const payload = { lat, lng, timestamp: Date.now() };

    if (!socket || !socket.connected) {
      setPhase('error');
      return;
    }

    socket.emit('distress_signal', payload);
    setPhase('sent');
  }

  const initiate = useCallback(() => {
    if (phase !== 'idle') return;
    setCountdown(COUNTDOWN_START);
    setPhase('countdown');

    let current = COUNTDOWN_START;
    intervalRef.current = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearTimer();
        emitSignal();
      } else {
        setCountdown(current);
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, socket, userLocation, mapCenter]);

  const cancel = useCallback(() => {
    if (phase !== 'countdown') return;
    clearTimer();
    setCountdown(COUNTDOWN_START);
    setPhase('idle');
  }, [phase]);

  const reset = useCallback(() => {
    clearTimer();
    setCountdown(COUNTDOWN_START);
    setPhase('idle');
  }, []);

  return { phase, countdown, initiate, cancel, reset };
}
