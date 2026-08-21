const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const authMiddleware = require('../middleware/authMiddleware');

// Apply protection to all clinical session routes
router.use(authMiddleware);

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

// Start new session / Commit session - with strict validation
router.post('/', async (req, res) => {
  const { patientId, technicianEmail, testType, startTime, durationSeconds, hospitalId } = req.body;

  if (!patientId || !hospitalId || !testType) {
    return res.status(400).json({ message: 'Validation Error: Incomplete clinical session data.' });
  }

  try {
    const session = new Session({
      patient: patientId,
      technician: req.user.id, // Use ID from token for security
      hospitalId,
      testType,
      quality: req.body.quality || 100,
      findings: req.body.findings,
      aiSummary: req.body.aiSummary,
      durationSeconds: durationSeconds || 0,
      startTime: startTime || new Date(),
      status: 'completed', // Dashboard sessions are usually commits
      waveformSnapshot: req.body.waveformSnapshot
    });

    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (err) {
    console.error("[SESSIONS] Post Error:", err);
    res.status(400).json({ message: 'Failed to commit session to clinical atlas.' });
  }
});

/**
 * SQL Sync Proxy - Support for offline-first nodes
 */
router.post('/sync-session', async (req, res) => {
    try {
        const { patientId, hospitalId, startTime } = req.body;
        await Session.findOneAndUpdate(
            { patientId, hospitalId, startTime },
            { ...req.body, status: 'completed' },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update session (e.g. adding AI summary later)
router.put('/:id', async (req, res) => {
    try {
        const updated = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
