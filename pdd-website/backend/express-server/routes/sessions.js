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
