# Tasks: Crowdsourced Safety Map

## Completed

- [x] Scaffold React + Vite client and Node.js + Express server
- [x] Implement Leaflet map with U-District bounding box overlay
- [x] Build incident reporting flow (map click → ReportModal → POST /api/incidents)
- [x] Add Socket.IO real-time broadcast (new_incident, incidents_updated)
- [x] Build custom incident markers (color-coded by type, UW Alert pulse animation)
- [x] Implement 30-minute auto-expiry with server-side pruning
- [x] Build confirm / resolve actions on IncidentPanel
- [x] Add proximity notification toasts (NotificationToast)
- [x] Build UW Alert Simulator (demo tool in header)
- [x] Add UWPD contact modal for Violence / Criminal Activity reports
- [x] Write README with setup instructions and technical write-up
- [x] Add .kiro directory with steering, hooks, and spec

## Backlog

- [ ] Firebase Firestore integration (persistent storage)
- [ ] Firebase Auth + UW NetID SSO
- [ ] Live GPS location tracking (opt-in)
- [ ] Server-side proximity filtering (haversine distance, socket rooms)
- [ ] Firebase Cloud Messaging for native push notifications
- [ ] React Native / Expo mobile app
- [ ] Real UW Alert API/email ingestion
- [ ] Historical heatmap view
- [ ] Walking route safety overlay
