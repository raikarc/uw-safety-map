import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UW_CENTER, UW_BOUNDS, INCIDENT_COLORS, INCIDENT_ICONS } from '../constants';
import { formatDistanceToNow } from 'date-fns';
import NighttimeHeatmap from './NighttimeHeatmap';
import './SafetyMap.css';

// Fix default leaflet icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createIncidentIcon(type, source) {
  const color = INCIDENT_COLORS[type] || '#888';
  const emoji = INCIDENT_ICONS[type] || '📍';
  const isAlert = source === 'uw_alert';
  return L.divIcon({
    className: '',
    html: `
      <div class="incident-marker ${isAlert ? 'uw-alert-marker' : ''}" style="border-color: ${color}; background: ${color}22;">
        <span>${emoji}</span>
        ${isAlert ? '<div class="alert-badge">UW</div>' : ''}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function createPendingIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="pending-marker">📍</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

// Bounds for the U-District area
const BOUNDS_RECT = [
  [UW_BOUNDS.south, UW_BOUNDS.west],
  [UW_BOUNDS.north, UW_BOUNDS.east],
];

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // Clamp to bounds
      if (
        lat >= UW_BOUNDS.south && lat <= UW_BOUNDS.north &&
        lng >= UW_BOUNDS.west && lng <= UW_BOUNDS.east
      ) {
        onMapClick({ lat, lng });
      }
    },
  });
  return null;
}

export default function SafetyMap({ incidents, onMapClick, onIncidentClick, reportPin, heatmapActive }) {
  return (
    <MapContainer
      center={UW_CENTER}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      maxBounds={[[UW_BOUNDS.south - 0.01, UW_BOUNDS.west - 0.01], [UW_BOUNDS.north + 0.01, UW_BOUNDS.east + 0.01]]}
      maxBoundsViscosity={0.8}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Highlight U-District boundary */}
      <Rectangle
        bounds={BOUNDS_RECT}
        pathOptions={{ color: '#4b2e83', weight: 2, fillColor: '#4b2e83', fillOpacity: 0.05, dashArray: '6 4' }}
      />

      <MapClickHandler onMapClick={onMapClick} />

      <NighttimeHeatmap incidents={incidents} active={heatmapActive} />

      {incidents.map(inc => (
        <Marker
          key={inc.id}
          position={[inc.lat, inc.lng]}
          icon={createIncidentIcon(inc.type, inc.source)}
          eventHandlers={{ click: () => onIncidentClick(inc) }}
        >
          <Popup>
            <div className="popup-content">
              <div className="popup-type" style={{ color: INCIDENT_COLORS[inc.type] }}>
                {INCIDENT_ICONS[inc.type]} {inc.type}
              </div>
              {inc.source === 'uw_alert' && (
                <div className="popup-alert-badge">📢 UW Alert</div>
              )}
              {inc.description && <p className="popup-desc">{inc.description}</p>}
              <p className="popup-time">
                {formatDistanceToNow(new Date(inc.timestamp), { addSuffix: true })}
              </p>
              <p className="popup-confirmations">✓ {inc.confirmations} confirmations</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {reportPin && (
        <Marker position={[reportPin.lat, reportPin.lng]} icon={createPendingIcon()}>
          <Popup>Drop point selected — fill in the form</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
