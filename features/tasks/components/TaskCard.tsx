'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { Task } from '@/lib/db/supabase';
import { updateTask, deleteTask } from '../services/taskService';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: Task['status']) => {
    try {
      setIsUpdating(true);
      await updateTask({ id: task.id, status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setIsUpdating(true);
      await deleteTask(task.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsUpdating(false);
    }
  };

  const priorityColors = {
    1: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    2: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    3: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    4: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    5: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
  };

  const statusOptions: { value: Task['status']; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {task.description}
            </p>
          )}
        </div>

        {/* Priority badge */}
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            priorityColors[task.priority as keyof typeof priorityColors] || priorityColors[3]
          }`}
        >
          P{task.priority}
        </span>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
        {task.due_date && (
          <span className="flex items-center gap-1">
            <span>Due:</span>
            <span className="font-medium">
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          </span>
        )}

        {task.ai_generated && (
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded">
            AI Generated
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
          disabled={isUpdating}
          className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded text-gray-900 dark:text-white disabled:opacity-50"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleDelete}
          disabled={isUpdating}
          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
