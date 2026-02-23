'use client';

import type { CategorizationResult } from '@/lib/ai/ollama';
import { format } from 'date-fns';

interface ActionPreviewProps {
  action: CategorizationResult;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ActionPreview({ action, onConfirm, onCancel }: ActionPreviewProps) {
  const isLowConfidence = action.confidence < 0.8;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Ready to create {action.category === 'task' ? 'task' : 'event'}?
      </h3>

      {/* Preview card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 space-y-2">
        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            Title
          </span>
          <p className="text-gray-900 dark:text-white font-medium">{action.title}</p>
        </div>

        {action.project && (
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Project
            </span>
            <p className="text-gray-900 dark:text-white">{action.project}</p>
          </div>
        )}

        {action.dueDate && (
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Due Date
            </span>
            <p className="text-gray-900 dark:text-white">
              {format(new Date(action.dueDate), 'PPP')}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Priority
            </span>
            <p className="text-gray-900 dark:text-white">
              {action.priority} / 5
            </p>
          </div>

          {action.tags.length > 0 && (
            <div className="flex-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Tags
              </span>
              <div className="flex gap-1 flex-wrap mt-1">
                {action.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Low confidence warning */}
      {isLowConfidence && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-2 mb-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> I'm not very confident about this categorization ({Math.round(action.confidence * 100)}%).
            Please review before confirming.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
