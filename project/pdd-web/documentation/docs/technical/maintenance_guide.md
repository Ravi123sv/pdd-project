# NeuroSignal AI — System Maintenance Guide

## 1. Routine Database Maintenance
### 1.1 SQLCipher Local Vault
- The `neurosignal.db` file is self-managing but should be periodically verified for integrity.
- **Backup**: Database backups must be performed within the encrypted environment to maintain HIPAA compliance.

### 1.2 Central Audit Logs (MongoDB)
- The audit collection in MongoDB should be rotated every 180 days according to clinical data retention policies.
- Ensure the `JWT_SECRET` in the `server/.env` is rotated annually.

## 2. Intelligence Model Updates
### 2.1 TFLite Edge Models
- To update the on-device inference models:
  1. Replace `ecg_processor.tflite` or `eeg_processor.tflite` in `assets/models/`.
  2. Increment the `versionCode` in `android/app/build.gradle`.
  3. Perform a mandatory QA cycle using the `testing/scripts/appium_suite.py`.

## 3. High-Speed Link Tuning
- The Go `gin-server` is configured for maximum concurrency. 
- **Monitoring**: Watch the server logs for `429 Too Many Requests` if the hospital network undergoes significant expansion.
- **Scaling**: For institutions with > 500 active monitors, consider deploying the Go link behind a Load Balancer with sticky sessions.

## 4. Troubleshooting Workflow
| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| "Maintenance Mode" Banner | Server Heartbeat Lost | Check Node.js server status and network routing. |
| DB Encryption Error | Key Derivation Failure | Verify the user's Clinical Access Key is valid. |
| AI Consultant Hanging | API Timeout | Rotate Gemini model or check internet bandwidth. |
