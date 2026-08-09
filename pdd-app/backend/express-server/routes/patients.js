const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

// Apply protection to all clinical patient routes
router.use(authMiddleware);

// Get all patients for a hospital
router.get('/:hospitalId', async (req, res) => {
  try {
    const patients = await Patient.find({ hospitalId: req.params.hospitalId });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new patient (Admission) - with Red-Team Validation
router.post('/', async (req, res) => {
  const { patientId, name, age, department, hospitalId } = req.body;

  // 1. Structural Validation
  if (!patientId || !name || !age || !hospitalId) {
    return res.status(400).json({ message: 'Validation Error: Missing required clinical fields.' });
  }

  // 2. Data Integrity Checks
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: 'Validation Error: Invalid patient name length.' });
  }

  const numericAge = parseInt(age);
  if (isNaN(numericAge) || numericAge < 0 || numericAge > 150) {
    return res.status(400).json({ message: 'Validation Error: Physiological age out of range (0-150).' });
  }

  try {
    // 3. Collision Check
    const existing = await Patient.findOne({ patientId, hospitalId });
    if (existing) {
        return res.status(409).json({ message: 'Conflict: MRN already registered in this clinical node.' });
    }

    const patient = new Patient({
        patientId,
        name,
        age: numericAge,
        department: department || 'General',
        hospitalId,
    });
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: 'Data persistence error. Check database handshake.' });
  }
});

// SQL Sync Proxy logic
router.post('/sync-sql', async (req, res) => {
    const { id, name, age, hospitalId } = req.body;
    try {
        await Patient.findOneAndUpdate(
            { patientId: id },
            { name, age, hospitalId },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
