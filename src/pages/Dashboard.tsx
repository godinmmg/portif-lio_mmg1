import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/TaskCard';
import { Task, TaskFormData } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: '',
    priority: 'medium',
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask(newTask);
      setShowCreateModal(false);
      setNewTask({ title: '', priority: 'medium' });
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      await updateTask(id, { status });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        await deleteTask(id);
      } catch (err) {
        console.error('Erro ao deletar tarefa:', err);
      }
    }
  };

  const handleFilter = (newFilter: typeof filter) => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      fetchTasks();
    } else {
      fetchTasks(1, { status: newFilter });
    }
  };

  // Estatísticas
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="dashboard-container" data-testid="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📊 Task Manager</h1>
          <div className="header-actions">
            <span data-testid="user-name">Olá, {user?.name}!</span>
            <button
              onClick={handleLogout}
              className="btn-logout"
              data-testid="logout-button"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="stats-section">
        <div className="stat-card" data-testid="stat-total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card" data-testid="stat-pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card" data-testid="stat-progress">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">Em Progresso</div>
        </div>
        <div className="stat-card" data-testid="stat-completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Concluídas</div>
        </div>
      </section>

      {/* Filters and Create Button */}
      <section className="actions-section">
        <div className="filters">
          <button
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilter('all')}
            data-testid="filter-all"
          >
            Todas
          </button>
          <button
            className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilter('pending')}
            data-testid="filter-pending"
          >
            Pendentes
          </button>
          <button
            className={filter === 'in-progress' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilter('in-progress')}
            data-testid="filter-progress"
          >
            Em Progresso
          </button>
          <button
            className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => handleFilter('completed')}
            data-testid="filter-completed"
          >
            Concluídas
          </button>
        </div>
        <button
          className="btn-create"
          onClick={() => setShowCreateModal(true)}
          data-testid="create-task-button"
        >
          + Nova Tarefa
        </button>
      </section>

      {/* Tasks List */}
      <section className="tasks-section">
        {loading && <div className="loading" data-testid="loading">Carregando...</div>}
        {error && <div className="error" data-testid="error">{error}</div>}
        
        {!loading && tasks.length === 0 && (
          <div className="empty-state" data-testid="empty-state">
            <p>Nenhuma tarefa encontrada</p>
            <button
              className="btn-create"
              onClick={() => setShowCreateModal(true)}
            >
              Criar primeira tarefa
            </button>
          </div>
        )}

        <div className="tasks-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </section>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay" data-testid="create-modal">
          <div className="modal-content">
            <h2>Nova Tarefa</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                  id="title"
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  required
                  data-testid="modal-title-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição (opcional)</label>
                <textarea
                  id="description"
                  value={newTask.description || ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                  data-testid="modal-description-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Prioridade</label>
                <select
                  id="priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value as Task['priority'],
                    })
                  }
                  data-testid="modal-priority-select"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                  data-testid="modal-cancel-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  data-testid="modal-submit-button"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

