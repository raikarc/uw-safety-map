---
inclusion: always
---

# UW Safety Map — Architecture

## Overview

```
client (React + Vite)
    ↕ REST (fetch)       → GET/POST /api/incidents
    ↕ WebSocket (Socket.IO) → incidents_updated, new_incident, uw_alert

server (Node.js + Express + Socket.IO)
    → In-memory incident store (swap for Firestore in production)
```

## Client Structure

```
src/
  components/
    SafetyMap.jsx        # Leaflet map, markers, click handler
    Header.jsx           # Nav bar, connection status, UW Alert simulator trigger
    ReportModal.jsx      # Form to submit a new incident pin
    IncidentPanel.jsx    # Side panel shown when a pin is clicked
    NotificationToast.jsx # Bottom-right toast for new incidents nearby
    UWAlertSimulator.jsx # Dev tool to simulate an incoming UW Alert
    UWPDModal.jsx        # Post-report prompt to call UWPD
  hooks/
    useSocket.js         # Manages Socket.IO connection lifecycle
    useIncidents.js      # Fetches incidents, listens for updates, exposes actions
  constants.js           # Bounding box, colors, incident types, API URL
```

## Server Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/incidents` | Return all active incidents |
| POST | `/api/incidents` | Create a new user-reported incident |
| POST | `/api/incidents/:id/confirm` | Confirm incident still active (resets expiry) |
| POST | `/api/incidents/:id/resolve` | Remove incident immediately |
| POST | `/api/uw-alert` | Simulate an incoming UW Alert (adds pin + emits `uw_alert` event) |

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `incidents_updated` | server → client | Full incidents array |
| `new_incident` | server → client | Single new incident object |
| `uw_alert` | server → client | Single UW Alert incident object |

## Data Model — Incident

```js
{
  id: string,           // uuid
  lat: number,
  lng: number,
  type: string,         // 'Police Presence' | 'Criminal Activity' | 'Violence'
  description: string,
  source: string,       // 'user' | 'uw_alert'
  timestamp: number,    // Date.now()
  expiresAt: number,    // timestamp + 30 min
  confirmations: number,
  active: boolean
}
```
