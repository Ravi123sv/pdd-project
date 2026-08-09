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

// Database Connection Logic
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('NeuroSignal Hub: Clinical Atlas Node Online'))
      .catch(err => console.error('CRITICAL: Database Handshake Failed:', err.message));
}

// 1. API ROUTES
const assetRoutes = require('./routes/assets');
const patientRoutes = require('./routes/patients');
const authRoutes = require('./routes/auth');
const seedRoutes = require('./routes/seed');
const signalRoutes = require('./routes/signals');
const otpRoutes = require('./routes/otp');
const sessionRoutes = require('./routes/sessions');

app.use('/api/assets', assetRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/sessions', sessionRoutes);

// Clinical Health Node
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected';
    res.json({
        status: 'Operational',
        db: dbState,
        node: process.env.NODE_ENV || 'production',
        timestamp: new Date()
    });
});

app.get('/', (req, res) => {
  res.send('NeuroSignal Clinical Hub v3.5 Online');
});

// WebSocket Unit Handshake
io.on('connection', (socket) => {
  console.log('Clinical Node Joined:', socket.id);
  socket.on('join_channel', (channel) => socket.join(channel));
  socket.on('broadcast_signal', (data) => socket.to(data.channel).emit('receive_signal', data));
  socket.on('disconnect', () => console.log('Clinical Node Disconnected'));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
  res.status(500).json({ error: 'Internal Hub Error', message: err.message });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Clinical Hub Active on port ${PORT}`);
});
