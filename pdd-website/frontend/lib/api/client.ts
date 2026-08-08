import axios from 'axios';

// Environment-aware API resolution
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // Production Cloud Hub: neurosignal-clinical-hub.onrender.com
    return isLocal ? 'http://localhost:5000/api' : 'https://neurosignal-clinical-hub.onrender.com/api';
  }
  return process.env.NODE_ENV === 'production' ? 'https://neurosignal-clinical-hub.onrender.com/api' : 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();
const GO_BASE_URL = process.env.NEXT_PUBLIC_GO_API_URL || 'http://localhost:8081/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const goClient = axios.create({
  baseURL: GO_BASE_URL,
  timeout: 5000,
});

// Auth Interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const { token } = JSON.parse(session);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Auth Interceptor Error", e);
      }
    }
  }
  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle Token Expiry
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_session');
        window.location.href = '/auth/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Specific API Mappings matching Flutter services
export const api = {
  auth: {
    loginWithKey: (clinicalKey: string, email: string) => apiClient.post('/auth/login-key', { clinicalKey, email }),
    registerHospital: (data: any) => apiClient.post('/auth/register-hospital', data),
    getProfile: (uid: string) => apiClient.get(`/auth/profile/${uid}`),
    getTeam: (hospitalId: string) => apiClient.get(`/auth/hospital-team/${hospitalId}`),
    authorizeStaff: (hospitalId: string, email: string, role: string) => apiClient.post('/auth/authorize-staff', { hospitalId, email, role }),
  },
  system: {
    seed: (hospitalId: string) => apiClient.post('/seed', { hospitalId }),
  },
  assets: {
    getAll: (hospitalId: string) => apiClient.get(`/assets/${hospitalId}`),
    reportMalfunction: (id: string, data: any) => apiClient.post(`/assets/malfunction/${id}`, data),
  },
  patients: {
    getAll: (hospitalId: string) => apiClient.get(`/patients/${hospitalId}`),
    syncSQL: (data: any) => apiClient.post('/patients/sync-sql', data),
  },
  signals: {
    stream: (data: any) => goClient.post('/go/stream', data),
    analyze: (data: any) => apiClient.post('/signals/analyze', data),
    analyzeAi: (data: any) => apiClient.post('/signals/analyze-ai', data),
    ingestAi: (data: any) => apiClient.post('/signals/ingest-ai', data),
    chatbot: (messages: any) => apiClient.post('/signals/chatbot', { messages }),
  },
  otp: {
    send: (email: string, name: string) => apiClient.post('/otp/send', { email, name }),
    verify: (email: string, otp: string) => apiClient.post('/otp/verify', { email, otp }),
  },
  sessions: {
    getAll: (hospitalId: string) => apiClient.get(`/sessions/${hospitalId}`),
    create: (data: any) => apiClient.post('/sessions', data),
    syncSessionSQL: (data: any) => apiClient.post('/sessions/sync-session', data),
    update: (id: string, data: any) => apiClient.put(`/sessions/${id}`, data),
  },
  payments: {
    createCheckoutSession: (priceId: string, email: string) => apiClient.post('/payments/create-checkout-session', { priceId, email }),
  }
};
