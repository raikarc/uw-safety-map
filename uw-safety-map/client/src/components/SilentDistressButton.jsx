import { useDistressSignal } from '../hooks/useDistressSignal';
import './SilentDistressButton.css';

export default function SilentDistressButton({ socket, userLocation, mapCenter }) {
  const { phase, countdown, initiate, cancel, reset } = useDistressSignal({
    socket,
    userLocation,
    mapCenter,
  });

  // idle: persistent button
  if (phase === 'idle') {
    return (
      <button className="distress-btn" onClick={initiate} aria-label="Send silent distress signal">
        🆘 Silent Alert
      </button>
    );
  }

  // countdown: overlay with cancel
  if (phase === 'countdown') {
    return (
      <div className="distress-overlay">
        <div className="distress-box">
          <div className="distress-countdown">{countdown}</div>
          <p className="distress-msg">Sending silent alert in {countdown} second{countdown !== 1 ? 's' : ''}…</p>
          <button className="distress-cancel-btn" onClick={cancel}>Cancel</button>
        </div>
      </div>
    );
  }

  // sent: show contacts
  if (phase === 'sent') {
    return (
      <div className="distress-overlay">
        <div className="distress-box distress-box--sent">
          <div className="distress-sent-icon">🆘</div>
          <h2 className="distress-sent-title">Alert Sent</h2>
          <p className="distress-msg">Your location has been shared. Stay safe.</p>
          <div className="distress-contacts">
            <p className="distress-contacts-label">Emergency contacts:</p>
            <a href="tel:12066851800" className="distress-contact-link">
              📞 UWPD: 206-685-1800
            </a>
            <a href="sms:741741&body=HOME" className="distress-contact-link">
              💬 Crisis Text Line: text HOME to 741741
            </a>
          </div>
          <button className="distress-cancel-btn" onClick={reset}>Dismiss</button>
        </div>
      </div>
    );
  }

  // error: socket disconnected
  if (phase === 'error') {
    return (
      <div className="distress-overlay">
        <div className="distress-box distress-box--error">
          <div className="distress-sent-icon">⚠️</div>
          <h2 className="distress-sent-title">Could Not Send Alert</h2>
          <p className="distress-msg">No connection. Call UWPD directly:</p>
          <a href="tel:12066851800" className="distress-contact-link">
            📞 206-685-1800
          </a>
          <button className="distress-cancel-btn" onClick={reset}>Dismiss</button>
        </div>
      </div>
    );
  }

  return null;
}
