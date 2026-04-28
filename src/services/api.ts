import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { toast } from 'sonner';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post('/users/register', { name, email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (name: string) => {
    const response = await apiClient.put('/users/profile', { name });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.put('/users/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

// Investment Services
export const investmentService = {
  getTypes: async () => {
    const response = await apiClient.get('/investments/types');
    return response.data;
  },

  getAll: async (params?: { type_id?: string; search?: string }) => {
    const response = await apiClient.get('/investments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/investments/${id}`);
    return response.data;
  },

  create: async (data: {
    type_id: number;
    asset_name: string;
    asset_symbol?: string;
    quantity: number;
    buy_price: number;
    current_price?: number;
    purchase_date: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/investments', data);
    return response.data;
  },

  update: async (id: string, data: {
    current_price?: number;
    notes?: string;
    is_active?: boolean;
  }) => {
    const response = await apiClient.put(`/investments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/investments/${id}`);
    return response.data;
  },

  sell: async (id: string, data: {
    quantity: number;
    sell_price: number;
    notes?: string;
  }) => {
    const response = await apiClient.post(`/investments/${id}/sell`, data);
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  getSummary: async () => {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  },

  getByType: async () => {
    const response = await apiClient.get('/dashboard/by-type');
    return response.data;
  },

  getMonthly: async () => {
    const response = await apiClient.get('/dashboard/monthly');
    return response.data;
  },

  getTopPerformers: async (limit?: number) => {
    const response = await apiClient.get('/dashboard/top-performers', { params: { limit } });
    return response.data;
  },

  getRecentTransactions: async (limit?: number) => {
    const response = await apiClient.get('/dashboard/recent-transactions', { params: { limit } });
    return response.data;
  },

  getCompleteDashboard: async () => {
    const response = await apiClient.get('/dashboard/complete');
    return response.data;
  },
};

export default apiClient;
