import { useState, useEffect, useRef } from 'react';
import { useSocket } from './hooks/useSocket';
import { useIncidents } from './hooks/useIncidents';
import SafetyMap from './components/SafetyMap';
import Header from './components/Header';
import ReportModal from './components/ReportModal';
import IncidentPanel from './components/IncidentPanel';
import NotificationToast from './components/NotificationToast';
import UWAlertSimulator from './components/UWAlertSimulator';
import UWPDModal from './components/UWPDModal';
import './App.css';

export default function App() {
  const { socket, connected } = useSocket();
  const { incidents, reportIncident, confirmIncident, resolveIncident, simulateUWAlert } = useIncidents(socket);

  const [reportPin, setReportPin] = useState(null); // {lat, lng} pending report
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showUWPD, setShowUWPD] = useState(false);
  const prevIncidentIds = useRef(new Set());

  // Detect new incidents and push notifications
  useEffect(() => {
    incidents.forEach(inc => {
      if (!prevIncidentIds.current.has(inc.id)) {
        prevIncidentIds.current.add(inc.id);
        // Don't notify on initial load (first batch)
        if (prevIncidentIds.current.size > incidents.length) return;
        addNotification(inc);
      }
    });
  }, [incidents]);

  // Listen for UW alerts specifically
  useEffect(() => {
    if (!socket) return;
    const handler = (incident) => {
      addNotification(incident, true);
    };
    socket.on('uw_alert', handler);
    return () => socket.off('uw_alert', handler);
  }, [socket]);

  function addNotification(incident, isAlert = false) {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, incident, isAlert }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }

  function dismissNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  async function handleReport(data) {
    if (!reportPin) return;
    await reportIncident({ ...reportPin, ...data });
    setReportPin(null);
    if (data.type === 'Violence' || data.type === 'Criminal Activity') {
      setShowUWPD(true);
    }
  }

  return (
    <div className="app">
      <Header connected={connected} onSimulate={() => setShowSimulator(true)} />

      <div className="map-container">
        <SafetyMap
          incidents={incidents}
          onMapClick={(latlng) => setReportPin(latlng)}
          onIncidentClick={(inc) => setSelectedIncident(inc)}
          reportPin={reportPin}
        />

        <IncidentPanel
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onConfirm={confirmIncident}
          onResolve={resolveIncident}
        />
      </div>

      {reportPin && (
        <ReportModal
          latlng={reportPin}
          onSubmit={handleReport}
          onCancel={() => setReportPin(null)}
        />
      )}

      <div className="notifications">
        {notifications.map(n => (
          <NotificationToast
            key={n.id}
            notification={n}
            onDismiss={() => dismissNotification(n.id)}
            onConfirm={() => { confirmIncident(n.incident.id); dismissNotification(n.id); }}
          />
        ))}
      </div>

      {showSimulator && (
        <UWAlertSimulator
          onSubmit={simulateUWAlert}
          onClose={() => setShowSimulator(false)}
        />
      )}

      {showUWPD && <UWPDModal onClose={() => setShowUWPD(false)} />}
    </div>
  );
}
