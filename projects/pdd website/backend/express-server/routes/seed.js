const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Asset = require('../models/Asset');

router.post('/', async (req, res) => {
  const { hospitalId } = req.body;

  try {
    // Clear existing for this hospital
    await Patient.deleteMany({ hospitalId });
    await Asset.deleteMany({ hospitalId });

    // Seed Patients
    const patients = [
      { patientId: 'MRN-1001', name: 'John Doe', age: 45, department: 'Cardiology', hospitalId },
      { patientId: 'MRN-1002', name: 'Jane Smith', age: 32, department: 'Neurology', hospitalId },
      { patientId: 'MRN-1003', name: 'Robert Brown', age: 58, department: 'ICU', hospitalId }
    ];
    await Patient.insertMany(patients);

    // Seed Assets
    const assets = [
      { name: 'ECG Lead Set (12)', status: 'ACTIVE', type: 'success', icon: 'cable', hospitalId },
      { name: 'EEG Cap (M)', status: 'IN USE', type: 'primary', icon: 'psychology', hospitalId },
      { name: 'Conductive Gel', status: 'LOW STOCK', type: 'warning', icon: 'opacity', hospitalId },
      { name: 'Mobile Station B2', status: 'CHARGING', type: 'primary', icon: 'battery_charging_full', hospitalId }
    ];
    await Asset.insertMany(assets);

    res.json({ message: 'MongoDB Seeding Successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
