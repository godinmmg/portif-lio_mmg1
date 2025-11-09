import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../useTasks';
import apiService from '../../services/api';

// Mock do apiService
jest.mock('../../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('useTasks Hook', () => {
  const mockTasks = [
    {
      _id: '1',
      title: 'Task 1',
      status: 'pending' as const,
      priority: 'high' as const,
      user: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'Task 2',
      status: 'completed' as const,
      priority: 'low' as const,
      user: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar tarefas ao montar', async () => {
    mockedApiService.getTasks.mockResolvedValue({
      success: true,
      data: mockTasks,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      },
    });

    const { result } = renderHook(() => useTasks());

    // Inicialmente deve estar carregando
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
    expect(mockedApiService.getTasks).toHaveBeenCalledTimes(1);
  });

  it('deve criar uma nova tarefa', async () => {
    const newTask = {
      _id: '3',
      title: 'New Task',
      status: 'pending' as const,
      priority: 'medium' as const,
      user: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockedApiService.getTasks.mockResolvedValue({
      success: true,
      data: mockTasks,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      },
    });

    mockedApiService.createTask.mockResolvedValue({
      success: true,
      data: newTask,
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createTask({
        title: 'New Task',
        priority: 'medium',
      });
    });

    expect(mockedApiService.createTask).toHaveBeenCalledWith({
      title: 'New Task',
      priority: 'medium',
    });
  });

  it('deve atualizar uma tarefa existente', async () => {
    const updatedTask = {
      ...mockTasks[0],
      status: 'completed' as const,
    };

    mockedApiService.getTasks.mockResolvedValue({
      success: true,
      data: mockTasks,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      },
    });

    mockedApiService.updateTask.mockResolvedValue({
      success: true,
      data: updatedTask,
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateTask('1', { status: 'completed' });
    });

    expect(mockedApiService.updateTask).toHaveBeenCalledWith('1', {
      status: 'completed',
    });

    // Verificar se a tarefa foi atualizada na lista local
    const updatedTaskInList = result.current.tasks.find(t => t._id === '1');
    expect(updatedTaskInList?.status).toBe('completed');
  });

  it('deve deletar uma tarefa', async () => {
    mockedApiService.getTasks.mockResolvedValue({
      success: true,
      data: mockTasks,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
      },
    });

    mockedApiService.deleteTask.mockResolvedValue({
      success: true,
      message: 'Tarefa deletada',
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialLength = result.current.tasks.length;

    await act(async () => {
      await result.current.deleteTask('1');
    });

    expect(mockedApiService.deleteTask).toHaveBeenCalledWith('1');
    expect(result.current.tasks.length).toBe(initialLength - 1);
    expect(result.current.tasks.find(t => t._id === '1')).toBeUndefined();
  });

  it('deve tratar erros ao buscar tarefas', async () => {
    const errorMessage = 'Erro ao buscar tarefas';
    mockedApiService.getTasks.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.tasks).toEqual([]);
  });

  it('deve aplicar filtros ao buscar tarefas', async () => {
    mockedApiService.getTasks.mockResolvedValue({
      success: true,
      data: [mockTasks[0]], // Apenas tarefas pending
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.fetchTasks(1, { status: 'pending' });
    });

    expect(mockedApiService.getTasks).toHaveBeenCalledWith({
      status: 'pending',
      page: 1,
      limit: 10,
    });
  });
});

