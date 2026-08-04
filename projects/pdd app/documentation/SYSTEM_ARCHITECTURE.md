# NeuroSignal AI: System Architecture & Functionality

## 1. Clinical Definitions
*   **ECG (Electrocardiogram)**: A non-invasive test that records the electrical activity of the heart. It captures signals like the P-wave, QRS complex, and T-wave.
*   **EEG (Electroencephalogram)**: A test used to find problems related to electrical activity of the brain. It tracks and records brain wave patterns (Alpha, Beta, Delta, Theta).

---

## 2. Frontend Architecture (Flutter)
The frontend is built with **Flutter**, utilizing the following key components:

### Key Screens & Functions:
*   **`SplashScreen`**: Initial entry point; handles branding and session check.
*   **`LoginScreen`**: Secure authentication gateway using Firebase Auth.
*   **`MainShell`**: The layout orchestrator; manages responsive navigation (Sidebar/Drawer).
*   **`DashboardScreen`**: Provides high-level metrics and a real-time signal preview.
*   **`StandardMonitoringScreen`**: The core clinical tool for viewing live dual-stream waves.
*   **`FileUploadScreen`**: Handles local file browsing and ingestion of medical data.
*   **`OpticalScanScreen`**: Camera-based interface for digitizing physical paper charts.
*   **`PatientArchiveScreen`**: Database management for historical patient records.
*   **`SettingsScreen`**: System configuration and admin staff registration.

### State Management:
*   **`AppState`**: Global provider for user authentication, registry, and cross-screen navigation.
*   **`SessionController`**: Specialized provider for real-time monitoring sessions; pipes data from sensors to the UI.

---

## 3. Backend & Services (Real-Time)
The backend is a hybrid of local processing and cloud synchronization:

### Core Services:
*   **`SignalDataService`**: Direct interface with hardware (BLE/USB). It processes incoming bytes into numerical signal frames.
*   **`AiService`**: Powered by **Google Gemini 1.5 Flash**.
    *   `getRealTimeFeedback`: Provides diagnostic observations for live hardware streams.
    *   `digitizePaperChart`: Computer vision logic to extract waves from images.
*   **`BackendService`**: Gateway to Firebase.
    *   Syncs patient records to **Firestore**.
    *   Uploads raw signal files to **Cloud Storage (Blaze)**.
*   **`DiagnosisService`**: Local mathematical engine for pattern matching (Arrhythmias, Spikes).
*   **`SignalParser`**: Reads and interprets `.csv` and `.edf` file formats.

---

## 4. Hardware Integration
*   **Bluetooth LE**: Uses `flutter_blue_plus` for wireless sensor connections.
*   **USB/Serial**: (Optional/Simulated) Direct hardware link for stationary units.
*   **Camera**: Uses `image_picker` with AI vision for digitizing paper strips.

---

## 5. Security & Admin
*   **Admin Registry**: Exclusive portal in Settings (accessible only by the `main` account) to add new authorized clinical staff.
*   **End-to-End Encryption**: Simulated secure tunnel for all cloud-synced medical data.
