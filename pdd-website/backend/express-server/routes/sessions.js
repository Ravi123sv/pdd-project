const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get all sessions for a hospital with patient and user details
router.get('/:hospitalId', async (req, res) => {
  try {
    const sessions = await Session.find({ hospitalId: req.params.hospitalId })
      .populate('patient')
      .populate('technician', 'name email role')
      .sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get ACTIVE sessions only (Dashboard feed)
router.get('/active/:hospitalId', async (req, res) => {
    try {
        const sessions = await Session.find({ hospitalId: req.params.hospitalId, status: 'active' })
            .populate('patient', 'name patientId department')
            .limit(5);
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new session
router.post('/', async (req, res) => {
  try {
    const { patientId, technicianEmail, hospitalId, testType, quality, findings, startTime, durationSeconds } = req.body;

    const patient = await Patient.findOne({ patientId });
    const technician = await User.findOne({ email: technicianEmail });

    if (!patient || !technician) {
      return res.status(404).json({ message: 'Patient or Technician not found in clinical registry.' });
    }

    const session = new Session({
        patient: patient._id,
        technician: technician._id,
        hospitalId,
        testType,
        quality: quality || 0,
        findings: findings || '',
        startTime: startTime || new Date(),
        durationSeconds: durationSeconds || 0,
        status: 'completed'
    });

    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// SQL Sync Proxy logic for Sessions
router.post('/sync-session', async (req, res) => {
    try {
        const { patientId, technicianEmail, hospitalId, testType, quality, findings, startTime, durationSeconds } = req.body;

        const patient = await Patient.findOne({ patientId });
        const technician = await User.findOne({ email: technicianEmail });

        if (!patient || !technician) {
            return res.status(404).json({ message: 'Sync failed: Identity resolution failed.' });
        }

        const sessionData = {
            patient: patient._id,
            technician: technician._id,
            hospitalId,
            testType,
            quality,
            findings,
            startTime,
            durationSeconds,
            status: 'completed'
        };

        await Session.findOneAndUpdate(
            { patient: patient._id, startTime },
            sessionData,
            { upsert: true, new: true }
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update session (e.g., add diagnosis or AI summary)
router.put('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
