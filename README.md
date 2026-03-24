# HuskyHelp 🐺📍
## _Protect The Pack_
> A live, crowdsourced safety map for the University of Washington and U-District — built by students, for students.

---

## Project Overview

### The Problem

Students at the University of Washington feel disconnected from campus safety. The UW Alert system — the university's official emergency notification tool — has lost student trust. It rarely sends notifications, and when it does, they're often delayed to the point of being useless.

This problem is compounded by UW's urban campus setting. Most non-freshman students live in off-campus housing in the surrounding U-District and Capitol Hill neighborhoods, areas that carry real safety concerns. Students commuting between their apartments and campus — whether heading to a late-night study session or walking back from a club meeting — have no reliable way to know what's happening around them in real time.

Recent increases in police presence on campus have made this even more pressing. Students deserve to know what's going on near them, not find out after the fact.

### Target Users

UW students — particularly those living off-campus who regularly travel through the U-District on foot, by bike, or by bus.

### Solution

Safety Map is a live, crowdsourced safety map of the UW campus and surrounding U-District. Any user can report an unsafe situation, drop a pin at the location, and categorize what's happening. Other users are notified in real time and can check the map at any moment for an up-to-date picture of campus safety.

The app also crowdsources the *duration* of an incident. Pins automatically expire after 30 minutes with no activity — but nearby users can confirm whether an incident is still ongoing, keeping the map accurate without relying on any single source of truth.

### Key Features

- **Incident Reporting** — Drop a pin anywhere within the U-District boundary and tag it as Police Presence, Criminal Activity, or Violence, with an optional description
- **Help Chatbot** -- Give Safety Assistant details of your (non-emergency) dangerous situation and it will provide you a plan of action with emergency phone numbers to call just in case 
- **UW Alert Integration** — Official UW Alerts are automatically added to the map as distinct pins so students can see exactly where and what is happening
- **Real-Time Updates** — The map updates live via WebSockets; every connected user sees new incidents the moment they're reported
- **Crowdsourced Expiry** — Incidents auto-expire after 30 minutes if no one confirms them. Nearby users receive a prompt asking "Is this still happening?" to keep data reliable
- **Proximity Notifications** — Users within a 1-mile walking radius of a new incident receive an in-app safety alert immediately
- **UWPD Quick Contact** — When a student reports Violence or Criminal Activity, they're immediately prompted with the option to call UWPD's emergency line (206-685-1800) or non-emergency line (206-685-4973) directly from the app
- **Confirm / Resolve** — Any user can click a pin to confirm it's still active (resetting the 30-minute timer) or mark it as resolved

---

## Design Decisions

### Tech Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend | React + Vite | Fast dev experience, component model maps cleanly to the UI needs (map, modals, toasts, panels) |
| Map | Leaflet + react-leaflet | Lightweight, open-source, no API key required for a demo — easy to swap for Mapbox later |
| Real-time | Socket.IO | Handles WebSocket connections with automatic fallback; ideal for broadcasting incident updates to all connected clients instantly |
| Backend | Node.js + Express | Minimal overhead, fast to iterate on, pairs naturally with Socket.IO |
| Data | In-memory store (demo) | Keeps the demo self-contained with zero infrastructure setup; designed to be swapped for Firebase Firestore |

### Trade-offs

- **In-memory vs. persistent storage** — The current demo uses an in-memory array on the server. This means incidents reset on server restart. The architecture is intentionally designed so Firestore can be dropped in with minimal changes — the data shape and API contract are already defined.
- **Web-first vs. native mobile** — The demo is a React web app for speed of iteration and demoing in a browser. The component structure and hooks are written to be portable to React Native (Expo) when the time comes.
- **Bounding box vs. geofencing** — Incident pins are constrained to a rectangular U-District bounding box rather than a precise polygon. This is a deliberate simplification for the demo that can be tightened with a proper GeoJSON boundary later.
- **Anonymous reporting** — The demo does not require authentication. This lowers the barrier to reporting but opens the door to spam. The plan is to add UW NetID-based auth (Firebase Auth + SSO) so reports are tied to verified UW students.

### Security & Scalability

- Input is validated server-side before any incident is stored or broadcast
- Coordinates are clamped to the U-District bounding box — reports outside the area are rejected
- The 30-minute auto-expiry and crowdsourced confirmation model act as a natural spam filter: unconfirmed false reports disappear on their own
- Socket.IO rooms can be used in a future version to only broadcast incidents to users within a relevant geographic area, reducing noise and improving scalability
- Moving to Firebase Firestore adds persistence, real-time listeners, and horizontal scalability without a major architectural change

---

## Kiro Usage

