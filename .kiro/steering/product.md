# UW Safety Map — Product Overview

A live, crowdsourced safety map for the University of Washington campus and surrounding U-District. Students can report incidents, view real-time pins on a map, and receive proximity notifications about nearby safety events.

## Core Features

- **Incident reporting** — Users click the map to drop a pin, select a type (Police Presence, Criminal Activity, Violence, Overdose), and optionally add a description
- **Real-time updates** — All connected clients receive new incidents instantly via WebSocket
- **Crowdsourced expiry** — Incidents auto-expire after 30 minutes; nearby users can confirm an incident is still active to reset the timer
- **UW Alert integration** — Official UW Alerts are ingested as distinct pins (source: `uw_alert`) with a "UW" badge
- **Proximity notifications** — In-app toast alerts when new incidents are reported
- **UWPD quick contact** — Modal with UWPD emergency (206-685-1800) and non-emergency (206-685-4973) lines, triggered automatically on Violence/Criminal Activity reports
- **Naloxone modal** — Triggered automatically on Overdose reports
- **Help chat** — AI-powered safety assistant

## Geographic Scope

Constrained to the U-District bounding box:
- North: 47.670, South: 47.648, East: -122.290, West: -122.325
- Center: [47.6553, -122.3035]
- Reports outside this box are rejected server-side

## Incident Types & Colors

| Type | Color | Icon |
|---|---|---|
| Police Presence | `#4b9cd3` (blue) | 🚔 |
| Criminal Activity | `#e8a000` (amber) | ⚠️ |
| Violence | `#e53935` (red) | 🚨 |
| Overdose | `#ab47bc` (purple) | 🚑 |

## UW Brand Colors

- Purple: `#4b2e83`
- Gold: `#b7a57a`

## Current Limitations (Demo)

- In-memory incident store — resets on server restart (designed to swap for Firebase Firestore)
- No authentication — anonymous reporting (planned: UW NetID via Firebase Auth)
- Web-only — React Native/Expo port is planned
