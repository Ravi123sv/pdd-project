# NeuroSignal AI — Clinical API Documentation (v2.5)

## 1. REST Relay Endpoints (Node.js)
The REST server handles institutional master indexing and audit synchronization.

| Endpoint | Method | Description | Auth |
| :--- | :--- | :--- | :--- |
| `/api/auth/login-key` | `POST` | Authenticate using institutional Clinical Access Key. | None |
| `/api/patients/:hospId` | `GET` | Retrieve patient registry for a specific institution. | JWT |
| `/api/sql/sync-patient` | `POST` | Sync local patient record to PostgreSQL Master Index. | Internal |
| `/api/assets/:hospId` | `GET` | Retrieve institutional asset/inventory status. | JWT |

## 2. High-Speed Streamer (Go)
Designed for high-concurrency binary telemetry ingestion.

### `POST /api/go/stream`
**Payload**:
```json
{
  "patient_id": "MRN-12345",
  "source": "flutter_workstation",
  "values": [0.5, 0.42, 0.38, ...],
  "timestamp": "2024-07-23T18:00:00Z"
}
```
**Response**: `200 OK` with ingestion confirmation.

## 3. WebSocket Channels (Socket.io)
Used for multi-unit collaboration and network-wide alerts.

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join_channel` | Client -> Server | `channelName` | Connect to a specific hospital wing. |
| `send_message` | Client <-> Server | `ChatMessage` | Real-time chat between clinicians. |
| `trigger_red_alert` | Client -> Server | `AlertData` | Broadcast emergency alert globally. |

## 4. HL7 FHIR Interoperability
The `FhirService` generates v4.0.1 compliant JSON bundles for EMR gateways.
- **Resource Types**: `Patient`, `Observation`, `Device`, `DiagnosticReport`.
- **Coding System**: LOINC for biometric observations.
