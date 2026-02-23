import type { Task, CalendarEvent, ChatMessage, Project } from '@/lib/db/supabase';

// Event type definitions
export type EventMap = {
  // Task events
  'task:created': { task: Task; source: 'chat' | 'manual' };
  'task:updated': { task: Task };
  'task:completed': { task: Task };
  'task:deleted': { taskId: string };

  // Calendar events
  'calendar:event_created': { event: CalendarEvent };
  'calendar:event_updated': { event: CalendarEvent };
  'calendar:event_deleted': { eventId: string };

  // Chat events
  'chat:message_sent': { message: ChatMessage };
  'chat:action_confirmed': { actionType: string; payload: any };

  // Project events
  'project:created': { project: Project };
  'project:updated': { project: Project };

  // Email events (for future phases)
  'email:received': { emailId: string };
  'email:categorized': { emailId: string; category: string };

  // Note events (for future phases)
  'note:saved': { noteId: string };
  'note:linked_to_task': { noteId: string; taskId: string };
};

type EventHandler<T = any> = (data: T) => void | Promise<void>;

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private debug = process.env.NODE_ENV === 'development';

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventMap>(
    eventName: K,
    handler: EventHandler<EventMap[K]>
  ): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(handler);

    // Return unsubscribe function
    return () => this.off(eventName, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof EventMap>(
    eventName: K,
    handler: EventHandler<EventMap[K]>
  ): void {
    this.listeners.get(eventName)?.delete(handler);
  }

  /**
   * Emit an event to all subscribers
   */
  async emit<K extends keyof EventMap>(
    eventName: K,
    data: EventMap[K]
  ): Promise<void> {
    if (this.debug) {
      console.log(`[EventBus] ${eventName}`, data);
    }

    const handlers = this.listeners.get(eventName);
    if (!handlers || handlers.size === 0) {
      if (this.debug) {
        console.log(`[EventBus] No listeners for ${eventName}`);
      }
      return;
    }

    // Execute all handlers in parallel
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${eventName}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Subscribe to an event only once
   */
  once<K extends keyof EventMap>(
    eventName: K,
    handler: EventHandler<EventMap[K]>
  ): void {
    const wrappedHandler = async (data: EventMap[K]) => {
      await handler(data);
      this.off(eventName, wrappedHandler as EventHandler);
    };
    this.on(eventName, wrappedHandler as EventHandler);
  }

  /**
   * Remove all listeners for an event (or all events if no name provided)
   */
  clear(eventName?: keyof EventMap): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get count of listeners for an event
   */
  listenerCount(eventName: keyof EventMap): number {
    return this.listeners.get(eventName)?.size || 0;
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Export class for testing
export { EventBus };
