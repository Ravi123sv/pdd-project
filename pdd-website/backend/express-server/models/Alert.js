const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true },
  type: { type: String, enum: ['critical', 'system', 'warning'], default: 'system' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, default: 'CLINICAL' },
  patientId: { type: String }, // Optional MRN reference
  technician: { type: String },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alert', AlertSchema);
