import { useState } from 'react';
import { INCIDENT_TYPES, UW_BOUNDS } from '../constants';
import './Modal.css';

// Preset UW campus locations for the simulator
const PRESET_LOCATIONS = [
  { name: 'Red Square', lat: 47.6553, lng: -122.3035 },
  { name: 'HUB', lat: 47.6558, lng: -122.3050 },
  { name: 'UW Medical Center', lat: 47.6497, lng: -122.3080 },
  { name: 'University Ave & 45th', lat: 47.6614, lng: -122.3143 },
  { name: 'Burke-Gilman Trail', lat: 47.6580, lng: -122.2980 },
  { name: 'Greek Row', lat: 47.6600, lng: -122.3100 },
];

export default function UWAlertSimulator({ onSubmit, onClose }) {
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(PRESET_LOCATIONS[0]);

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit({
      lat: location.lat,
      lng: location.lng,
      type,
      description: description || `UW Alert: ${type} reported near ${location.name}`,
    });
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">📢 Simulate UW Alert</h2>
        <p style={{ fontSize: 12, color: '#9e8fc0', marginBottom: 16 }}>
          This simulates an incoming UW Alert System notification being added to the map.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="modal-label">Location</label>
          <select
            className="modal-select"
            value={location.name}
            onChange={e => setLocation(PRESET_LOCATIONS.find(l => l.name === e.target.value))}
          >
            {PRESET_LOCATIONS.map(l => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>

          <label className="modal-label">Incident Type</label>
          <select
            className="modal-select"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {INCIDENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="modal-label">Alert Message</label>
          <textarea
            className="modal-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={`UW Alert: ${type} reported near ${location.name}`}
            rows={3}
          />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Send Alert</button>
          </div>
        </form>
      </div>
    </div>
  );
}
