import React from 'react';
import { Task } from '../types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}

const priorityColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  urgent: '#9c27b0',
};

const statusLabels = {
  pending: 'Pendente',
  'in-progress': 'Em Progresso',
  completed: 'Concluída',
  archived: 'Arquivada',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusChange) {
      onStatusChange(task._id, e.target.value as Task['status']);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="task-card" data-testid="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <div
          className="task-priority"
          style={{ backgroundColor: priorityColors[task.priority] }}
          data-testid="task-priority"
        >
          {task.priority}
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-status">
          <label htmlFor={`status-${task._id}`}>Status:</label>
          <select
            id={`status-${task._id}`}
            value={task.status}
            onChange={handleStatusChange}
            className="status-select"
            data-testid="status-select"
          >
            <option value="pending">Pendente</option>
            <option value="in-progress">Em Progresso</option>
            <option value="completed">Concluída</option>
            <option value="archived">Arquivada</option>
          </select>
        </div>

        {task.dueDate && (
          <div className="task-due-date">
            <span>Vencimento:</span>
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-actions">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="btn btn-edit"
            data-testid="edit-button"
          >
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="btn btn-delete"
            data-testid="delete-button"
          >
            Deletar
          </button>
        )}
      </div>

      <div className="task-footer">
        <small>Criado em: {formatDate(task.createdAt)}</small>
        {task.completedAt && (
          <small>Concluído em: {formatDate(task.completedAt)}</small>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

