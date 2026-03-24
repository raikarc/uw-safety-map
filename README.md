# HuskyHelp 🐺📍

## _Protect The Pack_
> A live, crowdsourced safety map for the University of Washington and U-District — built by students, for students.

__By Raika Roy Choudhury__

---

## Project Overview

### The Problem

Students at the University of Washington feel disconnected from campus safety. The UW Alert system — the university's official emergency notification tool — has lost student trust. It rarely sends notifications, and when it does, they're often delayed to the point of being useless.

This problem is compounded by UW's urban campus setting. Most non-freshman students live in off-campus housing in the surrounding U-District and Capitol Hill neighborhoods, areas that carry real safety concerns. Students commuting between their apartments and campus — whether heading to a late-night study session or walking back from a club meeting — have no reliable way to know what's happening around them in real time.

Recent increases in police presence on campus have made this even more pressing. Students deserve to know what's going on near them, not find out after the fact.

### Target Users

UW students — particularly those living off-campus who regularly travel through the U-District on foot, by bike, or by bus, especially at night.

### Solution

HuskyHelp is a live, crowdsourced safety map of the UW campus and surrounding U-District. Any user can report an unsafe situation, drop a pin at the location, and categorize what's happening. Other users are notified in real time and can check the map at any moment for an up-to-date picture of campus safety.

The app also crowdsources the _duration_ of an incident. Pins automatically expire after 30 minutes with no activity — but nearby users can confirm whether an incident is still ongoing, keeping the map accurate without relying on any single source of truth.

### Key Features

- **Incident Reporting** — Drop a pin anywhere within the U-District boundary and tag it as Police Presence, Criminal Activity, Violence, or Overdose, with an optional description
- **Help Chatbot** — Give the Safety Assistant details of your situation and it returns a plan of action with specific emergency contacts for your exact scenario (LINK, bus, rideshare, on campus, off campus, harassment, assault, overdose, mental health, female safety)
- **UW Alert Integration** — Official UW Alerts are automatically added to the map as distinct pulsing pins so students can see exactly where and what is happening
- **Real-Time Updates** — The map updates live via WebSockets; every connected user sees new incidents the moment they're reported
- **Crowdsourced Expiry** — Incidents auto-expire after 30 minutes if no one confirms them. Nearby users receive a prompt asking "Is this still happening?" to keep data reliable
- **Proximity Notifications** — In-app toast alerts when new incidents are reported nearby
- **UWPD Quick Contact** — When a student reports Violence, Criminal Activity, or Overdose, they're immediately prompted with UWPD's emergency (206-685-1800) and non-emergency (206-685-4973) lines
- **Naloxone Locator** — Overdose reports trigger a modal with step-by-step response instructions and the 5 nearest Narcan locations in the U-District
- **Confirm / Resolve** — Any user can click a pin to confirm it's still active (resetting the 30-minute timer) or mark it as resolved
- **Safe Walk Mode** — Start a timed check-in session before walking home. If you don't check in before the timer expires, the app alerts your emergency contact and displays UWPD's number. Survives page refreshes via `sessionStorage`
- **Silent Distress Signal** — One tap sends your GPS location to all connected users and drops a 🆘 pin on the map, with a 3-second cancellable countdown to prevent accidents
- **Nighttime Heatmap** — Toggle a color-coded density overlay showing where incidents have historically clustered between 8 PM and 4 AM, so students can make informed routing decisions
- **Demo Login** — A `@uw.edu` email gate simulates UW NetID authentication; any password accepted in demo mode

---

## Design Decisions

### Tech Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend | React 19 + Vite 8 | Fast dev experience, component model maps cleanly to the UI needs (map, modals, toasts, panels) |
| Map | Leaflet 1.9 + react-leaflet 5 | Lightweight, open-source, no API key required for a demo — easy to swap for Mapbox later |
| Real-time | Socket.IO 4 | Handles WebSocket connections with automatic fallback; ideal for broadcasting incidents and distress signals instantly |
| Backend | Node.js + Express 5 | Minimal overhead, fast to iterate on, pairs naturally with Socket.IO |
| Data | In-memory store (demo) | Keeps the demo self-contained with zero infrastructure setup; designed to be swapped for Firebase Firestore |

