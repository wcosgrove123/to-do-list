'use client';

import { useState, useEffect } from 'react';
import {
  getAIConfig,
  saveAIConfig,
  AVAILABLE_MODELS,
  MODEL_DISPLAY_NAMES,
  type AIConfig,
  type AIProvider,
} from '@/lib/ai/aiProvider';
import { testAIProvider } from '@/lib/ai/unifiedProvider';
import { validateClaudeAPIKey } from '@/lib/ai/claudeProvider';

export function ModelSettings() {
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setConfig(getAIConfig());
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setTestResult(null);

    try {
      // Validate Claude API key if using Claude
      if (config.provider === 'claude' && config.apiKey) {
        const isValid = await validateClaudeAPIKey(config.apiKey);
        if (!isValid) {
          setTestResult({
            success: false,
            message: 'Invalid Claude API key. Please check your key and try again.',
          });
          setIsSaving(false);
          return;
        }
      }

      // Save configuration
      saveAIConfig(config);

      // Test connection
      const result = await testAIProvider();
      setTestResult(result);

      if (result.success) {
        setTimeout(() => {
          setIsOpen(false);
          setTestResult(null);
        }, 2000);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentModelName = MODEL_DISPLAY_NAMES[config.model] || config.model;

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="AI Model Settings"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Model Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI Provider
              </label>
              <select
                value={config.provider}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    provider: e.target.value as AIProvider,
                    model: AVAILABLE_MODELS[e.target.value as AIProvider][0],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="ollama">Ollama (Local, Free)</option>
                <option value="claude">Claude (Anthropic API)</option>
                <option value="openai">OpenAI (Coming Soon)</option>
              </select>
            </div>

            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                {AVAILABLE_MODELS[config.provider].map((model) => (
                  <option key={model} value={model}>
                    {MODEL_DISPLAY_NAMES[model] || model}
                  </option>
                ))}
              </select>
            </div>

            {/* Claude API Key */}
            {config.provider === 'claude' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Claude API Key
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
                  >
                    Get API Key →
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Claude Code Max includes $25/month API credits
                </p>
              </div>
            )}

            {/* Test Result */}
            {testResult && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  testResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                <p className="text-sm">{testResult.message}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Current:</strong> {currentModelName}
              </p>
              {config.provider === 'ollama' && (
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Make sure Ollama is running: <code>ollama serve</code>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Testing...' : 'Save & Test'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
