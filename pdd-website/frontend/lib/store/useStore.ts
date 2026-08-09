import { create } from 'zustand';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'technician' | 'doctor';
  userType: 'hospital' | 'individual';
  hospitalId?: string;
  hospitalName?: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  currentNavIndex: number;
  isHardwareConnected: boolean;
  networkStatus: 'Connected' | 'Offline';
  latencyMs: number;
  activePatient: any | null;
  language: 'en' | 'es';
  settings: {
      backendUrl: string;
      aiEnabled: boolean;
      encryptionEnabled: boolean;
  };

  // Actions
  setAuth: (isAuthenticated: boolean, user: UserProfile | null) => void;
  setNavIndex: (index: number) => void;
  setHardwareStatus: (status: boolean) => void;
  setNetworkStatus: (status: 'Connected' | 'Offline', latency?: number) => void;
  setActivePatient: (patient: any) => void;
  setLanguage: (lang: 'en' | 'es') => void;
  setSettings: (settings: Partial<AppState['settings']>) => void;
  logout: () => void;
  checkSession: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  currentNavIndex: 0,
  isHardwareConnected: false,
  networkStatus: 'Connected',
  latencyMs: 0,
  activePatient: null,
  language: 'en',
  settings: {
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'https://neurosignal-clinical-hub.onrender.com/api',
      aiEnabled: true,
      encryptionEnabled: true,
  },

  setAuth: (isAuthenticated, user) => {
      console.log("[STORE] Updating Auth State:", isAuthenticated, user?.email);
      // For individual practitioners, use their UID as the data bucket ID
      if (user && user.userType === 'individual' && !user.hospitalId) {
          user.hospitalId = `IND-${user.uid.slice(-6).toUpperCase()}`;
          user.hospitalName = "Private Clinic";
      }
      set({ isAuthenticated, user });
  },

  setNavIndex: (index) => set({ currentNavIndex: index }),
  setHardwareStatus: (status) => set({ isHardwareConnected: status }),
  setNetworkStatus: (status, latency = 0) => set({ networkStatus: status, latencyMs: latency }),
  setLanguage: (lang) => set({ language: lang }),

  setActivePatient: (patient) => {
      set({ activePatient: patient });
      if (typeof window !== 'undefined') {
          if (patient) localStorage.setItem('active_clinical_patient', JSON.stringify(patient));
          else localStorage.removeItem('active_clinical_patient');
      }
  },

  setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  checkSession: () => {
    if (typeof window !== 'undefined') {
      // 1. Restore User Session
      const saved = localStorage.getItem('user_session');
      if (saved) {
          try {
              const { user } = JSON.parse(saved);
              console.log("[STORE] Restoring Session for:", user.email);
              set({ isAuthenticated: true, user });
          } catch (e) {
              console.error("[STORE] Failed to restore session", e);
              localStorage.removeItem('user_session');
          }
      }

      // 2. Restore Active Patient
      const savedPatient = localStorage.getItem('active_clinical_patient');
      if (savedPatient) {
          try {
              set({ activePatient: JSON.parse(savedPatient) });
          } catch (e) {
              localStorage.removeItem('active_clinical_patient');
          }
      }
    }
  },

  logout: () => {
    console.log("[STORE] Logging out...");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
      localStorage.removeItem('active_clinical_patient');
    }
    set({ isAuthenticated: false, user: null, currentNavIndex: 0, activePatient: null });
  }
}));
