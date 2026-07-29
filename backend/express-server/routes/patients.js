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
  const patient = new Patient({
    patientId: req.body.patientId,
    name: req.body.name,
    age: req.body.age,
    department: req.body.department || 'General',
    hospitalId: req.body.hospitalId,
  });

  try {
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
