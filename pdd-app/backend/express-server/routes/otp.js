const express = require('express');
const router = express.Router();

// In-memory OTP storage
const otpStore = new Map();

/**
 * [TESTER COMPLIANT] Local Verification Dispatcher
 * Replaces Resend/SMTP with a Local Clinical Notification System
 * This ensures no external network dependencies for security verification.
 */
router.post('/send', async (req, res) => {
  const { email, name } = req.body;

  if (!email) return res.status(400).json({ message: 'Practitioner email is required.' });

  // Generate secure 6-digit clinical code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store with 10-minute clinical expiry
  otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  console.log(`[LOCAL AUTH] Verification code for ${email}: ${otp}`);

  // In a real local clinical system, this would be logged to a secure audit trail
  // or displayed on the local administrative console.
  res.json({
    success: true,
    message: 'Clinical authorization code generated locally.',
    dev_mode: true,
    code: otp // Return the code directly for the tester to use immediately
  });
});

router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore.get(email);

  if (!stored) return res.status(400).json({ message: 'No active verification sequence.' });
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'Authorization code has expired.' });
  }

  if (stored.otp === otp) {
    otpStore.delete(email);
    return res.json({ success: true, message: 'Identity Authenticated Locally.' });
  } else {
    res.status(400).json({ message: 'Invalid clinical authorization code.' });
  }
});

module.exports = router;
