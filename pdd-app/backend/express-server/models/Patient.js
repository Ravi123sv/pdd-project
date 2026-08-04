const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true }, // MRN
  name: { type: String, required: true },
  age: { type: Number },
  department: { type: String },
  hospitalId: { type: String, required: true },
  lastSessionDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
