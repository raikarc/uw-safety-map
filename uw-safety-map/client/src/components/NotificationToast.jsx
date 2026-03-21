import { INCIDENT_COLORS, INCIDENT_ICONS } from '../constants';
import './NotificationToast.css';

export default function NotificationToast({ notification, onDismiss, onConfirm }) {
  const { incident, isAlert } = notification;
  const color = INCIDENT_COLORS[incident.type] || '#888';

  return (
    <div className={`toast ${isAlert ? 'toast-alert' : ''}`} style={{ borderLeftColor: color }}>
      <div className="toast-header">
        <span className="toast-icon">{INCIDENT_ICONS[incident.type]}</span>
        <span className="toast-type" style={{ color }}>{incident.type}</span>
        {isAlert && <span className="toast-uw-badge">UW Alert</span>}
        <button className="toast-close" onClick={onDismiss}>✕</button>
      </div>
      {incident.description && (
        <p className="toast-desc">{incident.description}</p>
      )}
      <div className="toast-actions">
        <span className="toast-question">Is this still happening?</span>
        <button className="toast-confirm" onClick={onConfirm}>Yes, still active</button>
        <button className="toast-dismiss" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
}
