import { useState } from 'react';
import { INCIDENT_TYPES } from '../constants';
import './Modal.css';

export default function ReportModal({ latlng, onSubmit, onCancel }) {
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ type, description });
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">📍 Report Incident</h2>
        <p className="modal-coords">
          {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
        </p>
        <form onSubmit={handleSubmit}>
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

          <label className="modal-label">Description (optional)</label>
          <textarea
            className="modal-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What did you see?"
            rows={3}
          />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Submit Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}
