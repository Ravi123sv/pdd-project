const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'neurosignal_clinical_secret_key';

// Login with Clinical Key
router.post('/login-key', async (req, res) => {
  const { clinicalKey } = req.body;
  try {
    const user = await User.findOne({ clinicalKey });

    if (!user) return res.status(401).json({ message: 'Invalid clinical key' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Profile
router.get('/profile/:uid', async (req, res) => {
    try {
        const user = await User.findById(req.params.uid);
        if (!user) {
            // Support persistent individual ID for demo
            if (req.params.uid === 'individual_persistent_id') {
                return res.json({
                    user: {
                        _id: "ind-7702",
                        email: "doctor@clinic.com",
                        name: "Dr. Sterling",
                        role: "doctor",
                        userType: "individual",
                    }
                });
            }
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Team
router.get('/hospital-team/:hospitalId', async (req, res) => {
    try {
        const team = await User.find({ hospitalId: req.params.hospitalId });
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
