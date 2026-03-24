# Tech Stack

## Frontend (`client/`)

- React 19 + Vite 8
- react-leaflet 5 + Leaflet 1.9 — map rendering
- socket.io-client 4 — real-time WebSocket connection
- date-fns 4 — timestamp formatting
- ESLint 9 with react-hooks and react-refresh plugins

## Backend (`server/`)

- Node.js + Express 5 (CommonJS)
- socket.io 4 — WebSocket server
- uuid — incident ID generation
- cors — cross-origin support
- In-memory array as data store (no database)

## Common Commands

### Client
```bash
cd uw-safety-map/client
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build
```

### Server
```bash
cd uw-safety-map/server
npm install
npm start         # node index.js, runs on http://localhost:3001
npm run dev       # node --watch index.js (auto-restart on changes)
```

## Ports

- Client: `http://localhost:5173` (or 5174 if taken)
- Server: `http://localhost:3001`
- `API_URL` is hardcoded in `client/src/constants.js`

## Key Conventions

- Client uses ES modules (`"type": "module"`)
- Server uses CommonJS (`"type": "commonjs"`) — use `require()`, not `import`
- Leaflet default icon URLs must be patched manually due to Vite bundler incompatibility (see `SafetyMap.jsx`)
- All map constants (bounds, center, incident types/colors/icons) live in `constants.js` — do not hardcode them elsewhere