### Trade-offs

- **In-memory vs. persistent storage** — The demo uses an in-memory array on the server. Incidents reset on server restart. The architecture is intentionally designed so Firestore can be dropped in with minimal changes — the data shape and API contract are already defined.
- **Web-first vs. native mobile** — React web app for speed of iteration and demoing in a browser. The component structure and hooks are written to be portable to React Native (Expo) when the time comes.
- **Bounding box vs. geofencing** — Incident pins are constrained to a rectangular U-District bounding box rather than a precise polygon. This is a deliberate simplification for the demo that can be tightened with a proper GeoJSON boundary later.
- **Client-side heatmap** — The nighttime heatmap grid is computed entirely on the client from the existing `incidents` array. No new server endpoint needed; re-renders reactively on new incidents.
- **Safe Walk is client-owned** — The countdown timer runs in the browser via `setInterval`, storing `startedAt` in `sessionStorage` so the timer stays wall-clock accurate across page refreshes. The server only receives a log entry on expiry.
- **Demo authentication** — A `LoginPage` component gates access with a `@uw.edu` email check; any password is accepted in demo mode. Planned: real UW NetID via Firebase Auth.

### Security & Scalability

- Input validated server-side before any incident is stored or broadcast
- Coordinates clamped to the U-District bounding box — out-of-bounds reports rejected
- 30-minute auto-expiry and crowdsourced confirmation act as a natural spam filter: unconfirmed false reports disappear on their own
- Distress signals stored as incidents and broadcast to all clients — visible on the map immediately
- Socket.IO rooms can scope broadcasts geographically in a future version to reduce noise and improve scalability
- Moving to Firebase Firestore adds persistence, real-time listeners, and horizontal scalability without a major architectural change

---

## Kiro Usage

