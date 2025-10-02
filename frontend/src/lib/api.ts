import axios from 'axios';
import Cookies from 'js-cookie';
import type { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  UpdateProfileData,
  ChangePasswordData,
  User,
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskResponse,
  TaskFilters,
  UserStats
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send cookies for HTTP-only auth
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      Cookies.remove('token');
      Cookies.remove('user');
      
      // Only redirect if we're not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 429) {
      // Rate limited - broadcast an event for UI toast
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('rate-limit'));
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Logout (server clears cookie)
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<{ message: string; user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Validate token
  validateToken: async (): Promise<{ message: string; user: User }> => {
    const response = await api.get('/auth/validate');
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  // Get all tasks
  getTasks: async (filters: TaskFilters = {}): Promise<TaskResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  // Get single task
  getTask: async (id: string): Promise<{ message: string; task: Task }> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (data: CreateTaskData): Promise<{ message: string; task: Task }> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData): Promise<{ message: string; task: Task }> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<{ message: string; task: { _id: string; title: string } }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Bulk operations
  bulkUpdate: async (taskIds: string[], operation: string, data?: any): Promise<{ message: string; modifiedCount: number }> => {
    const response = await api.post('/tasks/bulk', {
      taskIds,
      operation,
      data
    });
    return response.data;
  },
};

// Users API
export const usersApi = {
  // Get current user profile (alias)
  getMe: async (): Promise<{ message: string; user: User }> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Get user statistics
  getStats: async (): Promise<{ message: string; stats: UserStats }> => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Delete user account
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete('/users/me');
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ message: string; timestamp: string; environment: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;