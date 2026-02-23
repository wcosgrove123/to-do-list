const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';

export type CategoryType = 'task' | 'calendar_event' | 'email_draft' | 'note' | 'other';
export type ProjectType = 'Cue Insights' | 'DCAC' | 'GW Grad School' | 'Job Search' | 'Personal' | null;

export interface CategorizationResult {
  category: CategoryType;
  confidence: number; // 0.0 to 1.0
  title: string;
  project: ProjectType;
  dueDate: string | null; // ISO date string
  priority: number; // 1-5
  tags: string[];
  reasoning: string;
  alternatives?: Array<{
    category: CategoryType;
    confidence: number;
    reason: string;
  }>;
}

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

/**
 * Categorize user input using Ollama
 */
export async function categorizeInput(input: string): Promise<CategorizationResult> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${SYSTEM_PROMPT}\n\nUser input: "${input}"\n\nJSON response:`,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.3, // Lower temperature for more consistent categorization
          top_p: 0.9,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result: CategorizationResult = JSON.parse(data.response);

    // Validate and sanitize result
    return {
      category: result.category || 'other',
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      title: result.title || input.slice(0, 100),
      project: result.project,
      dueDate: result.dueDate,
      priority: Math.max(1, Math.min(5, result.priority || 3)),
      tags: Array.isArray(result.tags) ? result.tags : [],
      reasoning: result.reasoning || 'No reasoning provided',
      alternatives: result.alternatives || []
    };
  } catch (error) {
    console.error('[Ollama] Categorization error:', error);

    // Fallback: return basic task categorization
    return {
      category: 'task',
      confidence: 0.5,
      title: input.slice(0, 100),
      project: null,
      dueDate: null,
      priority: 3,
      tags: [],
      reasoning: 'Fallback categorization due to AI error',
      alternatives: []
    };
  }
}

/**
 * Check if Ollama is available
 */
export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('[Ollama] Connection check failed:', error);
    return false;
  }
}

/**
 * Extract dates from natural language
 * Helper function for manual date parsing if AI fails
 */
export function parseNaturalDate(text: string): Date | null {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const lowerText = text.toLowerCase();

  // Simple patterns
  if (lowerText.includes('today')) return today;
  if (lowerText.includes('tomorrow')) return tomorrow;

  // Day of week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lowerText.includes(days[i])) {
      const targetDay = i;
      const currentDay = today.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
      const result = new Date(today);
      result.setDate(result.getDate() + daysUntilTarget);
      return result;
    }
  }

  return null;
}
