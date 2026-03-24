# Implementation Plan: UW Student Safety Enhancements

## Overview

Implement three nighttime safety features — Safe Walk Mode, Silent Distress Signal, and Nighttime Heatmap — as additive extensions to the existing React + Socket.IO + Express architecture. All new state lives in `App.jsx` and flows down as props; each new component has a co-located CSS file; the server stays a single CommonJS `index.js`.

## Tasks

- [x] 1. Extend constants and shared types
  - Add `HEATMAP_CELL_SIZE`, `NIGHTTIME_START_HOUR`, `NIGHTTIME_END_HOUR`, and `DISTRESS_SIGNAL_TYPE` to `client/src/constants.js`
  - Add `'Distress Signal'` to `INCIDENT_TYPES`, `INCIDENT_COLORS` (use `#d32f2f`), and `INCIDENT_ICONS` (use `🆘`) in `constants.js`
  - _Requirements: 4.8, 5.2, 5.3, 6.3_

- [x] 2. Implement `useSafeWalk` hook
  - [x] 2.1 Create `client/src/hooks/useSafeWalk.js`
    - Manage phase state: `'idle' | 'setup' | 'active' | 'expired'`
    - Implement `startSession(durationMinutes, contact)` with validation: reject duration < 1 or > 60 (Property 10), reject empty/whitespace contact (Property 11); keep phase `'idle'` on error
    - Implement countdown via `setInterval` stored in `useRef`; clamp `remaining` to `[0, duration]` (Property 1)
    - Implement `checkIn()` — resets `remaining` to original duration (Property 2)
    - Implement `endSession()` — clears interval, clears `sessionStorage`, sets phase to `'idle'`
    - Persist session to `sessionStorage` key `uw_safe_walk_session` on start; clear on end or expiry (Properties 3, 4)
    - On mount, read `sessionStorage`; if entry exists and `remaining > 0`, resume session; otherwise treat as expired
    - On expiry (remaining reaches 0), set phase to `'expired'`, clear `sessionStorage`, call optional `onExpired` callback
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.4, 2.5, 3.1, 3.2, 3.3_

  - [ ]* 2.2 Write property test for `useSafeWalk` — timer bounded (Property 1)
    - **Property 1: Safe Walk timer is bounded by duration**
    - **Validates: Requirements 1.4, 1.5**
    - Use `fast-check` to generate random durations (1–3600 s) and elapsed times; assert `0 ≤ remaining ≤ duration`

  - [ ]* 2.3 Write property test for `useSafeWalk` — check-in resets timer (Property 2)
    - **Property 2: Check-in resets timer to full duration**
    - **Validates: Requirements 2.4**
    - Generate random sessions with arbitrary remaining time; call `checkIn()`; assert `remaining === originalDuration`

  - [ ]* 2.4 Write property test for `useSafeWalk` — sessionStorage round-trip (Property 3)
    - **Property 3: sessionStorage round-trip preserves session state**
    - **Validates: Requirements 3.1, 3.2**
    - Generate random session objects; serialize → deserialize; assert computed `remaining` matches expected within 1 s tolerance

  - [ ]* 2.5 Write property test for `useSafeWalk` — session cleared on end (Property 4)
    - **Property 4: Ended session is cleared from sessionStorage**
    - **Validates: Requirements 3.3**
    - Generate sessions; call `endSession()` or simulate expiry; assert `sessionStorage` key absent

  - [ ]* 2.6 Write property test for `useSafeWalk` — duration validation (Property 10)
    - **Property 10: Duration validation rejects out-of-range values**
    - **Validates: Requirements 1.7**
    - Generate durations < 1 or > 60; assert validation error returned and phase stays `'idle'`

  - [ ]* 2.7 Write property test for `useSafeWalk` — contact validation (Property 11)
    - **Property 11: Contact validation rejects empty or whitespace-only strings**
    - **Validates: Requirements 1.8**
    - Generate empty/whitespace strings; assert validation error returned and phase stays `'idle'`

- [x] 3. Implement `SafeWalkPanel` component
  - [x] 3.1 Create `client/src/components/SafeWalkPanel.jsx` and `SafeWalkPanel.css`
    - Wire to `useSafeWalk` hook internally
    - Render idle state: "Safe Walk" activation button (Requirement 1.1)
    - Render setup state: form with duration input (1–60 min) and emergency contact input; inline validation errors for bad inputs (Requirements 1.2, 1.3, 1.7, 1.8)
    - Render active state: prominent countdown display; apply urgency CSS class (red + pulsing) when `remaining < 60` (Property 14, Requirement 2.6); "I'm Safe" check-in button (Requirement 1.6); "End Walk" button (Requirement 2.5)
    - Render expired state: full-screen alert overlay showing UWPD number 206-685-1800 and instruction to call if in danger (Requirements 2.1, 2.3); call `POST /api/safe-walk/expired` with `{ contact, expiredAt }` on expiry (Requirement 2.2)
    - _Requirements: 1.1–1.8, 2.1–2.6, 3.1–3.3_

  - [ ]* 3.2 Write property test for `SafeWalkPanel` — urgency state below 60 s (Property 14)
    - **Property 14: Timer urgency state activates below 60 seconds**
    - **Validates: Requirements 2.6**
    - Generate sessions with `remaining < 60`; assert urgency CSS class is applied to timer display element

  - [ ]* 3.3 Write unit tests for `SafeWalkPanel`
    - Setup form renders inline validation errors for inputs `0`, `61`, `""`
    - `useSafeWalk` resumes correctly from a pre-populated `sessionStorage` entry
    - _Requirements: 1.7, 1.8, 3.2_

