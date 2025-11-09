import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Dashboard } from '../Dashboard';
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

describe('Dashboard Page', () => {
  const mockTasks = [
    {
      _id: '1',
      title: 'Tarefa 1',
      status: 'pending' as const,
      priority: 'high' as const,
      user: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'Tarefa 2',
      status: 'in-progress' as const,
      priority: 'medium' as const,
      user: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '3',
      title: 'Tarefa 3',
      status: 'completed' as const,
      priority: 'low' as const,
      user: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
    localStorage.setItem('token', 'fake-token');

    mockedApiService.getTasks.mockResolvedValue({
      success: true,
      data: mockTasks,
      pagination: {
        page: 1,
        limit: 10,
        total: 3,
        pages: 1,
      },
    });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('deve renderizar o dashboard', async () => {
    renderDashboard();

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByText(/Task Manager/i)).toBeInTheDocument();
  });

  it('deve exibir nome do usuário', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Olá, Test User!');
    });
  });

  it('deve exibir estatísticas corretas', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('stat-total')).toHaveTextContent('3');
      expect(screen.getByTestId('stat-pending')).toHaveTextContent('1');
      expect(screen.getByTestId('stat-progress')).toHaveTextContent('1');
      expect(screen.getByTestId('stat-completed')).toHaveTextContent('1');
    });
  });

  it('deve fazer logout e redirecionar', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('logout-button'));

    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('deve exibir loading ao carregar tarefas', () => {
    mockedApiService.getTasks.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderDashboard();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve exibir erro ao falhar busca', async () => {
    mockedApiService.getTasks.mockRejectedValue({
      response: {
        data: {
          message: 'Erro ao buscar tarefas',
        },
      },
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });

  it('deve exibir empty state quando não há tarefas', async () => {
    mockedApiService.getTasks.mockResolvedValue({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
      },
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Nenhuma tarefa encontrada')).toBeInTheDocument();
    });
  });

  it('deve filtrar tarefas por status', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('filter-pending')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filter-pending'));

    await waitFor(() => {
      expect(mockedApiService.getTasks).toHaveBeenCalledWith({
        status: 'pending',
        page: 1,
        limit: 10,
      });
    });
  });

  it('deve abrir modal de criar tarefa', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('create-task-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('create-task-button'));

    await waitFor(() => {
      expect(screen.getByTestId('create-modal')).toBeInTheDocument();
      expect(screen.getByText('Nova Tarefa')).toBeInTheDocument();
    });
  });

  it('deve criar nova tarefa', async () => {
    const newTask = {
      _id: '4',
      title: 'Nova Tarefa',
      status: 'pending' as const,
      priority: 'medium' as const,
      user: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockedApiService.createTask.mockResolvedValue({
      success: true,
      data: newTask,
    });

    renderDashboard();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('create-task-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('modal-title-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('modal-title-input'), {
      target: { value: 'Nova Tarefa' },
    });

    fireEvent.click(screen.getByTestId('modal-submit-button'));

    await waitFor(() => {
      expect(mockedApiService.createTask).toHaveBeenCalledWith({
        title: 'Nova Tarefa',
        priority: 'medium',
      });
    });
  });

  it('deve fechar modal ao cancelar', async () => {
    renderDashboard();

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('create-task-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('create-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('modal-cancel-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
    });
  });

  it('deve deletar tarefa com confirmação', async () => {
    window.confirm = jest.fn(() => true);

    mockedApiService.deleteTask.mockResolvedValue({
      success: true,
      message: 'Tarefa deletada',
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByTestId('task-card')).toHaveLength(3);
    });

    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockedApiService.deleteTask).toHaveBeenCalledWith('1');
    });
  });
});

