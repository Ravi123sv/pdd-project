const express = require('express');
const router = express.Router();
const db = require('../db_local');

// Get all assets for a hospital
router.get('/:hospitalId', async (req, res) => {
  try {
    const assets = await db.assets.find({ hospitalId: req.params.hospitalId });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Report malfunction
router.post('/malfunction/:id', async (req, res) => {
  try {
    const asset = await db.assets.update(
        { _id: req.params.id },
        {
            $set: { status: 'ERROR', type: 'error' },
            $push: { maintenanceLogs: { action: 'Malfunction Reported: ' + req.body.issue, technician: req.body.technician, date: new Date() } }
        },
        { returnUpdatedDocs: true }
    );
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
