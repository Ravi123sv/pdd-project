const db = require('./db_local');

async function seed() {
  try {
    console.log('Seeding Local NeDB Database...');

    await db.users.remove({}, { multi: true });
    await db.patients.remove({}, { multi: true });
    await db.assets.remove({}, { multi: true });

    // Seed Users
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
    await db.users.insert(users);

    // Seed Assets
    const assets = [
        { name: 'ECG Lead Set (12)', status: 'ACTIVE', type: 'success', icon: 'cable', hospitalId: 'HOSP-01' },
        { name: 'EEG Cap (M)', status: 'IN USE', type: 'primary', icon: 'psychology', hospitalId: 'HOSP-01' },
        { name: 'Conductive Gel', status: 'LOW STOCK', type: 'warning', icon: 'opacity', hospitalId: 'HOSP-01' },
    ];
    await db.assets.insert(assets);

    console.log('Local Database Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Local Seeding Error:', err);
    process.exit(1);
  }
}

seed();
