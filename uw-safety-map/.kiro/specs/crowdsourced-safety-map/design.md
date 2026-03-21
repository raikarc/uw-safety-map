# Design: Crowdsourced Safety Map

## Architecture

See `.kiro/steering/architecture.md` for the full system diagram and data model.

## Component Design

### SafetyMap
- Uses `react-leaflet` `MapContainer` with a `Rectangle` overlay showing the U-District boundary
- Custom `divIcon` markers per incident type using emoji + color-coded border
- `useMapEvents` hook captures click coordinates and validates against bounding box before passing up
- UW Alert markers get a CSS pulse animation and gold badge to distinguish them visually

### Incident Lifecycle
```
User clicks map
  → ReportModal (type + description)
    → POST /api/incidents
      → Server stores + broadcasts via Socket.IO
        → All clients update map
          → If Violence/Criminal Activity → UWPDModal
            → Toast notification to all clients
              → 30min timer starts
                → Confirm: timer resets | Resolve: removed | Timeout: auto-pruned
```

### State Management
No external state library — React `useState` + `useRef` in `App.jsx` is sufficient for the demo scope. The two custom hooks (`useSocket`, `useIncidents`) encapsulate all async/socket logic cleanly.

## UI Design

- Purple (`#4b2e83`) / Gold (`#b7a57a`) / Dark (`#1a0a2e`) — UW brand colors throughout
- Map tiles: OpenStreetMap (no API key required)
- Modals use a blurred overlay (`backdrop-filter: blur`) for depth
- Incident panel slides in from the right when a pin is clicked
- Toasts stack in the bottom-right corner

## Future Design Considerations

- Replace in-memory store with Firebase Firestore (real-time listeners replace polling)
- Add Firebase Auth with UW NetID SSO to tie reports to verified students
- React Native port: `SafetyMap` swaps `react-leaflet` for `react-native-maps`, all hooks remain unchanged
- Geofencing for proximity alerts: compute haversine distance server-side, emit to specific socket rooms
