const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

let incidents = [];
const EXPIRY_MS = 30 * 60 * 1000;

function pruneExpired() {
  const before = incidents.length;
  incidents = incidents.filter(i => !i.expiresAt || Date.now() <= i.expiresAt);
  if (incidents.length !== before) io.emit('incidents_updated', incidents);
}
setInterval(pruneExpired, 60 * 1000);

function seedDemoData() {
  const demo = [
    { lat: 47.6553, lng: -122.3035, type: 'Police Presence', source: 'uw_alert', description: 'UW Alert: Police activity near HUB' },
    { lat: 47.6580, lng: -122.3150, type: 'Criminal Activity', source: 'user', description: 'Reported suspicious activity' },
    { lat: 47.6620, lng: -122.3100, type: 'Violence', source: 'user', description: 'Reported altercation' },
  ];
  demo.forEach(d => incidents.push({
    id: uuidv4(), ...d,
    timestamp: Date.now(), expiresAt: Date.now() + EXPIRY_MS,
    confirmations: 0, active: true,
  }));
}
seedDemoData();

// ── REST endpoints ────────────────────────────────────────────

app.get('/api/incidents', (_req, res) => {
  pruneExpired();
  res.json(incidents);
});

app.post('/api/incidents', (req, res) => {
  const { lat, lng, type, description, source } = req.body;
  if (!lat || !lng || !type) return res.status(400).json({ error: 'Missing fields' });
  const incident = {
    id: uuidv4(),
    lat: parseFloat(lat), lng: parseFloat(lng),
    type, description: description || '',
    source: source || 'user',
    timestamp: Date.now(), expiresAt: Date.now() + EXPIRY_MS,
    confirmations: 0, active: true,
  };
  incidents.push(incident);
  io.emit('new_incident', incident);
  io.emit('incidents_updated', incidents);
  res.status(201).json(incident);
});

app.post('/api/incidents/:id/confirm', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Not found' });
  incident.confirmations += 1;
  incident.expiresAt = Date.now() + EXPIRY_MS;
  io.emit('incidents_updated', incidents);
  res.json(incident);
});

app.post('/api/incidents/:id/resolve', (req, res) => {
  incidents = incidents.filter(i => i.id !== req.params.id);
  io.emit('incidents_updated', incidents);
  res.json({ success: true });
});

app.post('/api/uw-alert', (req, res) => {
  const { lat, lng, type, description } = req.body;
  const incident = {
    id: uuidv4(),
    lat: parseFloat(lat), lng: parseFloat(lng),
    type: type || 'Police Presence',
    description: description || 'UW Alert: Incident reported on campus',
    source: 'uw_alert',
    timestamp: Date.now(), expiresAt: Date.now() + EXPIRY_MS,
    confirmations: 0, active: true,
  };
  incidents.push(incident);
  io.emit('new_incident', incident);
  io.emit('uw_alert', incident);
  io.emit('incidents_updated', incidents);
  res.status(201).json(incident);
});

// Safe Walk expired session log
app.post('/api/safe-walk/expired', (req, res) => {
  const { contact, expiredAt } = req.body;
  console.log(`[SafeWalk] Session expired — contact: ${contact}, at: ${new Date(expiredAt).toISOString()}`);
  res.json({ received: true });
});

// ── Socket.IO ─────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('incidents_updated', incidents);

  // Silent distress signal
  socket.on('distress_signal', ({ lat, lng, timestamp }) => {
    const incident = {
      id: uuidv4(),
      lat: parseFloat(lat), lng: parseFloat(lng),
      type: 'Distress Signal',
      description: 'Silent distress signal from student',
      source: 'distress',
      timestamp: timestamp || Date.now(),
      expiresAt: Date.now() + EXPIRY_MS,
      confirmations: 0, active: true,
    };
    incidents.push(incident);
    io.emit('distress_alert', incident);
    io.emit('incidents_updated', incidents);
    console.log(`[Distress] Signal received at ${lat}, ${lng}`);
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
