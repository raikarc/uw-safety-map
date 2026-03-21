import './Modal.css';
import './NaloxoneModal.css';

const NALOXONE_LOCATIONS = [
  {
    name: 'Hall Health Center (UW)',
    address: '4060 E Stevens Way NE, Seattle',
    note: 'Free Narcan available — no prescription needed',
    hours: 'Mon–Fri 8am–5pm',
  },
  {
    name: 'UW Medical Center Pharmacy',
    address: '1959 NE Pacific St, Seattle',
    note: 'Naloxone dispensed over the counter',
    hours: 'Mon–Fri 8am–6pm, Sat 9am–1pm',
  },
  {
    name: 'Walgreens — U Village',
    address: '2601 NE University Village St, Seattle',
    note: 'Over-the-counter Narcan (Narcan nasal spray)',
    hours: 'Open daily',
  },
  {
    name: 'CVS Pharmacy — U District',
    address: '4535 University Way NE, Seattle',
    note: 'Over-the-counter Narcan available',
    hours: 'Open daily',
  },
  {
    name: 'Neighborcare Health @ Carolyn Downs',
    address: '2101 E Yesler Way, Seattle',
    note: 'Free Narcan + overdose training',
    hours: 'Mon–Fri 8am–5pm',
  },
];

const STEPS = [
  'Call 911 immediately — stay on the line.',
  'Try to wake the person: rub knuckles firmly on their sternum.',
  'If unresponsive and not breathing normally, administer Narcan nasal spray (one spray per nostril).',
  'Place them in the recovery position (on their side) to prevent choking.',
  'If no response in 2–3 minutes, give a second dose of Narcan if available.',
  'Stay with them until emergency services arrive — do not leave them alone.',
];

export default function NaloxoneModal({ onClose }) {
  return (
    <div className="modal-overlay naloxone-overlay">
      <div className="modal naloxone-modal">
        <h2 className="modal-title">🚑 Overdose Response</h2>
        <p className="naloxone-sub">Your report has been submitted. If someone is overdosing right now, follow these steps:</p>

        <ol className="naloxone-steps">
          {STEPS.map((s, i) => <li key={i}>{s}</li>)}
        </ol>

        <h3 className="naloxone-section-title">📍 Nearest Naloxone (Narcan) Locations</h3>
        <div className="naloxone-locations">
          {NALOXONE_LOCATIONS.map((loc, i) => (
            <div key={i} className="naloxone-location">
              <div className="naloxone-location-name">{loc.name}</div>
              <div className="naloxone-location-address">{loc.address}</div>
              <div className="naloxone-location-note">{loc.note}</div>
              <div className="naloxone-location-hours">🕐 {loc.hours}</div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <a href="tel:911" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            🚨 Call 911 Now
          </a>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
