import './UWPDModal.css';

const EMERGENCY = 'tel:12066851800';
const NON_EMERGENCY = 'tel:12066854973';

export default function UWPDModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal uwpd-modal">
        <div className="uwpd-icon">🚔</div>
        <h2 className="modal-title">Call UWPD?</h2>
        <p className="uwpd-sub">Your report has been submitted. Do you want to contact UW Police?</p>

        <div className="uwpd-actions">
          <a href={EMERGENCY} className="uwpd-btn uwpd-emergency">
            🚨 Emergency Line
            <span>206-685-1800</span>
          </a>
          <a href={NON_EMERGENCY} className="uwpd-btn uwpd-non-emergency">
            📞 Non-Emergency Line
            <span>206-685-4973</span>
          </a>
          <button className="uwpd-btn uwpd-no" onClick={onClose}>
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
