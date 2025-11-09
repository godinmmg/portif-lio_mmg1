import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskCard } from '../TaskCard';
import { Task } from '../../types';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'high',
    tags: ['urgent', 'backend'],
    user: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('deve renderizar corretamente', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('task-priority')).toHaveTextContent('high');
  });

  it('deve exibir as tags', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('backend')).toBeInTheDocument();
  });

  it('deve chamar onEdit quando clicar em Editar', () => {
    const handleEdit = jest.fn();
    render(<TaskCard task={mockTask} onEdit={handleEdit} />);

    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledWith(mockTask);
  });

  it('deve chamar onDelete quando clicar em Deletar', () => {
    const handleDelete = jest.fn();
    render(<TaskCard task={mockTask} onDelete={handleDelete} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it('deve chamar onStatusChange ao mudar o status', () => {
    const handleStatusChange = jest.fn();
    render(<TaskCard task={mockTask} onStatusChange={handleStatusChange} />);

    const statusSelect = screen.getByTestId('status-select') as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    expect(handleStatusChange).toHaveBeenCalledWith('1', 'completed');
  });

  it('não deve renderizar botões quando callbacks não são fornecidos', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  it('deve formatar datas corretamente', () => {
    const taskWithDueDate: Task = {
      ...mockTask,
      dueDate: '2024-12-31T00:00:00.000Z',
    };

    render(<TaskCard task={taskWithDueDate} />);

    expect(screen.getByText(/31\/12\/2024/)).toBeInTheDocument();
  });

  it('não deve renderizar descrição se não existir', () => {
    const taskWithoutDescription: Task = {
      ...mockTask,
      description: undefined,
    };

    render(<TaskCard task={taskWithoutDescription} />);

    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('deve aplicar cor correta baseada na prioridade', () => {
    const { rerender } = render(<TaskCard task={mockTask} />);
    
    let priorityElement = screen.getByTestId('task-priority');
    expect(priorityElement).toHaveStyle({ backgroundColor: '#f44336' }); // high = red

    const lowPriorityTask: Task = { ...mockTask, priority: 'low' };
    rerender(<TaskCard task={lowPriorityTask} />);
    
    priorityElement = screen.getByTestId('task-priority');
    expect(priorityElement).toHaveStyle({ backgroundColor: '#4caf50' }); // low = green
  });

  it('deve exibir data de conclusão quando tarefa está completa', () => {
    const completedTask: Task = {
      ...mockTask,
      status: 'completed',
      completedAt: '2024-01-15T00:00:00.000Z',
    };

    render(<TaskCard task={completedTask} />);

    expect(screen.getByText(/Concluído em:/)).toBeInTheDocument();
  });
});

