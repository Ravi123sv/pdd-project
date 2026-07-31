`# NeuroSignal Clinical Workstation Technical Manual

## Overview
NeuroSignal Enterprise v2.5 is a high-fidelity neural waveform analysis platform.

## System Components
1. **Frontend**: Next.js 14 Workstation UI.
2. **Backend**: Express.js Clinical Hub.
3. **Signal Engine**: Go-based high-throughput streamer.
4. **AI**: Gemini 1.5 Pro Neural Logic Unit.

## Authentication
- **Institutional**: Google ID + Master Clinical Key.
- **Private**: Google ID + 6-Digit Email OTP.

## Hardware Link
Supports Web Bluetooth and Web Serial protocols for direct clinical sensor acquisition.
