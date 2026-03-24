import { useState, useEffect } from 'react';
import { useSafeWalk } from '../hooks/useSafeWalk';
import { API_URL } from '../constants';
import './SafeWalkPanel.css';

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SafeWalkPanel() {
  const {
    phase,
    remaining,
    contact,
    startSession,
    checkIn,
    endSession,
    openSetup,
    cancelSetup,
  } = useSafeWalk();

  const [durationInput, setDurationInput] = useState('15');
  const [contactInput, setContactInput] = useState('');
  const [durationError, setDurationError] = useState('');
  const [contactError, setContactError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // POST to server when session expires
  useEffect(() => {
    if (phase !== 'expired') return;
    fetch(`${API_URL}/api/safe-walk/expired`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact, expiredAt: new Date().toISOString() }),
    }).catch(() => {});
  }, [phase, contact]);

  function handleStart(e) {
    e.preventDefault();
    setDurationError('');
    setContactError('');
    setSubmitError('');

    const mins = Number(durationInput);
    let valid = true;

    if (!durationInput || isNaN(mins) || mins < 1 || mins > 60) {
      setDurationError('Duration must be between 1 and 60 minutes.');
      valid = false;
    }
    if (!contactInput || !contactInput.trim()) {
      setContactError('Please enter an emergency contact.');
      valid = false;
    }
    if (!valid) return;

    const result = startSession(durationInput, contactInput);
    if (result && result.error) {
      setSubmitError(result.error);
    }
  }

  // Phase: idle
  if (phase === 'idle') {
    return (
      <button className="safe-walk-btn" onClick={openSetup}>
        🚶 Safe Walk
      </button>
    );
  }

  // Phase: setup
  if (phase === 'setup') {
    return (
      <div className="safe-walk-panel">
        <div className="safe-walk-panel-title">🚶 Safe Walk Mode</div>
        <form onSubmit={handleStart} noValidate>
          <div className="safe-walk-field">
            <label htmlFor="sw-duration">Walk duration (minutes)</label>
            <input
              id="sw-duration"
              type="number"
              min="1"
              max="60"
              value={durationInput}
              onChange={e => setDurationInput(e.target.value)}
            />
            {durationError && <span className="safe-walk-field-error">{durationError}</span>}
          </div>
          <div className="safe-walk-field">
            <label htmlFor="sw-contact">Emergency contact (phone or email)</label>
            <input
              id="sw-contact"
              type="text"
              value={contactInput}
              onChange={e => setContactInput(e.target.value)}
            />
            {contactError && <span className="safe-walk-field-error">{contactError}</span>}
          </div>
          {submitError && <p className="safe-walk-submit-error">{submitError}</p>}
          <div className="safe-walk-actions">
            <button type="submit" className="safe-walk-start-btn">Start Walk</button>
            <button type="button" className="safe-walk-cancel-btn" onClick={cancelSetup}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  // Phase: active
  if (phase === 'active') {
    const urgent = remaining < 60;
    return (
      <div className="safe-walk-panel">
        <div className={`timer-display${urgent ? ' urgent' : ''}`}>
          {fmt(remaining)}
        </div>
        <div className="safe-walk-actions">
          <button className="safe-walk-safe-btn" onClick={checkIn}>✅ I&apos;m Safe</button>
          <button className="safe-walk-end-btn" onClick={endSession}>End Walk</button>
        </div>
      </div>
    );
  }

  // Phase: expired
  if (phase === 'expired') {
    return (
      <div className="expired-overlay">
        <div className="expired-box">
          <div className="expired-icon">⚠️</div>
          <h2>Safe Walk Expired</h2>
          <p>Your safe walk timer has expired. If you are in danger, call UWPD immediately:</p>
          <a href="tel:12066851800" className="uwpd-number">206-685-1800</a>
          <button className="safe-walk-safe-btn" onClick={endSession}>
            I&apos;m Safe — End Session
          </button>
        </div>
      </div>
    );
  }

  return null;
}
