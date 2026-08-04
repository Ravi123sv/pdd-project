# NeuroSignal AI - Comprehensive Handover Specification

## 💎 Project Overview
NeuroSignal AI is a licensable enterprise-grade clinical monitoring platform designed for real-time ECG and EEG telemetry. It utilizes a multi-tenant architecture that allows different healthcare institutions to onboard via unique Clinical Access Keys. The system is designed for high-fidelity Flutter frontend deployment on Mobile, Desktop, and Web environments (e.g., Antigravity).

## 📦 Directory Structure

### 📱 `frontend/` (Flutter Workstation)
The core application interface.
- **Language**: Dart 3.5
- **Framework**: Flutter 3.24.3
- **Main Components**:
  - `lib/models/`: Signal, Patient, and AI result definitions.
  - `lib/services/`: DSP (Digital Signal Processing), AI Interfacing, and FHIR standard support.
  - `lib/state/`: Provider-based reactive state management (`AppState`, `SessionController`).
  - `lib/screens/`: 20+ specialized clinical views.

### 🖥️ `backend/` (Clinical Cloud)
The distributed processing layer.
- **`metadata-server/`**: Node.js/Express handling MongoDB patient records and Socket.IO collaboration.
- **`telemetry-uplink/`**: Go/Gin high-speed binary server for raw signal ingestion.
- **`tf-env/`**: Python/TensorFlow environment for deep training and model export.

### 🎨 `uiux-resources/` (Design Assets)
Production-ready visual artifacts.
- Includes clinical vector icons, brand typography, and high-fidelity figma exports.

### 📄 `documentation/` (Compliance & Specs)
The source of truth for the system architecture.
- Includes `API_SPECS.md`, `HIPAA_COMPLIANCE.md`, and this handover guide.

## 🔌 Integrated APIs & Services
1. **Google Gemini 1.5 Flash**: Orchestrates clinical narratives and optical digitization.
2. **Firebase Enterprise**: Provides secure Auth, Cloud Firestore synchronization, and BLOB storage.
3. **HL7 FHIR DSTU2**: Standardized interoperability with hospital EMR systems.
4. **SQLCipher**: FIPS 140-2 compliant encrypted local database.

## 🛠️ Verification & QA
- **Total Tests**: 545+ automated verification scripts.
- **Protocol**: Universal Android Production Certification (v5.0).
- **Status**: **RELEASE CANDIDATE v2.5.0-PRO**.

## 🚀 Final Launch Roadmap
1. Generate institutional production keystore for Android signing.
2. Scale `backend/telemetry-uplink` to institutional AWS/Azure clusters.
3. Apply final legal terms of service to the `PrivacyPolicyScreen`.
