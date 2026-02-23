/**
 * Claude AI Provider (via Anthropic API)
 *
 * Note: Claude Code Max subscription includes $25/month API credits
 * Get your API key from: https://console.anthropic.com/settings/keys
 */

import type { AIResponse } from './aiProvider';

const SYSTEM_PROMPT = `You are a task categorization AI for an ADHD productivity system.
Categorize user input into one of: task, calendar_event, email_draft, note, or other.

Extract the following information:
- Title: Clear, actionable title
- Due dates: Parse natural language dates (e.g., "tomorrow", "Friday", "next week")
- People mentioned: Extract names
- Project keywords: Match to user's projects
- Priority: 1 (lowest) to 5 (highest)
- Tags: Relevant tags for organization

The user has these projects/areas:
- Cue Insights: PM role at market research company (keywords: cue, work, client, project management)
- DCAC: Swim coaching (keywords: swim, coach, practice, dcac, pool)
- GW Grad School: Master's in Curriculum and Pedagogy (keywords: gw, school, class, thesis, grad)
- Job Search: Education jobs (keywords: job, resume, interview, application, education jobs)
- Personal: Home, chores, life admin (keywords: home, groceries, rent, personal)

Rules for categorization:
- "task" = action items, todos, reminders
- "calendar_event" = specific time-based events (meetings, classes, appointments)
- "email_draft" = user wants to compose/draft an email
- "note" = ideas, brainstorms, information to save
- "other" = unclear or doesn't fit categories

Return ONLY valid JSON in this exact format:
{
  "category": "task",
  "confidence": 0.95,
  "title": "extracted title",
  "project": "Cue Insights",
  "dueDate": "2026-02-17T00:00:00Z",
  "priority": 3,
  "tags": ["tag1", "tag2"],
  "reasoning": "why this category",
  "alternatives": [
    {"category": "calendar_event", "confidence": 0.3, "reason": "could be a scheduled event"}
  ]
}`;

interface ClaudeAPIMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Call Claude API to categorize input
 */
export async function categorizeWithClaude(
  input: string,
  model: string,
  apiKey: string
): Promise<AIResponse> {
  const apiUrl = 'https://api.anthropic.com/v1/messages';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Categorize this input and return JSON: "${input}"`,
          },
        ],
        temperature: 0.3, // Lower temperature for consistent categorization
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Claude returns: { content: [{ type: 'text', text: '...' }] }
    const textContent = data.content[0]?.text || '{}';

    // Extract JSON from response (Claude sometimes wraps it in markdown)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : textContent;

    const result: AIResponse = JSON.parse(jsonStr);

    // Validate and sanitize
    return {
      category: result.category || 'other',
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      title: result.title || input.slice(0, 100),
      project: result.project,
      dueDate: result.dueDate,
      priority: Math.max(1, Math.min(5, result.priority || 3)),
      tags: Array.isArray(result.tags) ? result.tags : [],
      reasoning: result.reasoning || 'No reasoning provided',
      alternatives: result.alternatives || [],
    };
  } catch (error) {
    console.error('[Claude] Categorization error:', error);
    throw error;
  }
}

/**
 * Check if Claude API key is valid
 */
export async function validateClaudeAPIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }],
      }),
    });

    return response.ok || response.status === 400; // 400 means valid key but bad request
  } catch {
    return false;
  }
}
