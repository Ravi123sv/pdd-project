const { io } = require('socket.io-client');
const axios = require('axios');

/**
 * NEUROSIGNAL "HOSPITAL PULSE" SIMULATOR v1.0
 * This engine breathes life into the Command Center by streaming live signals
 * for multiple patients simultaneously.
 */

const HUB_URL = 'http://localhost:5000';
const API_URL = HUB_URL + '/api';

async function startSimulation() {
    console.log("🚀 Initializing Hospital-Wide Pulse Simulation...");

    // 1. Establish Master Handshake
    const socket = io(HUB_URL);

    socket.on('connect', () => {
        console.log("✅ Simulation Engine Linked to Clinical Hub.");
    });

    // 2. Define Clinical Room Entities
    const rooms = [
        { id: 'MRN-1001', name: 'John Doe', modality: 'ECG', room: 'ICU-01' },
        { id: 'MRN-1002', name: 'Jane Smith', modality: 'EEG', room: 'NEURO-04' },
        { id: 'MRN-1003', name: 'Robert Brown', modality: 'ECG', room: 'ER-02' },
        { id: 'MRN-1004', name: 'Sarah Miller', modality: 'ECG', room: 'ICU-05' },
        { id: 'MRN-1005', name: 'Michael Chen', modality: 'EEG', room: 'NEURO-02' },
        { id: 'MRN-1006', name: 'Emma Wilson', modality: 'ECG', room: 'ER-09' }
    ];

    console.log(`📡 Streaming telemetry for ${rooms.length} active clinical rooms...`);

    let tick = 0;

    // 3. High-Fidelity Signal Loop (Pulse at 50Hz)
    setInterval(() => {
        tick += 0.02;

        rooms.forEach((p, idx) => {
            let val = 0;
            const t = tick + (idx * 0.5); // Phase shift for each room

            if (p.modality === 'ECG') {
                // Realistic P-QRS-T generation
                const phase = t % 0.8; // 75 BPM
                if (phase > 0.1 && phase < 0.2) val += 2 * Math.sin((phase - 0.1) * Math.PI / 0.1);
                if (phase > 0.3 && phase < 0.35) val -= 5 * Math.sin((phase - 0.3) * Math.PI / 0.05);
                else if (phase >= 0.35 && phase < 0.4) val += 35 * Math.sin((phase - 0.35) * Math.PI / 0.05);
                else if (phase >= 0.4 && phase < 0.45) val -= 8 * Math.sin((phase - 0.4) * Math.PI / 0.05);
                if (phase > 0.6 && phase < 0.8) val += 4 * Math.sin((phase - 0.6) * Math.PI / 0.2);
            } else {
                // Alpha/Beta neural waves
                val = 6 * Math.sin(t * 10 * Math.PI) + 3 * Math.sin(t * 24 * Math.PI);
            }

            // Inject slight variability/noise
            val += (Math.random() - 0.5) * 1.5;

            // Broadcast to Hub
            socket.emit('broadcast_signal', {
                channel: `patient_${p.id}`,
                patientId: p.id,
                value: val,
                timestamp: Date.now()
            });

            // Random Clinical Anomaly (Autonomous Alert Demonstration)
            if (Math.random() > 0.9995) {
                console.warn(`🚨 ALERT: Clinical Anomaly detected in Room ${p.room} (${p.name})`);
                socket.emit('trigger_red_alert', {
                    sender: 'SIMULATOR_CORE',
                    channel: 'Global-ER',
                    text: `CRITICAL: Morphological shift detected for Patient ${p.id} in ${p.room}.`
                });
            }
        });
    }, 20);

    console.log("🏥 Simulation running. Open Command Center to view live pulses.");
}

startSimulation().catch(err => {
    console.error("❌ Simulation Engine Failed:", err.message);
    console.log("HINT: Ensure Clinical Hub is running on port 5000 before starting simulation.");
});
