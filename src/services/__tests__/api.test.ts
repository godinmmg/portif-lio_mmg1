import axios from 'axios';
import { apiService } from '../api';
import { LoginCredentials, RegisterData } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiService', () => {
  const mockToken = 'mock-jwt-token';
  
  beforeEach(() => {
    // Limpar mocks e localStorage antes de cada teste
    jest.clearAllMocks();
    localStorage.clear();
    
    // Mock create do axios
    mockedAxios.create = jest.fn().mockReturnValue({
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso e salvar o token', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'user' as const,
              createdAt: new Date().toISOString(),
            },
            token: mockToken,
          },
        },
      };

      const mockApi = mockedAxios.create();
      (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

      // Recriar ApiService com o mock
      const api = new (apiService.constructor as any)();
      Object.setPrototypeOf(api, Object.getPrototypeOf(apiService));
      (api as any).api = mockApi;

      const result = await api.login(credentials);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.success).toBe(true);
      expect(result.data.token).toBe(mockToken);
    });

    it('deve lançar erro quando credenciais são inválidas', async () => {
      const credentials: LoginCredentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      const mockApi = mockedAxios.create();
      (mockApi.post as jest.Mock).mockRejectedValue({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Credenciais inválidas',
          },
        },
      });

      const api = new (apiService.constructor as any)();
      (api as any).api = mockApi;

      await expect(api.login(credentials)).rejects.toMatchObject({
        response: {
          status: 401,
        },
      });
    });
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const registerData: RegisterData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '2',
              name: 'New User',
              email: 'new@example.com',
              role: 'user' as const,
              createdAt: new Date().toISOString(),
            },
            token: mockToken,
          },
        },
      };

      const mockApi = mockedAxios.create();
      (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const api = new (apiService.constructor as any)();
      (api as any).api = mockApi;

      const result = await api.register(registerData);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe(registerData.email);
    });
  });

  describe('getTasks', () => {
    it('deve buscar tarefas com sucesso', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              _id: '1',
              title: 'Test Task',
              status: 'pending',
              priority: 'high',
              user: '1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1,
          },
        },
      };

      const mockApi = mockedAxios.create();
      (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

      const api = new (apiService.constructor as any)();
      (api as any).api = mockApi;

      const result = await api.getTasks({ page: 1, limit: 10 });

      expect(mockApi.get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 10 },
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('createTask', () => {
    it('deve criar uma tarefa com sucesso', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'medium' as const,
        status: 'pending' as const,
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            _id: '2',
            ...taskData,
            user: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };

      const mockApi = mockedAxios.create();
      (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const api = new (apiService.constructor as any)();
      (api as any).api = mockApi;

      const result = await api.createTask(taskData);

      expect(mockApi.post).toHaveBeenCalledWith('/tasks', taskData);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe(taskData.title);
    });
  });

  describe('deleteTask', () => {
    it('deve deletar uma tarefa com sucesso', async () => {
      const taskId = '1';
      const mockResponse = {
        data: {
          success: true,
          message: 'Tarefa deletada com sucesso',
        },
      };

      const mockApi = mockedAxios.create();
      (mockApi.delete as jest.Mock).mockResolvedValue(mockResponse);

      const api = new (apiService.constructor as any)();
      (api as any).api = mockApi;

      const result = await api.deleteTask(taskId);

      expect(mockApi.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
      expect(result.success).toBe(true);
    });
  });

  describe('logout', () => {
    it('deve remover o token do localStorage', () => {
      localStorage.setItem('token', mockToken);
      
      apiService.logout();

      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});

