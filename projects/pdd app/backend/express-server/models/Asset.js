const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['success', 'warning', 'error', 'primary'], default: 'primary' },
  icon: { type: String, default: 'inventory_2' },
  status: { type: String, required: true },
  hospitalId: { type: String, required: true },
  lastAudit: { type: Date, default: Date.now },
  maintenanceLogs: [{
    date: { type: Date, default: Date.now },
    action: String,
    technician: String
  }]
});

module.exports = mongoose.model('Asset', AssetSchema);
