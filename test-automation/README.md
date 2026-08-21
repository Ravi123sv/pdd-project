# NeuroSignal Enterprise AI: Platinum Test Automation Suite

This repository contains the complete automated testing ecosystem for the NeuroSignal clinical workstation.

## 🏗️ Project Structure
- **/tests/appium**: Native Android automation for the clinical handheld app.
- **/tests/selenium**: High-fidelity web workstation automation.
- **/tests/vulnerability**: "Red-Team" security scans (SQLi, Auth-Bypass, Info Exposure).
- **/tests/load**: k6-powered performance suite (300+ Unique Scenarios).

## 🚀 How to Run Locally

### 1. Prerequisites
- Python 3.10+
- Node.js (for Appium server)
- k6 (for load testing)
- Chrome / ChromeDriver (for Selenium)

### 2. Setup
```bash
pip install -r requirements.txt
```

### 3. Execute Suites
- **Web**: `pytest tests/selenium/`
- **Security**: `pytest tests/vulnerability/`
- **Mobile**: `pytest tests/appium/` (Requires running Appium server and Emulator)
- **Load**: `k6 run tests/load/k6_load_suite.js`

## 📊 CI/CD Automation
This project is fully integrated with **GitHub Actions**. Every push to `main` triggers a complete Platinum Audit, with HTML reports uploaded as artifacts.

## 🛡️ Security Note
Vulnerability tests are designed for authorized clinical auditing only. Do not perform against production environments without explicit permission.
