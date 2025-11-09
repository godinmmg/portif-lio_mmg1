import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFormData } from '../types';
import apiService from '../services/api';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchTasks: (page?: number, filters?: { status?: string; priority?: string }) => Promise<void>;
  createTask: (data: TaskFormData) => Promise<void>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<{ status?: string; priority?: string }>({});

  const fetchTasks = useCallback(async (
    page: number = 1,
    filters: { status?: string; priority?: string } = {}
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getTasks({
        ...filters,
        page,
        limit: 10,
      });

      if (response.success) {
        setTasks(response.data);
        setTotalPages(response.pagination.pages);
        setCurrentPage(page);
        setCurrentFilters(filters);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar tarefas';
      setError(errorMessage);
      console.error('Erro ao buscar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (data: TaskFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.createTask(data);

      if (response.success) {
        // Atualizar lista de tarefas
        await fetchTasks(currentPage, currentFilters);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar tarefa';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, data: Partial<TaskFormData>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.updateTask(id, data);

      if (response.success) {
        // Atualizar tarefa na lista local
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === id ? { ...task, ...response.data } : task
          )
        );
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar tarefa';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.deleteTask(id);

      // Remover tarefa da lista local
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar tarefa';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = useCallback(async () => {
    await fetchTasks(currentPage, currentFilters);
  }, [fetchTasks, currentPage, currentFilters]);

  // Buscar tarefas ao montar o componente
  useEffect(() => {
    fetchTasks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tasks,
    loading,
    error,
    totalPages,
    currentPage,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
  };
};

export default useTasks;