This project was built using [Kiro](https://kiro.dev), an AI-powered IDE. Here's how different Kiro features shaped the development process:

### Vibe Coding

The majority of the app was built through natural language prompting — describing features conversationally and letting Kiro scaffold the implementation. The initial prompt described the full product vision (crowdsourced map, incident types, UW Alert integration, expiry logic, purple/gold UI) and Kiro generated the full project structure, component hierarchy, server, and real-time logic in one pass. Subsequent features like the UWPD contact modal were added the same way — describe the behavior, Kiro writes it.

### Agent Hooks

Kiro's agent hooks were used to automate repetitive tasks during development — for example, automatically running diagnostics after file edits to catch issues immediately without manually switching context. This kept the feedback loop tight and reduced the chance of accumulating silent errors across files.

### Spec-Driven Development

The feature set was treated as a living spec. Each major capability (reporting, expiry, notifications, UWPD prompt) was described as a requirement before implementation, which helped Kiro generate code that matched the intended behavior rather than a generic interpretation. This is especially useful for a product with nuanced UX logic like the crowdsourced confirmation flow.

### Steering Docs

Steering files in `.kiro/steering/` can be used to encode project-wide conventions — things like the UW color palette (`#4b2e83` purple, `#b7a57a` gold), the U-District bounding box coordinates, or the rule that all modals follow the same CSS class structure. This keeps Kiro's output consistent across sessions without re-explaining conventions every time.

### MCP (Model Context Protocol)

MCP servers can extend Kiro with external tool access. For a future version of this project, an MCP integration with a mapping or geolocation service would allow Kiro to reason about real geographic data — validating bounding boxes, computing walking distances for proximity alerts, or pulling in live UW Alert feed data — directly within the development workflow.

---

## Learning Journey & Forward Thinking

### Challenges

- **Real-time state sync** — Keeping the incident list consistent across all connected clients required careful thinking about when to use REST (initial load) vs. WebSocket events (live updates). The final pattern — fetch on mount, then listen for `incidents_updated` socket events — is clean but took iteration to get right.
- **Map marker customization** — Leaflet's default icon system doesn't play well with Vite's asset bundling. Getting custom emoji-based div icons to render correctly (and fixing the broken default icon URLs) required working around some Leaflet internals.
- **Expiry UX** — Deciding how to communicate incident age and time-to-expiry to users without cluttering the UI was a design challenge. The current solution (expiry countdown in the side panel, auto-removal after 30 minutes) is minimal but functional.

### Lessons

- Crowdsourced data is only as good as its expiry model. Without the 30-minute auto-remove and confirmation system, the map would quickly fill with stale pins and lose user trust — the same problem that plagues the UW Alert system this app is trying to replace.
- Starting with a web demo before committing to React Native was the right call. The core logic (hooks, API layer, socket handling) is already portable; the map component is the only piece that needs a native swap.

### Future Plans
- **Focus Group Feedback** -- Demo product to small subset of UW students before launching so they can give feedback on our features which we will then implement
- **Firebase Firestore** — Persistent storage so incidents survive server restarts and can be queried historically
- **UW NetID Authentication & Guest users** — Tie reports to verified UW students/U-District residents to reduce spam and enable trust scoring
- **React Native / Expo** — Mobile app with native push notifications (Firebase Cloud Messaging) for proximity alerts
- **Live location tracking** — Opt-in GPS tracking to automatically detect when a user is near an active incident
- **Real UW Alert API integration** — Parse and ingest official UW Alert emails/SMS into the map automatically
- **Heatmap view** — Aggregate historical incident data into a heatmap so students can identify patterns in unsafe areas over time
- **Walking route safety overlay** — Highlight safer vs. higher-risk walking routes between common origin/destination pairs (housing → campus)

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/raikarc/uw-safety-map.git
cd uw-safety-map
```

### 2. Start the server

```bash
cd server
npm install
npm start
```

Runs on `http://localhost:3001`

### 3. Start the client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173` (or `5174` if that port is taken)

### 4. Open it

Go to the local URL in your terminal. The green "Live" dot in the header confirms the WebSocket connection is active.

---
## Video Demo
Find the video demo here: https://youtu.be/7VJ4ZPGkkCw

---

## Project Structure

```
uw-safety-map/
├── client/
│   └── src/
│       ├── components/     # SafetyMap, Header, ReportModal, IncidentPanel,
│       │                   # NotificationToast, UWAlertSimulator, UWPDModal
│       ├── hooks/          # useSocket, useIncidents
│       └── constants.js    # Bounding box, colors, incident types
└── server/
    └── index.js            # Express + Socket.IO, incident store, expiry logic
```
