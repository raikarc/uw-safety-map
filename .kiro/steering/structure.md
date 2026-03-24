# Project Structure

```
uw-safety-map/
├── client/                         # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── src/
│       ├── main.jsx                # Entry point
│       ├── App.jsx                 # Root component, state orchestration
│       ├── App.css
│       ├── index.css
│       ├── constants.js            # UW_BOUNDS, UW_CENTER, INCIDENT_TYPES/COLORS/ICONS, API_URL
│       ├── components/
│       │   ├── SafetyMap.jsx       # Leaflet map, markers, click handler
│       │   ├── SafetyMap.css
│       │   ├── Header.jsx          # Nav bar, connection status indicator
│       │   ├── Header.css
│       │   ├── ReportModal.jsx     # Incident submission form (no separate CSS)
│       │   ├── IncidentPanel.jsx   # Sidebar detail view for selected incident
│       │   ├── IncidentPanel.css
│       │   ├── NotificationToast.jsx  # Proximity alert toasts
│       │   ├── NotificationToast.css
│       │   ├── UWAlertSimulator.jsx   # Dev tool to simulate UW Alert posts
│       │   ├── UWPDModal.jsx       # UWPD contact info modal
│       │   ├── UWPDModal.css
│       │   ├── NaloxoneModal.jsx   # Naloxone info modal (triggered on Overdose)
│       │   ├── NaloxoneModal.css
│       │   ├── HelpChat.jsx        # AI safety assistant chat UI
│       │   └── HelpChat.css
│       ├── hooks/
│       │   ├── useSocket.js        # Socket.IO connection, connected state
│       │   └── useIncidents.js     # Incident CRUD + socket sync
│       └── utils/
│           └── chatbot.js          # Help chat logic
└── server/
    └── index.js                    # Express + Socket.IO server, in-memory store
```

## Architecture Patterns

### State Management
- All top-level state lives in `App.jsx` and is passed down as props
- No global state library — React `useState`/`useEffect`/`useRef` only
- Socket connection managed by `useSocket` hook; incident state managed by `useIncidents` hook
- Pattern: fetch on mount via REST, then stay in sync via `incidents_updated` socket event

### Component Conventions
- Each component has a co-located CSS file with the same name (e.g. `Header.jsx` + `Header.css`)
- Exception: `ReportModal.jsx` shares `Modal.css`
- Components are default exports, hooks are named exports
- Modal components receive an `onClose` callback prop

### Server Conventions
- Single file server (`index.js`) — CommonJS, no separate route files
- All incident mutations emit `incidents_updated` with the full incidents array to all clients
- New incidents also emit `new_incident` (single object) for targeted handling
- UW Alerts additionally emit `uw_alert` for special client-side handling
- Incident shape: `{ id, lat, lng, type, description, source, timestamp, expiresAt, confirmations, active }`
- `source` is either `'user'` or `'uw_alert'`

### API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/incidents` | Fetch all active incidents |
| POST | `/api/incidents` | Create user incident |
| POST | `/api/incidents/:id/confirm` | Confirm still active (resets expiry) |
| POST | `/api/incidents/:id/resolve` | Remove incident |
| POST | `/api/uw-alert` | Simulate a UW Alert (demo) |
