const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Asset = require('../models/Asset');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Session = require('../models/Session');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { hospitalId } = req.body;

  if (!hospitalId) return res.status(400).json({ message: 'hospitalId is required' });

  try {
    // Clear existing for this hospital
    await Patient.deleteMany({ hospitalId });
    await Asset.deleteMany({ hospitalId });
    await Hospital.deleteMany({ hospitalId });
    await User.deleteMany({ hospitalId });
    await Session.deleteMany({ hospitalId });

    // Seed Hospital Base
    const hospital = new Hospital({
        hospitalId,
        name: 'General Hospital',
        clinicalKey: 'NS-884920',
        adminEmail: 'admin@neurosignal.org',
        authorizedEmails: [
            { email: 'doctor@clinic.com', role: 'doctor' },
            { email: 'technician@hospital.org', role: 'technician' }
        ]
    });
    await hospital.save();

    // Seed Patients
    const patients = [
      { patientId: 'MRN-1001', name: 'John Doe', age: 45, department: 'Cardiology', hospitalId },
      { patientId: 'MRN-1002', name: 'Jane Smith', age: 32, department: 'Neurology', hospitalId },
      { patientId: 'MRN-1003', name: 'Robert Brown', age: 58, department: 'ICU', hospitalId }
    ];
    const createdPatients = await Patient.insertMany(patients);

    // Seed Users
    const technician = new User({
        email: 'tech@hospital.org',
        name: 'John Tech',
        role: 'technician',
        hospitalId,
        clinicalKey: 'NS-884920'
    });
    await technician.save();

    // Seed Sessions
    const sessions = [
        {
            patient: createdPatients[0]._id,
            technician: technician._id,
            hospitalId,
            testType: 'ECG',
            quality: 98,
            findings: 'Normal sinus rhythm. Slight artifact in lead V1.',
            durationSeconds: 120,
            startTime: new Date(Date.now() - 86400000), // Yesterday
            status: 'completed'
        },
        {
            patient: createdPatients[1]._id,
            technician: technician._id,
            hospitalId,
            testType: 'EEG',
            quality: 92,
            findings: 'Alpha wave dominance in occipital leads. No seizure activity noted.',
            durationSeconds: 300,
            startTime: new Date(Date.now() - 172800000), // 2 days ago
            status: 'completed'
        }
    ];
    await Session.insertMany(sessions);

    // Seed Assets
    const assets = [
      { name: 'ECG Lead Set (12)', status: 'ACTIVE', type: 'success', icon: 'cable', hospitalId },
      { name: 'EEG Cap (M)', status: 'IN USE', type: 'primary', icon: 'psychology', hospitalId },
      { name: 'Conductive Gel', status: 'LOW STOCK', type: 'warning', icon: 'opacity', hospitalId },
    ];
    await Asset.insertMany(assets);

    res.json({ message: 'MongoDB Seeding Successful', hospital: 'NS-884920' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
