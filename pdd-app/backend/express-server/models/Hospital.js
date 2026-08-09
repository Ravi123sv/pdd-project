const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  clinicalKey: { type: String, required: true, unique: true },
  adminEmail: { type: String, required: true },
  authorizedEmails: [{
    email: String,
    role: { type: String, enum: ['doctor', 'technician', 'admin'], default: 'doctor' },
    addedAt: { type: Date, default: Date.now }
  }],
  subscriptionTier: { type: String, enum: ['free', 'enterprise', 'research'], default: 'free' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hospital', HospitalSchema);
