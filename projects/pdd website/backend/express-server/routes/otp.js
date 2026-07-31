const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory OTP storage (In production, use Redis or MongoDB with TTL)
const otpStore = new Map();

router.post('/send', async (req, res) => {
  const { email, name, type } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-minute expiry
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

  try {
    const { data, error } = await resend.emails.send({
      from: 'NeuroSignal Clinical <auth@neurosignal.io>',
      to: [email],
      subject: `[Clinical Verification] ${otp} is your workstation code`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8fafc; border-radius: 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg" alt="NeuroSignal" style="width: 64px; height: 64px; margin-bottom: 16px;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">NEUROSIGNAL ENTERPRISE</h1>
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 8px;">Clinical Access Gateway</p>
          </div>

          <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <p style="color: #475569; font-size: 16px; font-weight: 500; margin-bottom: 24px;">Hello ${name || 'Practitioner'},</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              A request was made to access the NeuroSignal Clinical Workstation via this email. Use the following code to complete your verification.
            </p>

            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 16px; text-align: center; margin-bottom: 32px;">
              <span style="font-family: monospace; font-size: 48px; font-weight: 900; color: #2563eb; letter-spacing: 0.2em;">${otp}</span>
            </div>

            <p style="color: #94a3b8; font-size: 12px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
              This code expires in 5 minutes.
            </p>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #94a3b8; font-size: 12px; font-weight: 500;">
              If you did not request this code, please ignore this email or contact security@neurosignal.io
            </p>
            <p style="color: #cbd5e1; font-size: 10px; margin-top: 16px;">
              &copy; 2026 NeuroSignal Enterprise. All rights reserved. <br>
              End-to-End Encrypted Clinical Environment.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
        // Fallback for development if domain isn't verified in Resend yet
        console.error('Resend Error:', error);
        return res.json({ success: true, mock: true, message: 'Dev Mode: Code generated but email failed (check Resend domain verification)', code: otp });
    }

    res.json({ success: true, message: 'Verification link sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  const stored = otpStore.get(email);

  if (!stored) return res.status(400).json({ message: 'No verification pending for this email' });
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'Verification code expired' });
  }

  if (stored.otp === otp) {
    otpStore.delete(email);
    return res.json({ success: true, message: 'Identity Verified' });
  } else {
    res.status(400).json({ message: 'Invalid verification code' });
  }
});

module.exports = router;
