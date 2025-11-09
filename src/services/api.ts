import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  Task,
  TaskFormData,
  TaskStats,
  LoginCredentials,
  RegisterData,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  }

  async getMe(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  // Task endpoints
  async getTasks(params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> {
    const response = await this.api.get<PaginatedResponse<Task>>('/tasks', { params });
    return response.data;
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    const response = await this.api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: TaskFormData): Promise<ApiResponse<Task>> {
    const response = await this.api.post<ApiResponse<Task>>('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: Partial<TaskFormData>): Promise<ApiResponse<Task>> {
    const response = await this.api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/tasks/${id}`);
    return response.data;
  }

  async getTaskStats(): Promise<ApiResponse<TaskStats>> {
    const response = await this.api.get<ApiResponse<TaskStats>>('/tasks/stats');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

