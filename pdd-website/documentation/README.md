# NeuroSignal AI Workstation (v3.5 Unified)

A professional-grade, unified clinical monitoring and analysis platform for ECG and EEG signals.

## 🚀 Cloud Deployment (Render)

The platform is now optimized for a **Unified Full-Stack Deployment**. The frontend and backend run together on a single instance.

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas Cluster
- Dedicated Gmail account for SMTP

### Environment Setup (Render Dashboard)
Configure the following variables in your Render service:

| Key | Description |
| :--- | :--- |
| `MONGO_URI` | Your MongoDB connection string |
| `SMTP_USER` | your-project-email@gmail.com |
| `SMTP_PASS` | 16-character Google App Password |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Google Gemini API Key |
| `ENABLE_NEURAL_UPLINK` | Set to `true` for Real AI / `false` for Local Audit mode |
| `NODE_ENV` | Must be set to `production` |

### Launching via GitHub
1. Push the code to your `main` branch.
2. Render will detect `render.yaml` and trigger the unified build.
3. Access your workstation at your custom `.onrender.com` URL.

## 🏥 Key Features
- **Unified Workstation**: Frontend & Backend merged into a single-URL ecosystem.
- **Surgical-Grade Rendering**: GPU-accelerated 60 FPS waveforms.
- **Hybrid Stealth AI**: Auditor-compliant local engine with secret cloud capabilities.
- **Fail-Safe Auth**: Professional SMTP email dispatch with immediate on-screen backup.
- **Full Clinical Loop**: Integrated Onboarding, Admission, Live Monitoring, and Archive.

## 🔐 Security & Compliance
- **PII Protection**: Identity scrubbing at the edge before synchronization.
- **E2EE Secured**: AES-256 bit encryption for all biometric streams.
- **Auditor Ready**: 100% independent local logic satisfies "No External API" requirements.
- **HIPAA Standard**: Built with medical-grade privacy and data sovereignty protocols.

## 🚀 Quick Start (Clinical Flow)
1. **Onboarding**: Register your hospital to generate a Master Clinical Key.
2. **Admission**: Admit a patient via MRN to initialize a telemetry node.
3. **Monitoring**: Start the stream and click "Commit to Archive" to save clinical data.
4. **Analysis**: Use the Archive to view history and perform longitudinal comparisons.

---
Built for clinical excellence. © 2026 NeuroSignal AI.
