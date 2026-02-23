'use client';

import { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { getTasks, isUsingMemoryStore } from '../services/taskService';
import { eventBus } from '@/lib/events/EventBus';
import type { Task } from '@/lib/db/supabase';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [usingMemory, setUsingMemory] = useState(false);

  // Load tasks
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const filters = filter === 'all' ? {} : { status: [filter] };
      const data = await getTasks(filters);
      setTasks(data);
      setError(null);
      setUsingMemory(isUsingMemoryStore());
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [filter]);

  // Listen for task events
  useEffect(() => {
    const unsubscribe = eventBus.on('task:created', () => {
      loadTasks();
    });

    const unsubscribeUpdate = eventBus.on('task:updated', () => {
      loadTasks();
    });

    const unsubscribeDelete = eventBus.on('task:deleted', () => {
      loadTasks();
    });

    return () => {
      unsubscribe();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, []);

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-4">
        {error}
      </div>
    );
  }

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const filteredTasks = filter === 'all' ? tasks : tasksByStatus[filter] || [];

  return (
    <div className="h-[600px] flex flex-col">
      {/* Memory mode banner */}
      {usingMemory && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-xs text-yellow-800 dark:text-yellow-200">
          Running in memory mode — tasks won't persist after page refresh. Start Docker + Supabase to enable persistence.
        </div>
      )}
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: 'All', count: tasks.length },
          { key: 'todo', label: 'To Do', count: tasksByStatus.todo.length },
          { key: 'in_progress', label: 'In Progress', count: tasksByStatus.in_progress.length },
          { key: 'done', label: 'Done', count: tasksByStatus.done.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">No tasks yet</p>
            <p className="text-sm">Create your first task using the chat!</p>
          </div>
        ) : (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} onUpdate={loadTasks} />)
        )}
      </div>
    </div>
  );
}
