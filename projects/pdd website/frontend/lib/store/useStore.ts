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

  // Actions
  setAuth: (isAuthenticated: boolean, user: UserProfile | null) => void;
  setNavIndex: (index: number) => void;
  setHardwareStatus: (status: boolean) => void;
  setNetworkStatus: (status: 'Connected' | 'Offline', latency?: number) => void;
  setActivePatient: (patient: any) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  currentNavIndex: 0,
  isHardwareConnected: false,
  networkStatus: 'Connected',
  latencyMs: 0,
  activePatient: null,

  setAuth: (isAuthenticated, user) => set({ isAuthenticated, user }),
  setNavIndex: (index) => set({ currentNavIndex: index }),
  setHardwareStatus: (status) => set({ isHardwareConnected: status }),
  setNetworkStatus: (status, latency = 0) => set({ networkStatus: status, latencyMs: latency }),
  setActivePatient: (patient) => set({ activePatient: patient }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
    }
    set({ isAuthenticated: false, user: null, currentNavIndex: 0, activePatient: null });
  }
}));
