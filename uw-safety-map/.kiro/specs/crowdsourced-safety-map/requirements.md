# Spec: Crowdsourced Safety Map

## Overview
A live, crowdsourced safety map for UW students covering the U-District area. Students can report unsafe incidents, see real-time updates from other users and official UW Alerts, and get proximity-based notifications.

## Requirements

### REQ-1: Incident Reporting
**User Story:** As a UW student, I want to drop a pin on the map at a location where I witnessed an unsafe incident, so that other students nearby are aware.

**Acceptance Criteria:**
- User can click anywhere within the U-District bounding box to place a pin
- A modal appears prompting the user to select an incident type (Police Presence, Criminal Activity, Violence) and optionally add a description
- Clicking outside the bounding box does nothing
- On submission, the pin appears on the map for all connected users immediately

### REQ-2: UWPD Contact Prompt
**User Story:** As a student reporting a serious incident, I want to be prompted to contact UWPD so I can quickly reach help if needed.

**Acceptance Criteria:**
- After submitting a report of type `Violence` or `Criminal Activity`, a modal appears asking "Call UWPD?"
- Modal presents three options: Emergency Line (206-685-1800), Non-Emergency Line (206-685-4973), No thanks
- Tapping a phone number opens the device dialer
- Modal does NOT appear for `Police Presence` reports

### REQ-3: UW Alert Integration
**User Story:** As a student, I want official UW Alerts to appear on the map automatically so I can see where campus emergencies are happening.

**Acceptance Criteria:**
- A UW Alert incident can be submitted via POST `/api/uw-alert`
- UW Alert pins are visually distinct from user-reported pins (pulsing animation, gold "UW" badge)
- A toast notification is triggered for all connected clients when a UW Alert arrives
- The UW Alert Simulator in the header allows demo/testing of this flow

### REQ-4: Real-Time Updates
**User Story:** As a student viewing the map, I want to see new incidents appear without refreshing the page.

**Acceptance Criteria:**
- New incidents broadcast to all connected clients via Socket.IO `incidents_updated` event
- Map markers update within 1 second of a report being submitted
- Connection status (Live / Offline) is visible in the header

### REQ-5: Crowdsourced Expiry
**User Story:** As a student, I want the map to stay accurate so I'm not misled by stale incidents.

**Acceptance Criteria:**
- All incidents expire automatically after 30 minutes with no confirmation
- Any user can click a pin and confirm "Still happening" — this resets the 30-minute timer
- Any user can mark an incident as "Resolved" to remove it immediately
- Server prunes expired incidents every 60 seconds and broadcasts the updated list

### REQ-6: Proximity Notifications
**User Story:** As a student near an active incident, I want to be notified so I can make informed decisions about my route.

**Acceptance Criteria:**
- When a new incident is reported, connected users receive a toast notification
- The toast includes the incident type, description, and a "Is this still happening?" confirmation prompt
- UW Alert toasts are visually distinct (gold border, "UW Alert" badge)
- Toasts auto-dismiss after 6 seconds
