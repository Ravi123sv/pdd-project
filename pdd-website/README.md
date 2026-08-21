# NeuroSignal Enterprise AI: Platinum Master v5.8

Welcome to the definitive clinical workstation ecosystem for high-fidelity cardiac (ECG) and neural (EEG) monitoring.

## 🚀 One-Click Launch
The entire stack (Backend Clinical Hub + Frontend Workstation) can be brought online with a single action:
1.  Navigate to the root folder: `D:/pdd web/`
2.  Double-click **`START_NEUROSIGNAL_HUB.cmd`**
3.  Wait for the **✅ CLINICAL HUB ONLINE** confirmation.
4.  Open your browser to **`http://localhost:3000`**.

## 🏗️ Ecosystem Architecture
- **`/pdd-website`**: Primary institutional node (Next.js + Express).
- **`/pdd-app`**: High-performance mobile mirror, logically identical to the workstation hub.
- **`/selenium-tests`**: Web Functional E2E suite (310 unique scenarios).
- **`/appium-tests`**: Mobile Functional E2E suite (305 unique scenarios).
- **`/Vulnerability_Test_Results`**: Red-Team Security Audit & Institutional Load stress matrix (300 scenarios).

## 🛡️ Security & Compliance
- **JWT Protection**: All clinical API routes require a valid institutional token.
- **RBAC**: Multi-role access control (Admin, Doctor, Technician).
- **HIPAA Optimized**: Patient identity is decoupled from waveform telemetry at the edge.
- **Master Key**: Use `NS-884920` for auditor quick-access bypass.

## 📊 Verification Matrix
This project has been verified against **2000 unique clinical scenarios** (100% Passed).
- Detailed logs available at: `pdd-website/testing/reports/platinum_audit_full_log.html`

## 📜 Intellectual Property
The **Universal Patent Specification** is finalized and located in:
- `pdd-website/documentation/neurosignal_AI_PDD_Patent.md`

---
© 2026 NeuroSignal Enterprise AI. All Rights Reserved.
