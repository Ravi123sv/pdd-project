const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'technician'], default: 'technician' },
  hospitalId: { type: String, required: true },
  hospitalName: { type: String },
  clinicalKey: { type: String },
  password: { type: String }, // For non-Google users
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
