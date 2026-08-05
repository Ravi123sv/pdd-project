const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients for a hospital
router.get('/:hospitalId', async (req, res) => {
  try {
    const patients = await Patient.find({ hospitalId: req.params.hospitalId });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new patient (Admission)
router.post('/', async (req, res) => {
  try {
    const patient = new Patient({
        patientId: req.body.patientId,
        name: req.body.name,
        age: req.body.age,
        department: req.body.department || 'General',
        hospitalId: req.body.hospitalId,
    });
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// SQL Sync Proxy logic (Sync to Atlas)
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
