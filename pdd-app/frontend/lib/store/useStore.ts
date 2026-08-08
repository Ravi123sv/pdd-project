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
  settings: {
      backendUrl: process.env.NEXT_PUBLIC_API_URL || 'https://neurosignal-clinical-hub.onrender.com/api',
      aiEnabled: true,
      encryptionEnabled: true,
  },

  setAuth: (isAuthenticated, user) => {
      console.log("[STORE] Updating Auth State:", isAuthenticated, user?.email);
      set({ isAuthenticated, user });
  },

  setNavIndex: (index) => set({ currentNavIndex: index }),
  setHardwareStatus: (status) => set({ isHardwareConnected: status }),
  setNetworkStatus: (status, latency = 0) => set({ networkStatus: status, latencyMs: latency }),
  setActivePatient: (patient) => set({ activePatient: patient }),
  setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  checkSession: () => {
    if (typeof window !== 'undefined') {
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
    }
  },

  logout: () => {
    console.log("[STORE] Logging out...");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
    }
    set({ isAuthenticated: false, user: null, currentNavIndex: 0, activePatient: null });
  }
}));
