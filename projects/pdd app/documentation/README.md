# NeuroSignal AI Workstation

A clinical-grade monitoring and analysis platform for ECG and EEG signals.

## 🚀 Getting Started

### Prerequisites
- Flutter SDK (3.24.3+)
- Node.js (for REST backend)
- Go (for high-speed streamer)
- PostgreSQL (Enterprise Master Index)

### Environment Setup
Create a `.env` file in the `server/` directory:
```env
DATABASE_URL=your_postgresql_connection_string
USE_POSTGRES=true
MONGO_URI=your_mongodb_uri
```

Ensure your Gemini API key is configured in `AiService.dart` or provided as a build-time variable:
`--dart-define=GEMINI_API_KEY=your_key`

### Launching the Ecosystem

1. **Start the Node.js Server**:
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the Go Streamer**:
   ```bash
   cd gin-server
   go run main.go
   ```

3. **Launch the Flutter Workstation**:
   ```bash
   flutter run -d chrome
   ```

## 🏥 Key Features
- **Real-Time Monitoring**: Dual-stream visualization (Raw vs. Neural Cleaned).
- **Clinical Precision**: Pan-Tompkins algorithm for HR and Spectral Analysis for EEG.
- **Enterprise Redundancy**: Dual-sync to Firestore and PostgreSQL.
- **Interoperability**: HL7 FHIR bundle exports.
- **Holographic View**: 3D brain/heart localization reactively pulsing to signal peaks.

## 🔐 Security & Compliance
- **HIPAA Compliant**: Full AES-256 local database encryption using **SQLCipher**.
- **Interoperable**: Standard-compliant **HL7 FHIR** bundle generation.
- **Enterprise Redundancy**: Dual-sync architecture (Firestore + PostgreSQL).
- **Audit Ready**: Persistent local logging and real-time clinical audit trails.
- **Access Control**: Strict clinical key validation and multi-role RBAC.

## 🚀 Quick Start (Clinical Mode)

1. **Authentication**: Enter your institutional email or use the **"Clinical Access Key"** provided by your administrator.
2. **Admission**: Use the **"INITIALIZE ACQUISITION"** button to start a new patient session.
3. **Analytics**: Toggle **"Spectral Analytics"** in the monitor for real-time frequency decomposition.
4. **Interoperability**: Enable **"EMR Sync"** in the Export Vault to transmit data to the hospital gateway.

---
Built for clinical excellence. © 2024 NeuroSignal AI.
