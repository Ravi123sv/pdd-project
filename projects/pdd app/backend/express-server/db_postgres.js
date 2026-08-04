const { Pool } = require('pg');

/**
 * Neon/Postgres Connection Configuration
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const query = (text, params) => pool.query(text, params);

/**
 * Initialize Clinical Schema
 */
const initDb = async () => {
  try {
    // Enable uuid-ossp extension for gen_random_uuid() or uuid_generate_v4()
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await query(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        hospital_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS clinical_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        patient_id TEXT REFERENCES patients(id),
        test_type TEXT NOT NULL,
        quality DOUBLE PRECISION,
        technician TEXT,
        diagnosis TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP
      );
    `);
    console.log("SQL: Clinical Schema Verified.");
  } catch (err) {
    console.error("SQL INIT ERROR:", err);
  }
};

module.exports = {
  query,
  pool,
  initDb
};
