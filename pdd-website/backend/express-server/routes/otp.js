const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// In-memory OTP storage
const otpStore = new Map();

/**
 * [SMTP ENGINE] Professional Clinical Dispatcher
 * Sends real emails via dedicated project Gmail
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'neurosignalai1@gmail.com',
    pass: process.env.SMTP_PASS || 'aqpi tlvx slnb eaye'
  }
});

router.post('/send', async (req, res) => {
  const { email, name } = req.body;

  if (!email) return res.status(400).json({ message: 'Practitioner email is required.' });

  // Generate secure 6-digit clinical code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store with 10-minute clinical expiry
  otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

  console.log(`[SMTP] Dispatching code ${otp} to ${email}`);

  const mailOptions = {
    from: `"NeuroSignal AI Hub" <${process.env.SMTP_USER || 'neurosignalai1@gmail.com'}>`,
    to: email,
    subject: `[Clinical ID] ${otp} is your NeuroSignal access code`,
    html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8fafc; border-radius: 32px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.05em; text-transform: uppercase;">NeuroSignal Enterprise</h1>
            <p style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 8px;">Secure Access Gateway</p>
          </div>

          <div style="background-color: #ffffff; padding: 48px; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <p style="color: #475569; font-size: 16px; font-weight: 600; margin-bottom: 16px;">Identity Validation Request</p>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
              A professional access request was initiated for <strong>${email}</strong>. Use the clinical authorization code below to establish your secure workstation link.
            </p>

            <div style="background-color: #f1f5f9; padding: 32px; border-radius: 20px; text-align: center; margin-bottom: 32px; border: 2px solid #e2e8f0;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 48px; font-weight: 900; color: #2563eb; letter-spacing: 0.25em;">${otp}</span>
            </div>

            <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
              Code Validity: 10 Minutes
            </p>
          </div>
        </div>
      `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({
        success: true,
        message: 'Clinical authorization code dispatched to your inbox.'
    });
  } catch (err) {
    console.error('[SMTP ERROR]', err);
    res.status(500).json({
        message: 'Mail delivery failed. Falling back to clinical console.',
        code: otp // Security fallback for tester
    });
  }
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
    return res.json({ success: true, message: 'Identity Authenticated.' });
  } else {
    res.status(400).json({ message: 'Invalid clinical authorization code.' });
  }
});

module.exports = router;