This project was built using [Kiro](https://kiro.dev), an AI-powered IDE. The `.kiro/` directory is included in this repository to show how Kiro features shaped development.

### Vibe Coding

The initial app — map, incident reporting, real-time sync, UW Alert integration, UWPD modal, Naloxone modal, Help Chat, and demo login — was built through natural language prompting. The full product vision was described conversationally and Kiro scaffolded the project structure, component hierarchy, server, and real-time logic. Subsequent features were added the same way: describe the behavior, Kiro writes it.

### Spec-Driven Development

The three nighttime safety features (Safe Walk Mode, Silent Distress Signal, Nighttime Heatmap) were built from a formal Kiro spec at `.kiro/specs/uw-student-safety-enhancements/`. The spec includes:

- `requirements.md` — 6 user stories with numbered acceptance criteria, a glossary, and 15 formal correctness properties
- `design.md` — architecture diagram, component interfaces, data models, socket event contracts, error handling table, and a full property-based testing strategy using `fast-check`
- `tasks.md` — implementation checklist with requirement traceability, marking which tasks are complete vs. backlog

Writing the spec before implementation forced precise thinking about edge cases (what happens if geolocation is denied? what if the socket is disconnected when a distress signal fires?) that would otherwise have been discovered at runtime.

### Steering Docs

Always-included steering files in `.kiro/steering/` encode project-wide conventions that persist across every session:

- `project-conventions.md` — UW color palette, U-District bounding box coordinates, incident types, UWPD numbers, expiry rules, component patterns
- `architecture.md` — system diagram, component map, API endpoints, Socket.IO events, incident data model

Workspace-level steering files (`tech.md`, `structure.md`, `product.md`) cover the tech stack, file structure, and product overview. Together, these mean Kiro never needs to be re-explained the color palette, bounding box, or API shape — it reads them from the steering files on every session.

### Agent Hooks

Three hooks in `.kiro/hooks/` automate quality checks during development:

- `lint-on-save.json` — runs ESLint whenever a `.jsx` or `.js` file is saved, catching issues immediately without switching context
- `uwpd-safety-check.json` — a `preToolUse` hook that fires before any write to incident-related components, verifying the UWPD prompt behavior is preserved
- `post-task-test.json` — a `postTaskExecution` hook that checks server health and data model consistency after any spec task completes

### MCP (Model Context Protocol)

MCP servers extend Kiro with external tool access. A future integration with a geolocation MCP server would allow Kiro to reason about real geographic data — validating bounding boxes, computing walking distances for proximity alerts, or pulling in live UW Alert feed data — directly within the development workflow.

---

## Learning Journey & Forward Thinking

### Challenges

- **Real-time state sync** — Keeping the incident list consistent across all connected clients required careful thinking about when to use REST (initial load) vs. WebSocket events (live updates). The final pattern — fetch on mount, then listen for `incidents_updated` socket events — is clean but took iteration to get right.
- **Map marker customization** — Leaflet's default icon system doesn't play well with Vite's asset bundling. Getting custom emoji-based div icons to render correctly (and fixing the broken default icon URLs) required working around some Leaflet internals.
- **Safe Walk timer accuracy** — A naive `setInterval` drifts over time. The solution stores `startedAt` in `sessionStorage` and computes `remaining = duration - elapsed` on each tick, so the timer is always wall-clock accurate even after a page refresh.
- **Heatmap nighttime filtering** — The 8 PM–4 AM window crosses midnight, requiring `hour >= 20 || hour < 4` rather than a simple range check.
- **Expiry UX** — Deciding how to communicate incident age and time-to-expiry without cluttering the UI was a design challenge. The current solution (expiry countdown in the side panel, auto-removal after 30 minutes) is minimal but functional.

### Lessons

- Crowdsourced data is only as good as its expiry model. Without the 30-minute auto-remove and confirmation system, the map would quickly fill with stale pins and lose user trust — the same problem that plagues the UW Alert system this app replaces.
- Formal specs (requirements + design + tasks) pay off even for a demo. The correctness properties in the spec caught the midnight-crossing edge case in the heatmap filter before any code was written.
- Starting with a web demo before committing to React Native was the right call. The core logic (hooks, API layer, socket handling) is already portable; the map component is the only piece that needs a native swap.

### Future Plans

- **Focus Group Feedback** — Demo the product to a small subset of UW students before launching so they can give feedback on features, which will then be implemented
- **Firebase Firestore** — Persistent storage so incidents survive server restarts and can be queried historically
- **UW NetID Authentication** — Replace demo login with real UW NetID via Firebase Auth to tie reports to verified students and reduce spam
- **React Native / Expo** — Mobile app with native push notifications (Firebase Cloud Messaging) for proximity alerts
- **Live location tracking** — Opt-in GPS tracking to automatically detect when a user is near an active incident
- **Real UW Alert API integration** — Parse and ingest official UW Alert emails/SMS into the map automatically
- **Walking route safety overlay** — Highlight safer vs. higher-risk walking routes between common origin/destination pairs (housing → campus)
- **Emergency contact SMS** — When Safe Walk expires, actually send an SMS to the emergency contact via Twilio

---
## Demo
### Opening the app: Authentication page
<img width="959" height="564" alt="Authentication page" src="https://github.com/user-attachments/assets/61f108cd-c801-42d4-a14f-55c21370a4e1" />

When you open the app, you will immediately be met with an authentication page. Collecting authentication restricts the map to just UW students/staff, allowing for the map to be more accurate and reliable. Additionally, this allows each user to have a unique profile where information can be stored about them.

### Home page
<img width="959" height="565" alt="Basic landing page" src="https://github.com/user-attachments/assets/d3dc9731-5dfa-4c42-bfac-14396dcd942a" />

### Adding a Pin
Click anywhere on the map, and you can add a pin.
Choose the option from the drop down menu that best describes your situation:

<img width="289" height="278" alt="Report an incident" src="https://github.com/user-attachments/assets/3532d930-75e3-4824-a076-4e78132e1a16" />


If you choose an option where you may need immediate police attention _(Violence, Criminal Activity, or Overdose)_ you will be connected to UWPD contacts to use if you see the emergency fit:

<img width="266" height="302" alt="Call UWPD pop up" src="https://github.com/user-attachments/assets/21a99b04-c717-4b60-9424-d0fe27a3a89f" />

### Profile
Each user has their own profile within the app, where they're able to store information about themselves which can be sent to police officers later on if they are in danger.

<img width="959" height="563" alt="Profile pop up" src="https://github.com/user-attachments/assets/dc019ef2-60e9-4b23-9831-01d2365b37a1" />

### Emergency Contacts
In the profile tab, users can add emergency contacts. These are who will be contacted in case an SOS alert goes off.

<img width="959" height="563" alt="adding emergency contacts" src="https://github.com/user-attachments/assets/d67334d4-980d-49e7-8037-42462e8f4359" />

### Safety Assistant (Chatbot)
If you have a non-emergency situation you are unsure how to navigate, you can use Safety Assistant for help! Give a descriptor of your situation, and Safety Assistant will provide you with phone numbers to contact and a potential route of action. 

<img width="409" height="492" alt="safety assistant" src="https://github.com/user-attachments/assets/e53c277f-6c75-481d-91a4-16203c9b7acf" />
<img width="278" height="212" alt="routes of action 2" src="https://github.com/user-attachments/assets/a9b6a8ad-a928-4d7c-a5d2-c77fad430e20" />

#### Safety Assistant is programmed to help with __identity-specific safety concerns__ as well. 
If you specify your identity _(gender, race, etc.)_, Safety Assistant will provide you with __identity-specific emergency numbers__ to call. For example, if you specify you are a woman, Safety Assistant provides you with the number of the nearby Women's Center too.

<img width="281" height="400" alt="Safety assistant woman p1" src="https://github.com/user-attachments/assets/4f4b9a3b-a74c-48c1-83c3-ce6d2f317a13" />
<img width="277" height="398" alt="Safety assistant woman p2" src="https://github.com/user-attachments/assets/13611c83-5fbb-4206-be7a-94ca154ef33d" />


### Heatmap
<img width="959" height="503" alt="Heatmap demo" src="https://github.com/user-attachments/assets/e99481f2-9f73-4c09-9f08-a624923d4345" />

### SafeWalk
<img width="959" height="502" alt="Safewalk arrow" src="https://github.com/user-attachments/assets/9eb983d0-93bc-4c13-9ef5-2249619e4ede" />

---

## Video Demo

Find the video demo here: https://youtu.be/7VJ4ZPGkkCw

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

## Project Structure

```
uw-safety-map/
├── .kiro/
│   ├── hooks/              # Agent hooks (lint-on-save, UWPD guard, post-task check)
│   ├── specs/
│   │   └── uw-student-safety-enhancements/  # Requirements, design, tasks for nighttime features
│   └── steering/           # Always-included project conventions and architecture docs
├── client/
│   └── src/
│       ├── components/     # SafetyMap, Header, ReportModal, IncidentPanel,
│       │                   # NotificationToast, UWAlertSimulator, UWPDModal,
│       │                   # NaloxoneModal, HelpChat, SafeWalkPanel,
│       │                   # SilentDistressButton, NighttimeHeatmap, LoginPage
│       ├── hooks/          # useSocket, useIncidents, useSafeWalk, useDistressSignal
│       ├── utils/          # chatbot.js, heatmap.js
│       └── constants.js    # Bounding box, colors, incident types, heatmap config
└── server/
    └── index.js            # Express + Socket.IO, incident store, distress handler, safe walk log
```
