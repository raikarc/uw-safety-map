# Requirements Document

## Introduction

This feature set deepens the UW Safety Map's focus on nighttime safety for UW students. The current app provides real-time incident reporting and proximity alerts, but lacks features that address the specific emotional and practical gap students feel when navigating campus and the U-District after dark. These enhancements target three core student needs: knowing whether it's safe to walk a specific route right now, having a quick way to signal distress without making a call, and getting a clearer picture of how dangerous a given area actually is at night.

The three features are:
1. **Safe Walk Mode** — a timed, opt-in session where the app monitors a student's walk and alerts a contact if they don't check in
2. **Silent Distress Signal** — a discreet, one-tap way to share location and trigger a notification to UWPD or a trusted contact without speaking
3. **Nighttime Heatmap** — an overlay showing historical incident density by time of day, so students can make informed routing decisions

---

## Glossary

- **App**: The UW Safety Map React web application
- **Safe_Walk_Session**: A timed check-in session initiated by a student to monitor a walk from point A to point B
- **Check_In_Timer**: The countdown timer within a Safe Walk Session that the student must reset before it reaches zero
- **Emergency_Contact**: A phone number or email address the student provides to receive alerts if a Safe Walk Session expires without check-in
- **Distress_Signal**: A silent, one-tap alert that shares the student's last known location and triggers a notification
- **Heatmap**: A color-coded map overlay showing incident density across the U-District bounding box
- **Heatmap_Cell**: A discrete geographic cell within the Heatmap overlay, colored by incident density
- **Nighttime_Window**: The time range from 8:00 PM to 4:00 AM local time
- **Incident_Store**: The server-side in-memory array of active incidents
- **Server**: The Node.js + Express + Socket.IO backend at `localhost:3001`
- **Socket**: The Socket.IO WebSocket connection between the App and the Server
- **UWPD**: University of Washington Police Department

---

## Requirements

### Requirement 1: Safe Walk Mode — Session Initiation

**User Story:** As a UW student walking home at night, I want to start a timed safe walk session so that someone is automatically alerted if I don't make it home safely.

#### Acceptance Criteria

1. THE App SHALL provide a "Safe Walk" button accessible from the main map view at all times.
2. WHEN a student activates Safe Walk Mode, THE App SHALL prompt the student to enter a walk duration between 1 and 60 minutes.
3. WHEN a student activates Safe Walk Mode, THE App SHALL prompt the student to enter at least one Emergency Contact (phone number or email).
4. WHEN the student submits a valid duration and at least one Emergency Contact, THE App SHALL start a Check_In_Timer counting down from the selected duration.
5. WHILE a Safe_Walk_Session is active, THE App SHALL display the remaining Check_In_Timer prominently on screen.
6. WHILE a Safe_Walk_Session is active, THE App SHALL display a "I'm Safe" check-in button that resets the Check_In_Timer to the original duration.
7. IF the student enters a duration less than 1 minute or greater than 60 minutes, THEN THE App SHALL display a validation error and prevent session start.
8. IF the student submits the Safe Walk form with no Emergency Contact provided, THEN THE App SHALL display a validation error and prevent session start.

---

### Requirement 2: Safe Walk Mode — Expiry and Alert

**User Story:** As a UW student, I want the app to automatically alert my emergency contact if I don't check in, so that help is triggered without me needing to do anything.

#### Acceptance Criteria

1. WHEN the Check_In_Timer reaches zero without a student check-in, THE App SHALL immediately display a full-screen alert notifying the student that the session has expired.
2. WHEN the Check_In_Timer reaches zero without a student check-in, THE Server SHALL log the expired session with the student's last known location and the Emergency Contact details.
3. WHEN the Check_In_Timer reaches zero without a student check-in, THE App SHALL display the UWPD emergency number (206-685-1800) and instruct the student to call if they are in danger.
4. WHEN the student taps "I'm Safe" before the Check_In_Timer reaches zero, THE App SHALL reset the Check_In_Timer to the original duration and dismiss any expiry warning.
5. WHEN the student taps "End Walk" during an active session, THE App SHALL immediately end the Safe_Walk_Session and dismiss the Check_In_Timer UI.
6. IF the Check_In_Timer drops below 60 seconds, THEN THE App SHALL change the timer display to a high-urgency visual state (red color, pulsing animation) to prompt the student to check in.

