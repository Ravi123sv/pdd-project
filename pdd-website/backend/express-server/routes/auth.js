const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// SECURITY: Retrieve secret from environment variable ONLY.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("[BOOT] CRITICAL: JWT_SECRET environment variable is missing.");
}

// Institutional Onboarding: Register New Hospital
router.post('/register-hospital', async (req, res) => {
  const { name, adminEmail, clinicalKey } = req.body;
  try {
    const hospitalId = `HOSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newHospital = new Hospital({
      hospitalId,
      name,
      adminEmail,
      clinicalKey,
      authorizedEmails: [{ email: adminEmail, role: 'admin' }],
      subscriptionTier: 'free'
    });
    await newHospital.save();
    res.status(201).json({ success: true, hospital: newHospital });
  } catch (err) {
    res.status(400).json({ message: 'Hospital registration failed. Key or ID might already exist.' });
  }
});

// Login with Clinical Key + Google Email Validation
router.post('/login-key', async (req, res) => {
  const { clinicalKey, email } = req.body;

  console.log(`[AUTH] Login Attempt: ${email} with Key: ${clinicalKey}`);

  try {
    // 1. Demo Fallback for Master Key (Ensures NS-884920 always works for testing)
    if (clinicalKey === 'NS-884920') {
        console.log(`[AUTH] Master Key Detected. Overriding DB check.`);
        const demoUser = {
            _id: "demo-admin-7702",
            email: email,
            name: email.split('@')[0],
            role: 'admin',
            hospitalId: 'HOSP-MASTER',
            hospitalName: 'General Hospital (Demo)',
            clinicalKey: 'NS-884920'
        };
        const token = jwt.sign({ id: demoUser._id, role: demoUser.role }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({ token, user: demoUser });
    }

    // 2. Standard DB Lookup
    const hospital = await Hospital.findOne({ clinicalKey });
    if (!hospital) {
        console.warn(`[AUTH] Invalid Key: ${clinicalKey}`);
        return res.status(401).json({ message: 'Invalid clinical key. Please check your institutional credentials.' });
    }

    // 3. Validate Authorization
    const isAuthorized = hospital.adminEmail === email ||
                         hospital.authorizedEmails.some(a => a.email === email);

    if (!isAuthorized) {
        console.warn(`[AUTH] Unauthorized Email for Key ${clinicalKey}: ${email}`);
        return res.status(403).json({ message: `Access Denied: Your Google ID (${email}) is not authorized for this hospital hub.` });
    }

    // 4. Persistence
    let user = await User.findOne({ email, hospitalId: hospital.hospitalId });
    if (!user) {
        user = new User({
            email,
            name: email.split('@')[0],
            role: hospital.adminEmail === email ? 'admin' : 'doctor',
            hospitalId: hospital.hospitalId,
            hospitalName: hospital.name,
            clinicalKey
        });
        await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user });
  } catch (err) {
    console.error(`[AUTH] Error:`, err);
    res.status(500).json({ message: 'Clinical Hub Connection Timeout. Please try again.' });
  }
});

// Profile & Team routes... (rest of the file remains same)
router.get('/profile/:uid', async (req, res) => {
    try {
        const user = await User.findById(req.params.uid);
        if (!user) {
            // Support persistent individual ID for demo
            if (req.params.uid === 'individual_persistent_id' || req.params.uid.startsWith('demo-')) {
                return res.json({
                    user: {
                        _id: "demo-admin-7702",
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

router.get('/hospital-team/:hospitalId', authMiddleware, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ hospitalId: req.params.hospitalId });
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

        // Ensure user belongs to this hospital
        if (req.user.hospitalId !== req.params.hospitalId && req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Unauthorized hospital context.' });
        }

        const users = await User.find({ hospitalId: req.params.hospitalId });

        const members = users.map(u => ({
            _id: u._id,
            email: u.email,
            name: u.name,
            role: u.role,
            status: 'active'
        }));

        hospital.authorizedEmails.forEach(a => {
            if (!members.find(m => m.email === a.email)) {
                members.push({
                    _id: `pending-${a._id}`,
                    email: a.email,
                    name: 'Pending Access',
                    role: a.role,
                    status: 'authorized'
                });
            }
        });

        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/authorize-staff', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const { hospitalId, email, role } = req.body;
    try {
        const hospital = await Hospital.findOne({ hospitalId });
        if (!hospital) return res.status(404).json({ message: 'Hospital hub not found' });

        if (hospital.authorizedEmails.some(a => a.email === email)) {
            return res.status(400).json({ message: 'Practitioner already authorized' });
        }

        hospital.authorizedEmails.push({ email: email.toLowerCase(), role });
        await hospital.save();

        res.json({ success: true, message: `Access granted to ${email}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/remove-staff', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const { hospitalId, email } = req.body;
    try {
        const hospital = await Hospital.findOne({ hospitalId });
        if (!hospital) return res.status(404).json({ message: 'Hospital hub not found' });

        hospital.authorizedEmails = hospital.authorizedEmails.filter(a => a.email !== email);
        await hospital.save();

        // Also remove the user record if they've already logged in
        await User.deleteOne({ email, hospitalId });

        res.json({ success: true, message: `Access revoked for ${email}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
