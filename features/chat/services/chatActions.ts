import { eventBus } from '@/lib/events/EventBus';
import { createTask, findProjectByName } from '@/features/tasks/services/taskService';
import type { CategorizationResult } from '@/lib/ai/ollama';

/**
 * Initialize chat action handlers
 * Call this once when the app loads
 */
export function initializeChatActions() {
  // Listen for confirmed actions from chat
  eventBus.on('chat:action_confirmed', async ({ actionType, payload }) => {
    console.log('[ChatActions] Processing action:', actionType, payload);

    try {
      if (actionType === 'task') {
        await handleTaskCreation(payload);
      } else if (actionType === 'calendar_event') {
        await handleCalendarEventCreation(payload);
      } else if (actionType === 'note') {
        await handleNoteCreation(payload);
      }
    } catch (error) {
      console.error('[ChatActions] Error processing action:', error);
    }
  });

  console.log('[ChatActions] Initialized');
}

/**
 * Handle task creation from chat
 */
async function handleTaskCreation(categorization: CategorizationResult) {
  // Find project by name if specified
  let projectId: string | undefined;
  if (categorization.project) {
    const project = await findProjectByName(categorization.project);
    projectId = project?.id;
  }

  // Create task
  const task = await createTask({
    title: categorization.title,
    project_id: projectId,
    due_date: categorization.dueDate,
    priority: categorization.priority,
    tags: categorization.tags,
    ai_generated: true,
    ai_confidence: categorization.confidence,
  });

  console.log('[ChatActions] Task created:', task.id);
  return task;
}

/**
 * Handle calendar event creation from chat
 * (To be implemented in Phase 2)
 */
async function handleCalendarEventCreation(categorization: CategorizationResult) {
  console.log('[ChatActions] Calendar event creation not yet implemented');
  // TODO: Phase 2 - Calendar integration
}

/**
 * Handle note creation from chat
 * (To be implemented in Phase 5)
 */
async function handleNoteCreation(categorization: CategorizationResult) {
  console.log('[ChatActions] Note creation not yet implemented');
  // TODO: Phase 5 - Notes integration
}