---

### Requirement 3: Safe Walk Mode — Session Persistence

**User Story:** As a UW student, I want my safe walk session to survive accidental page refreshes so that a brief navigation mistake doesn't silently cancel my safety net.

#### Acceptance Criteria

1. WHEN a Safe_Walk_Session is started, THE App SHALL persist the session state (duration, start time, Emergency Contact) to browser `sessionStorage`.
2. WHEN the App is loaded and a Safe_Walk_Session exists in `sessionStorage` with time remaining, THE App SHALL automatically resume the session and restore the Check_In_Timer.
3. WHEN a Safe_Walk_Session ends (either by check-in expiry or manual "End Walk"), THE App SHALL clear the session state from `sessionStorage`.

---

### Requirement 4: Silent Distress Signal

**User Story:** As a UW student in a situation where I cannot safely make a phone call, I want to send a silent distress signal so that my location is shared and help can be directed to me.

#### Acceptance Criteria

1. THE App SHALL provide a "Silent Alert" button accessible from the main map view at all times.
2. WHEN the student taps "Silent Alert", THE App SHALL display a confirmation prompt with a 3-second countdown before sending, to prevent accidental activation.
3. WHEN the student confirms the Silent Alert (or the 3-second countdown completes without cancellation), THE App SHALL emit a `distress_signal` Socket event to the Server containing the student's last known browser geolocation coordinates, or the current map center if geolocation is unavailable.
4. WHEN the Server receives a `distress_signal` event, THE Server SHALL broadcast a `distress_alert` Socket event to all connected clients containing the signal location and a timestamp.
5. WHEN a `distress_alert` event is received, THE App SHALL display a high-priority notification toast identifying the signal as a student distress alert and showing the location.
6. WHEN the student confirms the Silent Alert, THE App SHALL display the UWPD emergency number (206-685-1800) and the Crisis Text Line (text HOME to 741741) on screen.
7. IF the student taps "Cancel" during the 3-second countdown, THEN THE App SHALL cancel the distress signal without sending any event.
8. WHEN the Server receives a `distress_signal` event, THE Server SHALL store the signal as a special incident with type `'Distress Signal'` in the Incident_Store, visible on the map to all connected clients.

---

### Requirement 5: Nighttime Heatmap Overlay

**User Story:** As a UW student planning a late-night walk, I want to see where incidents have historically clustered at night so that I can choose a safer route.

#### Acceptance Criteria

1. THE App SHALL provide a "Heatmap" toggle button accessible from the main map view.
2. WHEN the student activates the Heatmap toggle, THE App SHALL render a Heatmap overlay on the map using the current Incident_Store data.
3. WHILE the Heatmap is active, THE App SHALL color each Heatmap_Cell according to incident density: low density in green, medium density in amber, high density in red.
4. WHILE the Heatmap is active, THE App SHALL filter Heatmap data to show only incidents that occurred during the Nighttime_Window (8:00 PM – 4:00 AM local time).
5. WHILE the Heatmap is active and a new incident is reported, THE App SHALL update the Heatmap overlay to reflect the new incident without requiring a page reload.
6. WHEN the student deactivates the Heatmap toggle, THE App SHALL remove the Heatmap overlay and return to the standard incident pin view.
7. IF the Incident_Store contains fewer than 3 incidents within the Nighttime_Window, THEN THE App SHALL display an informational message stating that there is insufficient nighttime data to render a meaningful heatmap.
8. WHILE the Heatmap is active, THE App SHALL continue to display active incident pins on top of the Heatmap overlay so both views are visible simultaneously.

---

### Requirement 6: Heatmap Data Granularity and Legend

**User Story:** As a UW student reading the heatmap, I want to understand what the colors mean and how current the data is so that I can trust the information I'm seeing.

#### Acceptance Criteria

1. WHILE the Heatmap is active, THE App SHALL display a legend showing the color-to-density mapping (green = low, amber = medium, red = high).
2. WHILE the Heatmap is active, THE App SHALL display the total number of nighttime incidents used to generate the overlay.
3. THE Heatmap SHALL divide the U-District bounding box into a grid of cells no larger than 0.002 degrees latitude × 0.002 degrees longitude each.
4. WHEN the student hovers over or taps a Heatmap_Cell, THE App SHALL display a tooltip showing the incident count for that cell.
