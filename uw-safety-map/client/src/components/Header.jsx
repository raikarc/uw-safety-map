import './Header.css';

export default function Header({ connected, onSimulate, onHelpChat, heatmapActive, onHeatmapToggle }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">🗺️</span>
        <div>
          <h1 className="header-title">HuskyHelp</h1>
          <p className="header-sub">Protect the Pack · U-District Safety</p>
        </div>
      </div>
      <div className="header-right">
        <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
        <span className="status-label">{connected ? 'Live' : 'Offline'}</span>
        <button className="help-chat-btn" onClick={onHelpChat}>
          🆘 Help Chat
        </button>
        <button
          className={`heatmap-toggle-btn ${heatmapActive ? 'heatmap-toggle-btn--active' : ''}`}
          onClick={onHeatmapToggle}
        >
          🌙 Heatmap
        </button>
        <button className="uw-alert-btn" onClick={onSimulate}>
          📢 Simulate UW Alert
        </button>
      </div>
    </header>
  );
}
