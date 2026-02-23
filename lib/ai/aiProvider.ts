/**
 * AI Provider abstraction - supports multiple LLM backends
 */

export type AIProvider = 'ollama' | 'claude' | 'openai';
export type OllamaModel = 'llama3.1' | 'llama3.2' | 'llama2' | 'mistral';
export type ClaudeModel = 'claude-sonnet-4-5' | 'claude-sonnet-3-5' | 'claude-haiku-4' | 'claude-opus-4';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string; // For Claude, OpenAI
  baseUrl?: string; // For custom endpoints
}

export interface AIResponse {
  category: 'task' | 'calendar_event' | 'email_draft' | 'note' | 'other';
  confidence: number;
  title: string;
  project: string | null;
  dueDate: string | null;
  priority: number;
  tags: string[];
  reasoning: string;
  alternatives?: Array<{
    category: string;
    confidence: number;
    reason: string;
  }>;
}

// Default configuration
export const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  model: 'llama3.1',
  baseUrl: 'http://localhost:11434',
};

// Available models per provider
export const AVAILABLE_MODELS: Record<AIProvider, string[]> = {
  ollama: ['llama3.1', 'llama3.2', 'llama2', 'mistral', 'codellama'],
  claude: [
    'claude-sonnet-4-5',
    'claude-sonnet-3-5',
    'claude-haiku-4',
    'claude-opus-4'
  ],
  openai: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
};

// Model display names
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'llama3.1': 'Llama 3.1 (Local)',
  'llama3.2': 'Llama 3.2 (Local)',
  'claude-sonnet-4-5': 'Claude Sonnet 4.5',
  'claude-sonnet-3-5': 'Claude Sonnet 3.5',
  'claude-haiku-4': 'Claude Haiku 4 (Fast)',
  'claude-opus-4': 'Claude Opus 4 (Best)',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-4': 'GPT-4',
};

/**
 * Get current AI configuration from localStorage
 */
export function getAIConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;

  const stored = localStorage.getItem('ai_config');
  if (!stored) return DEFAULT_CONFIG;

  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Save AI configuration to localStorage
 */
export function saveAIConfig(config: AIConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ai_config', JSON.stringify(config));
}

/**
 * Check if a model is available locally (Ollama)
 */
export async function checkModelAvailability(model: string): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    return data.models?.some((m: any) => m.name.includes(model)) || false;
  } catch {
    return false;
  }
}
