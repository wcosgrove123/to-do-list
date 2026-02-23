'use client';

import { useEffect } from 'react';
import { ChatInterface } from '@/features/chat/components/ChatInterface';
import { TaskList } from '@/features/tasks/components/TaskList';
import { initializeChatActions } from '@/features/chat/services/chatActions';
import { ModelSettings } from '@/components/ModelSettings';

export default function Home() {
  // Initialize chat actions on mount
  useEffect(() => {
    initializeChatActions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ADHD Productivity OS
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Chat-first task management for ADHD brains
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Chat
            </h2>
            <ChatInterface />
          </div>

          {/* Task List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Tasks
            </h2>
            <TaskList />
          </div>
        </div>
      </div>

      {/* Model Settings (floating button) */}
      <ModelSettings />
    </div>
  );
}
