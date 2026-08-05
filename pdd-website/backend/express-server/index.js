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

// Primary Connection String from Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ravisaivinaym_db_user:password_placeholder@cluster0.oqqfcbg.mongodb.net/neurosignal_hub?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('NeuroSignal Clinical Hub: Atlas Connection Established'))
  .catch(err => {
    console.error('CRITICAL: Atlas Connection Failed. Falling back to local node.', err.message);
    mongoose.connect('mongodb://localhost:27017/neurosignal_hub');
  });

// Import Routes
const assetRoutes = require('./routes/assets');
const patientRoutes = require('./routes/patients');
const authRoutes = require('./routes/auth');
const seedRoutes = require('./routes/seed');
const signalRoutes = require('./routes/signals');
const otpRoutes = require('./routes/otp');
const sessionRoutes = require('./routes/sessions');
const paymentRoutes = require('./routes/payments');

// Use Routes
app.use('/api/assets', assetRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'Operational', db: 'Atlas/Hub', node: process.env.NODE_ENV || 'development' }));

app.get('/', (req, res) => {
  res.send('NeuroSignal Clinical API v2.5 Operational - Production Ready');
});

// WebSocket Logic for Collaboration
io.on('connection', (socket) => {
  console.log('Node connected:', socket.id);

  socket.on('join_channel', (channel) => {
    socket.join(channel);
    console.log(`Node ${socket.id} joined unit ${channel}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.channel).emit('receive_message', data);
  });

  socket.on('broadcast_signal', (data) => {
    socket.to(data.channel).emit('receive_signal', data);
  });

  socket.on('trigger_red_alert', (data) => {
    io.emit('receive_message', {
      ...data,
      channel: 'RED_ALERT',
      severity: 'CRITICAL',
      time: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Node disconnected');
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[CRITICAL ERROR] ${new Date().toISOString()}:`, err.stack);
  res.status(500).json({
    error: 'Internal Workstation Error',
    message: process.env.NODE_ENV === 'production' ? 'A clinical server error occurred.' : err.message
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Clinical Hub running on port ${PORT}`);
});