- [x] 4. Implement `useDistressSignal` hook
  - [x] 4.1 Create `client/src/hooks/useDistressSignal.js`
    - Manage phase: `'idle' | 'countdown' | 'sent'`
    - `initiate()` — sets phase to `'countdown'`, starts 3-second interval decrementing `countdown` from 3
    - When countdown reaches 0: emit `distress_signal` over socket with `{ lat, lng, timestamp }`; use browser geolocation if available, fall back to `mapCenter` (Requirement 4.3)
    - `cancel()` — if phase is `'countdown'`, clear interval, reset to `'idle'` without emitting (Property 5, Requirement 4.7)
    - On socket disconnect at send time: show error; do not silently fail (design error handling)
    - _Requirements: 4.2, 4.3, 4.7_

  - [ ]* 4.2 Write property test for `useDistressSignal` — cancel prevents emit (Property 5)
    - **Property 5: Cancelling distress countdown prevents socket emit**
    - **Validates: Requirements 4.7**
    - Generate cancel calls at random times (0–2999 ms into countdown); assert no `distress_signal` socket emit occurred and phase returns to `'idle'`

- [x] 5. Implement `SilentDistressButton` component
  - [x] 5.1 Create `client/src/components/SilentDistressButton.jsx` and `SilentDistressButton.css`
    - Props: `{ socket, userLocation, mapCenter }`
    - Wire to `useDistressSignal` hook
    - Render persistent "Silent Alert" button visible at all times on map view (Requirement 4.1)
    - Render countdown overlay (3 → 2 → 1) with Cancel button during `'countdown'` phase (Requirement 4.2)
    - On `'sent'` phase: display UWPD number 206-685-1800 and Crisis Text Line "text HOME to 741741" (Requirement 4.6)
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7_

  - [ ]* 5.2 Write unit test for `SilentDistressButton` countdown
    - Assert countdown renders 3 → 2 → 1 → sends using fake timers
    - _Requirements: 4.2, 4.3_

- [ ] 6. Add server-side distress signal and safe walk endpoints
  - [x] 6.1 Extend `server/index.js` with distress signal socket handler and safe walk endpoint
    - In `io.on('connection')`: add `socket.on('distress_signal', handler)` — create distress incident with `type: 'Distress Signal'`, `source: 'distress'`, store in `incidents[]`, emit `distress_alert` to all clients, emit `incidents_updated` (Property 6, Requirements 4.4, 4.8)
    - Add `POST /api/safe-walk/expired` endpoint — accept `{ contact, lat, lng, expiredAt }`, log to console, return `200 { received: true }` (Requirement 2.2)
    - _Requirements: 2.2, 4.4, 4.8_

  - [ ]* 6.2 Write property test for server distress broadcast and storage (Property 6)
    - **Property 6: Distress signal is broadcast and stored**
    - **Validates: Requirements 4.4, 4.8**
    - Generate random coordinates; assert server emits `distress_alert`, emits `incidents_updated`, and `incidents[]` contains entry with `type === 'Distress Signal'` and matching coordinates

