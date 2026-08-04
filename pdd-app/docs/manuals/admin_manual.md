# NeuroSignal AI — Administrative & IT Manual

## 🛠️ 1. Technical Architecture
The system consists of three primary components:
1. **Flutter Workstation**: On-device processing and visualization.
2. **Node.js REST Relay**: Centralized audit logging and patient indexing.
3. **Go Streamer**: High-concurrency binary stream handling.

## 🔐 2. Security Configuration
### 2.1 Local Encryption (SQLCipher)
The local database (`neurosignal.db`) is encrypted using **AES-256**. The encryption key is derived from the user's **Clinical Access Key**.
- **Caution**: If a clinical key is lost, the local data for that session cannot be recovered without administrative intervention.

### 2.2 Access Control
Use the **Organization Console** to:
- Generate new **Clinical Access Keys** for staff.
- **Revoke Access** immediately if a security breach is suspected.

## 📊 3. Maintenance & Monitoring
### 3.1 Backend Health
Check the server logs at:
- `server/index.js` (REST/SQL Relay)
- `gin-server/main.go` (Binary Streamer)

### 3.2 Audit Trails
All clinical actions (logins, exports, alerts) are mirrored to:
1. The local **Audit Log** screen.
2. The central **MongoDB** instance for permanent regulatory archiving.

## 🚀 4. Deployment Requirements
- **Android SDK**: Target 35.
- **Firebase**: Requires Firestore and Storage buckets.
- **PostgreSQL**: Required for the Enterprise Master Index.
- **Hardware**: Bluetooth Low Energy (BLE) supported medical sensors.

---
© 2024 NeuroSignal AI. Administrative Portal.
