const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testType: { type: String, enum: ['ECG', 'EEG', 'EMG'], required: true },
  quality: { type: Number }, // SQI
  diagnosis: { type: String },
  findings: { type: String },
  durationSeconds: { type: Number },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'discarded'], default: 'active' },
  waveformSnapshot: [Number], // Representative sample
  metadata: {
    deviceId: String,
    department: String
  }
});

module.exports = mongoose.model('Session', SessionSchema);
