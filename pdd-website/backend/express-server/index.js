require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

console.log("[BOOT] Node Process Initialized");

// Global Crash Handler (Red-Team Monitoring)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception thrown:', err);
});

// SECURITY: Early verify of production secrets
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error("[BOOT] CRITICAL FAILURE: JWT_SECRET environment variable is missing. Authentication will fail.");
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

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
  res.send('NeuroSignal Clinical Hub v4.0 Online (Hardened Boot)');
});

// Database Connection Logic (Resilient)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI || MONGO_URI.includes('password_placeholder')) {
    console.error('[BOOT] CRITICAL: MONGO_URI not configured.');
} else {
    console.log("[BOOT] Establishing Database Link...");
    mongoose.connect(MONGO_URI)
      .then(() => console.log('[BOOT] NeuroSignal Hub: Clinical Atlas Node Online'))
      .catch(err => console.error('[BOOT] CRITICAL: Database Handshake Failed:', err.message));
}

// Import & Use Routes
console.log("[BOOT] Mounting Clinical Modules...");
try {
    const assetRoutes = require('./routes/assets');
    const patientRoutes = require('./routes/patients');
    const authRoutes = require('./routes/auth');
    const seedRoutes = require('./routes/seed');
    const signalRoutes = require('./routes/signals');
    const otpRoutes = require('./routes/otp');
    const sessionRoutes = require('./routes/sessions');
    const paymentRoutes = require('./routes/payments');
    const alertRoutes = require('./routes/alerts');

    app.use('/api/assets', assetRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/seed', seedRoutes);
    app.use('/api/signals', signalRoutes);
    app.use('/api/otp', otpRoutes);
    app.use('/api/sessions', sessionRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/alerts', alertRoutes);
    console.log("[BOOT] Clinical Modules Mounted Successfully");
} catch (e) {
    console.error("[BOOT] CRITICAL: Module Mounting Failed:", e.message);
}

// WebSocket Unit Handshake
io.on('connection', (socket) => {
  console.log('Clinical Node Joined:', socket.id);
  socket.on('join_channel', (channel) => socket.join(channel));
  socket.on('broadcast_signal', (data) => socket.to(data.channel).emit('receive_signal', data));
  socket.on('disconnect', () => console.log('Clinical Node Disconnected'));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(`[RUNTIME ERROR] ${new Date().toISOString()}:`, err.stack);
  res.status(500).json({ error: 'Internal Hub Error', message: err.message });
});

// Port Binding (Render standard)
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[BOOT] Clinical Hub Online on port ${PORT}`);
  console.log(`[BOOT] Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`[BOOT] Database Status: ${mongoose.connection.readyState === 1 ? 'READY' : 'PENDING'}`);
});
