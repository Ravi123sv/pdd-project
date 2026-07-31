# NeuroSignal Clinical Workstation Technical Manual

## Overview
NeuroSignal Enterprise v2.5 is a high-fidelity neural waveform analysis platform designed for professional medical use.

## System Components
1. **Frontend**: Next.js 14 Workstation UI (PWA Enabled).
2. **Backend**: Express.js Clinical Hub (MongoDB/Mongoose).
3. **Signal Engine**: Realistic physiological modeling with high-DPI rendering.
4. **AI Core**: Gemini 1.5 Pro Neural Logic Unit.

## Authentication Protocols
- **Institutional Mode**: Google ID + Master Clinical Key (`NS-884920`). Requires admin pre-authorization.
- **Practitioner Mode**: Google ID + 6-Digit Email OTP (Resend Integrated).

## Key Features
- **AI Signal Filter**: Real-time suppression of muscle tremors and artifacts (95% efficiency).
- **Unit Broadcast**: Collaborative real-time waveform streaming across multiple devices.
- **Delta Analysis**: Predictive longitudinal comparison against historical patient baselines.
- **Export Vault**: Professional PDF clinical report generation.
- **Ingest Hub**: Retrospective analysis for .CSV and .EDF datasets.

## Device Compatibility
- **Universal Fluid UI**: Optimized for PC, Laptop, Tablets, and Smartphones.
- **Notch-Safe**: Built-in safe-area awareness for modern display hardware.
- **PWA**: Installable native app experience with splash screen and onboarding.

## Connectivity
- **Web Bluetooth**: Direct handshake with LE physiological sensors.
- **WebSocket**: Real-time alert broadcasting and unit-sync.
