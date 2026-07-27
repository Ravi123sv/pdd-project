const express = require('express');
const router = express.Router();
const db = require('../db_local');

// Get all patients for a hospital
router.get('/:hospitalId', async (req, res) => {
  try {
    const patients = await db.patients.find({ hospitalId: req.params.hospitalId });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new patient (Admission)
router.post('/', async (req, res) => {
  const patient = {
    patientId: req.body.patientId,
    name: req.body.name,
    age: req.body.age,
    department: req.body.department || 'General',
    hospitalId: req.body.hospitalId,
    createdAt: new Date()
  };

  try {
    const newPatient = await db.patients.insert(patient);
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// SQL Sync Proxy logic (Replicating Flutter's syncSQL call)
router.post('/sync-sql', async (req, res) => {
    const { id, name, age, hospitalId } = req.body;
    try {
        await db.patients.update({ patientId: id }, { $set: { name, age, hospitalId, updatedAt: new Date() } }, { upsert: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
