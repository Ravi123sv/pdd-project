const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neurosignal';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany({});

    const users = [
      {
        email: 'sterling@hospital.org',
        name: 'Dr. Sterling',
        role: 'admin',
        hospitalId: 'HOSP-01',
        hospitalName: 'General Hospital',
        clinicalKey: 'NS-123456'
      },
      {
        email: 'tech@hospital.org',
        name: 'John Tech',
        role: 'technician',
        hospitalId: 'HOSP-01',
        hospitalName: 'General Hospital',
        clinicalKey: 'NS-654321'
      }
    ];

    await User.insertMany(users);
    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seed();
