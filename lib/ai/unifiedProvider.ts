/**
 * Unified AI Provider - routes to correct provider based on configuration
 */

import { categorizeInput as ollamaCategorize } from './ollama';
import { categorizeWithClaude } from './claudeProvider';
import { getAIConfig, type AIResponse } from './aiProvider';

/**
 * Categorize input using configured AI provider
 */
export async function categorizeInput(input: string): Promise<AIResponse> {
  const config = getAIConfig();

  try {
    switch (config.provider) {
      case 'ollama':
        return await ollamaCategorize(input);

      case 'claude':
        if (!config.apiKey) {
          throw new Error('Claude API key not configured');
        }
        return await categorizeWithClaude(input, config.model, config.apiKey);

      case 'openai':
        // TODO: Implement OpenAI provider
        throw new Error('OpenAI provider not yet implemented');

      default:
        // Fallback to Ollama
        return await ollamaCategorize(input);
    }
  } catch (error) {
    console.error('[UnifiedProvider] Error:', error);

    // Fallback: return basic categorization
    return {
      category: 'task',
      confidence: 0.5,
      title: input.slice(0, 100),
      project: null,
      dueDate: null,
      priority: 3,
      tags: [],
      reasoning: `Fallback categorization due to ${config.provider} error: ${error}`,
      alternatives: [],
    };
  }
}

/**
 * Test if current AI provider is working
 */
export async function testAIProvider(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await categorizeInput('Test connection');
    return {
      success: true,
      message: `Successfully connected to ${getAIConfig().provider}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to connect: ${error}`,
    };
  }
}
