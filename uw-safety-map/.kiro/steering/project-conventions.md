---
inclusion: always
---

# UW Safety Map — Project Conventions

## Color Palette
- Primary purple: `#4b2e83` (UW brand purple)
- Gold accent: `#b7a57a` (UW brand gold)
- Dark background: `#1a0a2e`
- Card/panel background: `#2d1b4e`
- Muted text: `#9e8fc0`
- Light text: `#d4c5f0`

## U-District Bounding Box
```js
north: 47.670
south: 47.648
east:  -122.290
west:  -122.325
center: [47.6553, -122.3035]
```
All incident pins must fall within this bounding box. Reject any coordinates outside it.

## Incident Types
The only valid incident types are:
- `Police Presence` — color `#4b9cd3`
- `Criminal Activity` — color `#e8a000`
- `Violence` — color `#e53935`

## UWPD Contact Numbers
- Emergency: `206-685-1800`
- Non-emergency: `206-685-4973`

Prompt the user to call UWPD any time they report `Violence` or `Criminal Activity`.

## Incident Expiry
- All incidents expire after **30 minutes** if not confirmed
- Confirming an incident resets the 30-minute timer
- Auto-prune runs every 60 seconds on the server

## Component Conventions
- All modals use `.modal-overlay` + `.modal` CSS classes from `Modal.css`
- All buttons follow `.btn-primary` / `.btn-secondary` patterns
- CSS files are co-located with their component (e.g. `Header.jsx` + `Header.css`)

## API Base URL
`http://localhost:3001` — stored in `client/src/constants.js` as `API_URL`
