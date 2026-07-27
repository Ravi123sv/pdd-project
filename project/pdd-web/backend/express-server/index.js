require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Import Routes
const assetRoutes = require('./routes/assets');
const patientRoutes = require('./routes/patients');
const authRoutes = require('./routes/auth');
const seedRoutes = require('./routes/seed');
const signalRoutes = require('./routes/signals');

// Use Routes
app.use('/api/assets', assetRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/signals', signalRoutes);

// DB Connections
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neurosignal';
const USE_POSTGRES = process.env.USE_POSTGRES === 'true';
const { initDb, query } = require('./db_postgres');

if (!USE_POSTGRES) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));
} else {
  console.log('Postgres/Neon Integration Active.');
  initDb();
}

// REST Endpoints
app.get('/api/health', (req, res) => res.json({ status: 'Operational', db: USE_POSTGRES ? 'SQL' : 'NoSQL' }));

// SQL Patient Proxy
app.post('/api/sql/sync-patient', async (req, res) => {
  if (!USE_POSTGRES) return res.status(400).send("SQL Mode Inactive");
  const { id, name, age, hospitalId } = req.body;
  try {
    await query(
      'INSERT INTO patients (id, name, age, hospital_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, age = $3',
      [id, name, age, hospitalId || 'HOSP-DEFAULT']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sql/sync-session', async (req, res) => {
  if (!USE_POSTGRES) return res.status(400).send("SQL Mode Inactive");
  const { patientId, testType, quality, technician, diagnosis, startTime } = req.body;
  try {
    await query(
      'INSERT INTO clinical_sessions (patient_id, test_type, quality, technician, diagnosis, start_time) VALUES ($1, $2, $3, $4, $5, $6)',
      [patientId, testType, quality, technician, diagnosis, startTime]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sql/patients', async (req, res) => {
  if (!USE_POSTGRES) return res.status(400).send("SQL Mode Inactive");
  try {
    const result = await query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('NeuroSignal Clinical API v1.0 Operational');
});

// WebSocket Logic for Collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_channel', (channel) => {
    socket.join(channel);
    console.log(`User ${socket.id} joined channel ${channel}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast message to others in the channel
    io.to(data.channel).emit('receive_message', data);
  });

  socket.on('trigger_red_alert', (data) => {
    // Broadcast to the special RED_ALERT channel globally
    console.log(`EMERGENCY: RED ALERT from ${data.sender} in unit ${data.channel}`);
    io.emit('receive_message', {
      ...data,
      channel: 'RED_ALERT',
      severity: 'CRITICAL',
      time: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'A clinical server error occurred.' : err.message
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Clinical Server running on port ${PORT}`);
});
