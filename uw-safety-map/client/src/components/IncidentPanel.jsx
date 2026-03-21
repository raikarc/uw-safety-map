import { formatDistanceToNow } from 'date-fns';
import { INCIDENT_COLORS, INCIDENT_ICONS } from '../constants';
import './IncidentPanel.css';

export default function IncidentPanel({ incident, onClose, onConfirm, onResolve }) {
  if (!incident) return null;

  const color = INCIDENT_COLORS[incident.type] || '#888';
  const timeLeft = incident.expiresAt
    ? Math.max(0, Math.round((incident.expiresAt - Date.now()) / 60000))
    : 30;

  return (
    <div className="incident-panel">
      <button className="panel-close" onClick={onClose}>✕</button>

      <div className="panel-type" style={{ color }}>
        {INCIDENT_ICONS[incident.type]} {incident.type}
      </div>

      {incident.source === 'uw_alert' && (
        <div className="panel-uw-badge">📢 Official UW Alert</div>
      )}

      {incident.description && (
        <p className="panel-desc">{incident.description}</p>
      )}

      <div className="panel-meta">
        <span>🕐 {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}</span>
        <span>⏳ Expires in ~{timeLeft}m</span>
        <span>✓ {incident.confirmations} confirmations</span>
      </div>

      <div className="panel-coords">
        {incident.lat.toFixed(5)}, {incident.lng.toFixed(5)}
      </div>

      <div className="panel-actions">
        <button
          className="btn-confirm"
          onClick={() => { onConfirm(incident.id); onClose(); }}
        >
          ✓ Still happening
        </button>
        <button
          className="btn-resolve"
          onClick={() => { onResolve(incident.id); onClose(); }}
        >
          ✗ Resolved
        </button>
      </div>
    </div>
  );
}
