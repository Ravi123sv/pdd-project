# Master Test Case Document: NeuroSignal Enterprise AI

## 1. APPIUM MOBILE (Android)
| Test ID | Test Name | Description | Priority |
|---------|-----------|-------------|----------|
| MOB-001 | Cold Boot | Verify splash and landing logic | High |
| MOB-002 | Onboarding | Multi-step clinical intro flow | Med |
| MOB-003 | Quick Access | Auditor bypass verification | High |
| MOB-004 | Monitor Touch | Touch-target (44px) optimization | High |
| MOB-005 | ECG Modality | Real-time cardiac waveform acquisition | High |
| MOB-006 | EEG Modality | Spectral power density visualization | High |
| MOB-007 | EMG Modality | Muscle recruitment pattern rendering | Med |
| MOB-008 | Landscape Switch | UI response to device rotation | Low |

## 2. SELENIUM WEB
| Test ID | Test Name | Description | Priority |
|---------|-----------|-------------|----------|
| WEB-001 | Gateway Nav | Landing to login transition | High |
| WEB-002 | Master Login | NS-884920 Handshake verification | High |
| WEB-003 | Registry Search | Real-time MRN filtering | High |
| WEB-004 | Baseline Overlay | Visual morphology comparison test | Med |
| WEB-005 | PDF Export | Print-optimized report generation | Med |
| WEB-006 | Theme Sync | Light/Dark mode state persistence | Low |
| WEB-007 | i18n Switch | EN/ES dictionary real-time swap | Med |

## 3. VULNERABILITY (Security)
| Test ID | Test Name | Description | Priority |
|---------|-----------|-------------|----------|
| SEC-001 | SQLi Key | Attempt bypass via clinical key field | Critical |
| SEC-002 | Auth Gating | Access /patients without JWT token | Critical |
| SEC-003 | IDOR Session | Cross-hospital session update attempt | High |
| SEC-004 | Headers | Production security header validation | High |
| SEC-005 | CORS Check | Wildcard origin verification | Med |
| SEC-006 | Health Leak | Sensitive data leakage in /health | High |

## 4. LOAD TESTING (k6)
*Total Scenarios: 305 Unique Conditions*

### Read Operations (LOAD_001 - LOAD_050)
- **LOAD_001**: 10 VUs fetching Patient Registry (30s)
- **LOAD_002**: 20 VUs fetching Asset Inventory (30s)
- **LOAD_003**: 50 VUs Concurrent Alert History read
- ... (Varying VUs from 1 to 100, durations from 10s to 10m)

### Write Operations (LOAD_051 - LOAD_100)
- **LOAD_051**: 10 VUs committing ECG sessions
- **LOAD_052**: 5 VUs registering new patients (MRN Stress)
- **LOAD_053**: 15 VUs reporting equipment malfunctions
- ... (Different modalities: ECG, EEG, EMG)

### Auth Stress (LOAD_101 - LOAD_150)
- **LOAD_101**: Login spike (100 concurrent logins/sec)
- **LOAD_102**: Token refresh cycle load
- ... (Invalid key retry stress)

### Sustained Performance (LOAD_151 - LOAD_200)
- **LOAD_151**: 24hr Endurance simulation (Simulated 1 VU)
- **LOAD_152**: 8hr Shift load (Constant 5 VUs)
- ...

### Error Rate & Latency (LOAD_201 - LOAD_300+)
- **LOAD_201**: Network Throttling (3G simulation)
- **LOAD_202**: Database Handshake Timeout stress
- **LOAD_300**: Full Unit Mirroring (50 active mirrors)
- **LOAD_305**: Global Command Search throughput
