# Husky Help 🗺️
# _Protect the Pack_

## What is this?

UW Safety Map is a crowdsourced safety tool built for University of Washington students navigating the U-District. The UW area is an urban campus where students often travel significant distances between housing and campus — this app gives them real-time, community-driven visibility into what's happening around them.

### Features

- **Incident Reporting** — Drop a pin anywhere within the U-District boundary and report what you saw: Police Presence, Criminal Activity, or Violence
- **UW Alert Integration** — When a UW Alert is issued, it appears on the map automatically as a distinct pin so students can see exactly where it happened
- **Live Updates** — The map updates in real time via WebSockets; all connected users see new incidents instantly
- **Crowdsourced Expiry** — Nearby users get a notification asking "Is this still happening?" Incidents auto-expire after 30 minutes if no one confirms them, keeping the map accurate
- **Confirm / Resolve** — Click any pin to confirm it's still active (resets the 30-min timer) or mark it as resolved

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Map | Leaflet + react-leaflet |
| Real-time | Socket.IO |
| Backend | Node.js + Express |
| Data | In-memory store (demo) |

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### 1. Clone the repo

```bash
git clone https://github.com/your-username/uw-safety-map.git
cd uw-safety-map
```

### 2. Start the server

```bash
cd server
npm install
npm start
```

The server runs on `http://localhost:3001`

### 3. Start the client

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173` (or `5174` if that port is in use)

### 4. Open it

Navigate to the local URL printed in your terminal. The green "Live" dot in the header confirms the WebSocket connection is active.

---

## Demo

Once running, you can:

- **Click the map** inside the dashed U-District boundary to report an incident
- **Click "Simulate UW Alert"** in the header to test the UW Alert flow
- **Click any pin** to confirm or resolve an incident
- Open multiple browser tabs to see real-time sync in action

---

## Project Structure

```
uw-safety-map/
├── client/               # React frontend
│   └── src/
│       ├── components/   # Map, modals, panels, toasts
│       ├── hooks/        # useSocket, useIncidents
│       └── constants.js  # Bounds, colors, incident types
└── server/
    └── index.js          # Express + Socket.IO server
```

---

## Future Plans

- Firebase Firestore for persistent storage
- User authentication
- Live location tracking with proximity-based notifications
- Mobile app via React Native / Expo
- Real UW Alert API integration
