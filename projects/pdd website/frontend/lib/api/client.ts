import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
    loginWithKey: (clinicalKey: string) => apiClient.post('/auth/login-key', { clinicalKey }),
    getProfile: (uid: string) => apiClient.get(`/auth/profile/${uid}`),
    getTeam: (hospitalId: string) => apiClient.get(`/auth/hospital-team/${hospitalId}`),
  },
  assets: {
    getAll: (hospitalId: string) => apiClient.get(`/assets/${hospitalId}`),
    reportMalfunction: (id: string, data: any) => apiClient.post(`/assets/malfunction/${id}`, data),
  },
  patients: {
    getAll: (hospitalId: string) => apiClient.get(`/patients/${hospitalId}`),
    syncSQL: (data: any) => apiClient.post('/sql/sync-patient', data),
    syncSessionSQL: (data: any) => apiClient.post('/sql/sync-session', data),
  },
  signals: {
    stream: (data: any) => goClient.post('/go/stream', data),
    analyze: (data: any) => apiClient.post('/signals/analyze', data),
  }
};
