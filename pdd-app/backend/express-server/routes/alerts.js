const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all alert routes
router.use(authMiddleware);

// Get all alerts for a hospital
router.get('/:hospitalId', async (req, res) => {
  try {
    const alerts = await Alert.find({ hospitalId: req.params.hospitalId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a manual alert (e.g. Red Alert)
router.post('/', async (req, res) => {
  try {
    const alert = new Alert({
        ...req.body,
        timestamp: new Date()
    });
    const newAlert = await alert.save();
    res.status(201).json(newAlert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark all as read
router.post('/read-all/:hospitalId', async (req, res) => {
    try {
        await Alert.updateMany({ hospitalId: req.params.hospitalId, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clear history - Admin Only
router.delete('/:hospitalId', roleMiddleware(['admin']), async (req, res) => {
    try {
        await Alert.deleteMany({ hospitalId: req.params.hospitalId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
