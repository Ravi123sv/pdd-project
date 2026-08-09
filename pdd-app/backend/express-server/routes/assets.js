const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const Alert = require('../models/Alert');
const authMiddleware = require('../middleware/authMiddleware');

// Apply protection to all asset management routes
router.use(authMiddleware);

// Get all assets for a hospital
router.get('/:hospitalId', async (req, res) => {
  try {
    const assets = await Asset.find({ hospitalId: req.params.hospitalId });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Report asset malfunction
router.post('/malfunction/:id', async (req, res) => {
    try {
        const { issue, technician, hospitalId } = req.body;
        if (!issue) return res.status(400).json({ message: 'Issue description is required for malfunction logs.' });

        const asset = await Asset.findByIdAndUpdate(req.params.id, {
            status: 'ERROR',
            type: 'error',
            metadata: {
                lastError: issue,
                reportedBy: technician,
                reportedAt: new Date()
            }
        }, { new: true });

        // Log to Notification Center (New Persistent System)
        if (hospitalId) {
            const alert = new Alert({
                hospitalId,
                type: 'warning',
                title: 'HARDWARE FAILURE',
                body: `Equipment malfunction reported for ${asset.name} by ${technician}. Issue: ${issue}`,
                category: 'SYSTEM'
            });
            await alert.save();
        }

        res.json({ success: true, asset });
    } catch (err) {
        res.status(400).json({ message: 'Failed to update asset status.' });
    }
});

module.exports = router;
