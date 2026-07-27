# NeuroSignal AI: Enterprise Clinical Intelligence

## 🏥 Project Overview
NeuroSignal AI is a high-fidelity acquisition platform for ECG and EEG monitoring, optimized for clinical environments with integrated AI-driven artifact debugging and waveform analysis.

## 🛠️ Professional Architecture
The application follows a modular architecture for scalability and security:

### 1. Frontend (Flutter)
- **State Management**: Using `AppState` and `SessionController` (Provider) for high-frequency data streams.
- **UI System**: Modern Clinical Design Language with **Medical Glassmorphism**.
- **Components**: Optimized Canvas-based waveform rendering with zero-latency.

### 2. Services Layer
- **AuthService**: Handles secure Firebase and Google authentication with **2-Step Verification**.
- **BackendService**: Manages Firestore synchronization, Cloud Storage, and **PostgreSQL Master Index** connectivity.
- **AiService**: Interface for **Google Gemini 1.5 Flash** for real-time interpretation (NeuroSignal Clinical Consultant).
- **FhirService**: Generates standardized **HL7 FHIR** resources for medical interoperability and EMR gateway synchronization.
- **SignalProcessingService**: Advanced DSP suite for medical signal filtering (**Pan-Tompkins**, **Savitzky-Golay**, and **FFT Spectral Analysis**).
- **LoggingService**: Persistent local operational logging for forensic clinical audit.

### 3. Data Integrity & Analytics
- **Local Vault (SQLCipher)**: Full AES-256 encryption for the on-device SQLite database, with keys derived from institutional clinical credentials.
- **3D Neural Localization**: Spatial mapping of signal "hotspots" on a rotating holographic wireframe, utilizing multi-lead phase synchronization.
- **Spectral Decomposition**: Real-time power distribution analysis across clinical EEG bands (Delta, Theta, Alpha, Beta).

### 3. Backend (Go & Node.js)
- **Gin-Server (Go)**: High-concurrency streamer for raw clinical waveforms.
- **REST-Server (Node.js)**: Relay for enterprise data synchronization and PostgreSQL operations.

### 4. Intelligence (Python/PyTorch)
- **SignalCNN**: 1D Convolutional Neural Network for arrhythmia and brainwave classification.
- **Edge Deployment**: Models are exported to **TFLite** for real-time, offline clinical inference.

## 🔐 Security & Compliance
- **Authentication**: Multi-role support (Admin/Technician) with mandatory email verification.
- **Audit Logging**: All clinical actions are recorded in a central audit trail for regulatory compliance (HIPAA/GDPR).
- **Data Protection**: AES-256 encryption for biometric streams and secure storage.

---
© 2024 NeuroSignal AI. Built for clinical excellence.
