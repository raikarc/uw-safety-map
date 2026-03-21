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

// In-memory store for demo
let incidents = [];

// Auto-expire incidents after 30 minutes if not confirmed
const EXPIRY_MS = 30 * 60 * 1000;

function pruneExpired() {
  const now = Date.now();
  const before = incidents.length;
  incidents = incidents.filter(i => {
    if (i.expiresAt && now > i.expiresAt) return false;
    return true;
  });
  if (incidents.length !== before) {
    io.emit('incidents_updated', incidents);
  }
}
setInterval(pruneExpired, 60 * 1000);

// Seed some demo incidents
function seedDemoData() {
  const types = ['Police Presence', 'Criminal Activity', 'Violence'];
  const sources = ['user', 'uw_alert'];
  const demoIncidents = [
    { lat: 47.6553, lng: -122.3035, type: 'Police Presence', source: 'uw_alert', description: 'UW Alert: Police activity near HUB' },
    { lat: 47.6580, lng: -122.3150, type: 'Criminal Activity', source: 'user', description: 'Reported suspicious activity' },
    { lat: 47.6620, lng: -122.3100, type: 'Violence', source: 'user', description: 'Reported altercation' },
  ];
  demoIncidents.forEach(d => {
    incidents.push({
      id: uuidv4(),
      ...d,
      timestamp: Date.now(),
      expiresAt: Date.now() + EXPIRY_MS,
      confirmations: 0,
      active: true,
    });
  });
}
seedDemoData();

// REST endpoints
app.get('/api/incidents', (req, res) => {
  pruneExpired();
  res.json(incidents);
});

app.post('/api/incidents', (req, res) => {
  const { lat, lng, type, description, source } = req.body;
  if (!lat || !lng || !type) return res.status(400).json({ error: 'Missing fields' });

  const incident = {
    id: uuidv4(),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    type,
    description: description || '',
    source: source || 'user',
    timestamp: Date.now(),
    expiresAt: Date.now() + EXPIRY_MS,
    confirmations: 0,
    active: true,
  };
  incidents.push(incident);
  io.emit('new_incident', incident);
  io.emit('incidents_updated', incidents);
  res.status(201).json(incident);
});

// Confirm incident still active (resets expiry)
app.post('/api/incidents/:id/confirm', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) return res.status(404).json({ error: 'Not found' });
  incident.confirmations += 1;
  incident.expiresAt = Date.now() + EXPIRY_MS;
  io.emit('incidents_updated', incidents);
  res.json(incident);
});

// Mark incident as resolved
app.post('/api/incidents/:id/resolve', (req, res) => {
  incidents = incidents.filter(i => i.id !== req.params.id);
  io.emit('incidents_updated', incidents);
  res.json({ success: true });
});

// Simulate a UW Alert (demo endpoint)
app.post('/api/uw-alert', (req, res) => {
  const { lat, lng, type, description } = req.body;
  const incident = {
    id: uuidv4(),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    type: type || 'Police Presence',
    description: description || 'UW Alert: Incident reported on campus',
    source: 'uw_alert',
    timestamp: Date.now(),
    expiresAt: Date.now() + EXPIRY_MS,
    confirmations: 0,
    active: true,
  };
  incidents.push(incident);
  io.emit('new_incident', incident);
  io.emit('uw_alert', incident);
  io.emit('incidents_updated', incidents);
  res.status(201).json(incident);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('incidents_updated', incidents);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
