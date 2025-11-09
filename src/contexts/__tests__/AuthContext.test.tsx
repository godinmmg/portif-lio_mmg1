import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import apiService from '../../services/api';

// Mock do apiService
jest.mock('../../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('deve inicializar com usuário null e não autenticado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('deve fazer login com sucesso', async () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };

    const mockToken = 'fake-jwt-token';

    mockedApiService.login.mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('deve lançar erro ao falhar login', async () => {
    mockedApiService.login.mockRejectedValue({
      response: {
        data: {
          message: 'Credenciais inválidas',
        },
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      result.current.login('wrong@example.com', 'wrongpass')
    ).rejects.toThrow('Credenciais inválidas');

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('deve fazer registro com sucesso', async () => {
    const mockUser = {
      _id: '2',
      name: 'New User',
      email: 'new@example.com',
    };

    const mockToken = 'new-jwt-token';

    mockedApiService.register.mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('New User', 'new@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('deve fazer logout corretamente', async () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };

    mockedApiService.login.mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'token',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Fazer login primeiro
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Fazer logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('deve restaurar sessão do localStorage ao inicializar', () => {
    const mockUser = {
      _id: '1',
      name: 'Stored User',
      email: 'stored@example.com',
    };

    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('deve atualizar dados do usuário', async () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };

    const updatedUser = {
      ...mockUser,
      name: 'Updated Name',
    };

    mockedApiService.login.mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'token',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login primeiro
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    // Atualizar usuário
    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(result.current.user?.name).toBe('Updated Name');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(updatedUser));
  });

  it('deve lançar erro ao usar useAuth fora do AuthProvider', () => {
    // Suprimir console.error para este teste
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth deve ser usado dentro de um AuthProvider');

    consoleSpy.mockRestore();
  });
});