- [~] 7. Checkpoint — Safe Walk and Distress Signal wired end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [~] 8. Implement heatmap grid utility
  - [~] 8.1 Create `client/src/utils/heatmap.js`
    - Export `computeGrid(incidents)` — filters incidents to Nighttime_Window using `NIGHTTIME_START_HOUR` / `NIGHTTIME_END_HOUR` from `constants.js` (Property 7, Requirement 5.4); divides `UW_BOUNDS` into cells of `HEATMAP_CELL_SIZE` degrees; counts incidents per cell (Property 8); returns array of `{ bounds, count }` objects
    - Export `getCellColor(count)` — returns `'#4caf50'` for 1–2, `'#ff9800'` for 3–5, `'#e53935'` for 6+, `null` for 0 (Property 12, Requirement 5.3)
    - Each cell's lat/lng span must be ≤ `HEATMAP_CELL_SIZE` (Property 13)
    - _Requirements: 5.2, 5.3, 5.4, 6.2, 6.3_

  - [ ]* 8.2 Write property test for heatmap nighttime filter (Property 7)
    - **Property 7: Heatmap filters to nighttime incidents only**
    - **Validates: Requirements 5.4, 6.2**
    - Generate incidents with random timestamps; assert sum of all cell counts equals count of incidents with local hour in [20,23] ∪ [0,3]

  - [ ]* 8.3 Write property test for heatmap cell count sum (Property 8)
    - **Property 8: Each nighttime incident is counted in exactly one cell**
    - **Validates: Requirements 5.2, 6.3**
    - Generate random nighttime incident sets; assert `sum(cellCounts) === nighttimeIncidents.length`

  - [ ]* 8.4 Write property test for heatmap live update (Property 9)
    - **Property 9: New nighttime incident increments the correct cell**
    - **Validates: Requirements 5.5**
    - Generate heatmap state + one new nighttime incident; assert target cell count increments by exactly 1, all other cells unchanged

  - [ ]* 8.5 Write property test for cell color mapping (Property 12)
    - **Property 12: Heatmap cell color matches density bucket**
    - **Validates: Requirements 5.3**
    - Generate cells with random counts; assert `getCellColor` returns correct color per density bucket

  - [ ]* 8.6 Write property test for cell size invariant (Property 13)
    - **Property 13: Heatmap cell dimensions do not exceed 0.002 degrees**
    - **Validates: Requirements 6.3**
    - Assert every cell in `computeGrid` output has lat span ≤ 0.002 and lng span ≤ 0.002

- [~] 9. Implement `NighttimeHeatmap` component
  - [~] 9.1 Create `client/src/components/NighttimeHeatmap.jsx` and `NighttimeHeatmap.css`
    - Props: `{ incidents, active }`
    - Render inside `<MapContainer>` (as a Leaflet layer child) — use `<Rectangle>` from `react-leaflet` for each non-empty cell returned by `computeGrid`
    - Each `<Rectangle>` uses `getCellColor` for fill; renders a `<Tooltip>` showing incident count on hover/tap (Requirement 6.4)
    - When `active` and nighttime incident count < 3: render informational message instead of cells (Requirement 5.7)
    - Render legend showing green/amber/red color bands with labels (Requirement 6.1)
    - Render total nighttime incident count (Requirement 6.2)
    - Re-renders reactively when `incidents` prop changes (Requirement 5.5)
    - _Requirements: 5.2, 5.3, 5.5, 5.7, 5.8, 6.1, 6.2, 6.4_

  - [ ]* 9.2 Write property test for incident pins visible with heatmap (Property 15)
    - **Property 15: Incident pins remain visible while heatmap is active**
    - **Validates: Requirements 5.8**
    - Generate incident sets with heatmap active; assert incident marker elements are present in render output alongside heatmap rectangles

  - [ ]* 9.3 Write unit tests for `NighttimeHeatmap`
    - Heatmap shows informational message when nighttime incident count < 3
    - Legend renders all three color bands (green, amber, red)
    - Cell tooltip shows correct count on hover
    - _Requirements: 5.7, 6.1, 6.4_

- [~] 10. Wire all new features into `App.jsx`, `SafetyMap.jsx`, and `Header.jsx`
  - [~] 10.1 Update `App.jsx`
    - Import and mount `SafeWalkPanel` and `SilentDistressButton`; pass `socket`, `userLocation`, and `mapCenter` to `SilentDistressButton`
    - Add `heatmapActive` boolean state; pass to `SafetyMap` and `Header`
    - Listen for `distress_alert` socket event; call `addNotification` with `isAlert: true` and a high-priority flag (Requirement 4.5)
    - _Requirements: 4.5, 5.1, 5.6_

  - [~] 10.2 Update `SafetyMap.jsx`
    - Accept `heatmapActive` and `incidents` props (already has `incidents`)
    - Render `<NighttimeHeatmap incidents={incidents} active={heatmapActive} />` inside `<MapContainer>` when `heatmapActive` is true
    - Ensure existing incident `<Marker>` elements remain rendered when heatmap is active (Requirement 5.8)
    - _Requirements: 5.2, 5.5, 5.6, 5.8_

  - [~] 10.3 Update `Header.jsx`
    - Accept `heatmapActive` and `onHeatmapToggle` props
    - Add "Heatmap" toggle button that calls `onHeatmapToggle`; visually indicate active state (Requirement 5.1)
    - _Requirements: 5.1, 5.6_

  - [ ]* 10.4 Write unit test for distress alert notification
    - Assert `distress_alert` socket event triggers a high-priority notification toast in `App.jsx`
    - _Requirements: 4.5_

- [~] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [~] 12. Update root README
  - Modify `README.md` at the workspace root to reflect the new Kiro spec workflow usage for this feature, in a style consistent with the rest of that file
  - _Not a requirements item — project documentation_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` + `vitest`; run with `vitest --run` from `client/`
- Server stays CommonJS (`require()`); client stays ES modules (`import`)
- All map/heatmap constants must come from `constants.js` — no hardcoded values in components
