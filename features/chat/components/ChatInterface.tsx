'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ActionPreview } from './ActionPreview';
import type { ChatMessageUI } from '../types';
import { categorizeInput } from '@/lib/ai/unifiedProvider';
import { eventBus } from '@/lib/events/EventBus';

const USER_ID = process.env.NEXT_PUBLIC_USER_ID || '00000000-0000-0000-0000-000000000000';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessageUI = {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      content: input.trim(),
      role: 'user',
      action_type: null,
      action_payload: undefined,
      ai_confidence: null,
      was_helpful: null,
      feedback_text: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Categorize input with AI
      const categorization = await categorizeInput(userMessage.content);

      // Create assistant message with categorization
      const assistantMessage: ChatMessageUI = {
        id: crypto.randomUUID(),
        user_id: USER_ID,
        content: `I understood this as a **${categorization.category}**: "${categorization.title}"`,
        role: 'assistant',
        action_type: `CREATE_${categorization.category.toUpperCase()}`,
        action_payload: categorization,
        ai_confidence: categorization.confidence,
        was_helpful: null,
        feedback_text: null,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentAction(categorization);

      // Emit chat event
      eventBus.emit('chat:message_sent', { message: assistantMessage });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessageUI = {
        id: crypto.randomUUID(),
        user_id: USER_ID,
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        role: 'assistant',
        action_type: null,
        action_payload: undefined,
        ai_confidence: null,
        was_helpful: null,
        feedback_text: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = () => {
    if (!currentAction) return;

    eventBus.emit('chat:action_confirmed', {
      actionType: currentAction.category,
      payload: currentAction,
    });

    // Clear current action after confirmation
    setCurrentAction(null);

    // Add confirmation message
    const confirmMessage: ChatMessageUI = {
      id: crypto.randomUUID(),
      user_id: USER_ID,
      content: `✓ ${currentAction.category === 'task' ? 'Task' : 'Event'} created successfully!`,
      role: 'assistant',
      action_type: null,
      action_payload: undefined,
      ai_confidence: null,
      was_helpful: null,
      feedback_text: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  const handleCancelAction = () => {
    setCurrentAction(null);
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">Start typing to create tasks, events, or notes</p>
            <p className="text-sm">
              Try: "Buy groceries tomorrow" or "Swim practice Tuesday 6pm"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action preview */}
      {currentAction && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <ActionPreview
            action={currentAction}
            onConfirm={handleConfirmAction}
            onCancel={handleCancelAction}
          />
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="What do you need to do?"
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
