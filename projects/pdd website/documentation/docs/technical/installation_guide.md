# NeuroSignal AI — Installation & Setup Guide

## 1. Prerequisites
Before installing the NeuroSignal AI ecosystem, ensure your workstation meets the following requirements:
- **Flutter SDK**: v3.24.3 or higher.
- **Dart SDK**: v3.5.3 or higher.
- **Node.js**: v18.x or higher (for REST backend).
- **Go**: v1.21 or higher (for high-speed streamer).
- **Android Studio**: Ladybug or later with Android SDK 35.
- **Database**: PostgreSQL and MongoDB instances (or access to Neon/Atlas).

## 2. Flutter Client Setup
1. Clone the repository and navigate to the project root.
2. Fetch dependencies:
   ```bash
   flutter pub get
   ```
3. (Android Only) Ensure `local.properties` contains the correct path to your Flutter SDK.
4. (Optional) Inject Gemini API Key during build:
   ```bash
   flutter run --dart-define=GEMINI_API_KEY=your_api_key
   ```

## 3. Node.js Backend (REST Relay)
1. Navigate to the `server/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the provided template:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/neurosignal
   USE_POSTGRES=true
   DATABASE_URL=postgresql://user:pass@localhost:5432/neuro_master
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

## 4. Go Streamer (High-Speed Link)
1. Navigate to the `gin-server/` directory.
2. Start the streamer on port 8081:
   ```bash
   go run main.go
   ```

## 5. Deployment Checklist
- [ ] Firebase project initialized.
- [ ] `google-services.json` placed in `android/app/`.
- [ ] SQLCipher dependencies resolved in Gradle.
- [ ] Network endpoints accessible from the mobile device.
