import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../constants';

const STORAGE_KEY = 'uw_safe_walk_session';

function readStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeStorage(data) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* private browsing */ }
}

function clearStorage() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function useSafeWalk() {
  const [phase, setPhase] = useState('idle'); // idle | setup | active | expired
  const [remaining, setRemaining] = useState(0);
  const [contact, setContact] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const durationRef = useRef(0);
  const contactRef = useRef('');

  // Resume from sessionStorage on mount
  useEffect(() => {
    const saved = readStorage();
    if (!saved) return;
    const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
    const rem = saved.durationSeconds - elapsed;
    if (rem > 0) {
      durationRef.current = saved.durationSeconds;
      contactRef.current = saved.contact;
      setDuration(saved.durationSeconds);
      setContact(saved.contact);
      setRemaining(rem);
      setPhase('active');
    } else {
      clearStorage();
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (phase !== 'active') return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          clearInterval(intervalRef.current);
          clearStorage();
          // Log expired session to server
          fetch(`${API_URL}/api/safe-walk/expired`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact: contactRef.current, expiredAt: Date.now() }),
          }).catch(() => {});
          setPhase('expired');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const startSession = useCallback((durationMinutes, emergencyContact) => {
    const mins = Number(durationMinutes);
    if (!mins || mins < 1 || mins > 60) {
      setError('Duration must be between 1 and 60 minutes.');
      return false;
    }
    if (!emergencyContact || !emergencyContact.trim()) {
      setError('Please enter an emergency contact.');
      return false;
    }
    setError('');
    const secs = mins * 60;
    durationRef.current = secs;
    contactRef.current = emergencyContact.trim();
    writeStorage({ durationSeconds: secs, startedAt: Date.now(), contact: emergencyContact.trim() });
    setDuration(secs);
    setContact(emergencyContact.trim());
    setRemaining(secs);
    setPhase('active');
    return true;
  }, []);

  const checkIn = useCallback(() => {
    const secs = durationRef.current;
    setRemaining(secs);
    // Update startedAt in storage so resume is accurate
    const saved = readStorage();
    if (saved) writeStorage({ ...saved, startedAt: Date.now(), durationSeconds: secs });
  }, []);

  const endSession = useCallback(() => {
    clearInterval(intervalRef.current);
    clearStorage();
    setPhase('idle');
    setRemaining(0);
    setContact('');
    setDuration(0);
    setError('');
  }, []);

  const goToSetup = useCallback(() => { setPhase('setup'); setError(''); }, []);

  return { phase, remaining, contact, duration, error, startSession, checkIn, endSession, goToSetup };
}
