import './Header.css';

export default function Header({ connected, onSimulate }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">🗺️</span>
        <div>
          <h1 className="header-title">UW Safety Map</h1>
          <p className="header-sub">University District · Crowdsourced Safety</p>
        </div>
      </div>
      <div className="header-right">
        <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
        <span className="status-label">{connected ? 'Live' : 'Offline'}</span>
        <button className="uw-alert-btn" onClick={onSimulate}>
          📢 Simulate UW Alert
        </button>
      </div>
    </header>
  );
}
