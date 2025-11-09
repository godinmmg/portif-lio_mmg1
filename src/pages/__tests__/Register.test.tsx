import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Register } from '../Register';
import { AuthProvider } from '../../contexts/AuthContext';
import apiService from '../../services/api';

// Mock do apiService
jest.mock('../../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('deve renderizar o formulário de registro', () => {
    renderRegister();

    expect(screen.getByTestId('register-page')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('deve permitir preencher todos os campos', () => {
    renderRegister();

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
    const confirmPasswordInput = screen.getByTestId('confirm-password-input') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'senha123' } });

    expect(nameInput.value).toBe('João Silva');
    expect(emailInput.value).toBe('joao@example.com');
    expect(passwordInput.value).toBe('senha123');
    expect(confirmPasswordInput.value).toBe('senha123');
  });

  it('deve criar conta com sucesso', async () => {
    const mockUser = {
      _id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
    };

    mockedApiService.register.mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'fake-token',
      },
    });

    renderRegister();

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockedApiService.register).toHaveBeenCalledWith('João Silva', 'joao@example.com', 'senha123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('deve validar nome mínimo de 3 caracteres', async () => {
    renderRegister();

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Jo' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Nome deve ter pelo menos 3 caracteres')).toBeInTheDocument();
    });

    expect(mockedApiService.register).not.toHaveBeenCalled();
  });

  it('deve validar senha mínima de 6 caracteres', async () => {
    renderRegister();

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: '12345' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: '12345' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });

    expect(mockedApiService.register).not.toHaveBeenCalled();
  });

  it('deve validar se senhas coincidem', async () => {
    renderRegister();

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'senha456' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
    });

    expect(mockedApiService.register).not.toHaveBeenCalled();
  });

  it('deve exibir erro ao falhar registro', async () => {
    mockedApiService.register.mockRejectedValue({
      response: {
        data: {
          message: 'Email já cadastrado',
        },
      },
    });

    renderRegister();

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'existente@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Email já cadastrado')).toBeInTheDocument();
    });
  });

  it('deve desabilitar campos durante o loading', async () => {
    mockedApiService.register.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderRegister();

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    const submitButton = screen.getByTestId('submit-button') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
    expect(screen.getByText('Criando conta...')).toBeInTheDocument();
  });

  it('deve ter link para página de login', () => {
    renderRegister();

    const loginLink = screen.getByTestId('login-link');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});

