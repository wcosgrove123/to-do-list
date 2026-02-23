import { supabase } from '@/lib/db/supabase';
import type { Task } from '@/lib/db/supabase';
import type { CreateTaskInput, UpdateTaskInput } from '../types';
import { eventBus } from '@/lib/events/EventBus';

const USER_ID = process.env.NEXT_PUBLIC_USER_ID || '00000000-0000-0000-0000-000000000000';

// ── In-memory fallback store (used when Supabase/Docker is unavailable) ──────
let _memTasks: Task[] = [];
let _useMemory = false;

export function isUsingMemoryStore() { return _useMemory; }

async function supbaseAvailable(): Promise<boolean> {
  if (_useMemory) return false;
  try {
    const { error } = await supabase.from('tasks').select('id').limit(1);
    if (error && (error.message.includes('fetch') || error.message.includes('ECONNREFUSED') || error.code === 'PGRST301')) {
      console.warn('[taskService] Supabase unavailable — using in-memory store');
      _useMemory = true;
      return false;
    }
    return true;
  } catch {
    console.warn('[taskService] Supabase unavailable — using in-memory store');
    _useMemory = true;
    return false;
  }
}

function makeTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    user_id: USER_ID,
    project_id: input.project_id || null,
    title: input.title,
    description: input.description || null,
    status: 'todo',
    priority: input.priority || 3,
    due_date: input.due_date || null,
    started_at: null,
    completed_at: null,
    ai_generated: input.ai_generated || false,
    ai_created_from_chat_id: null,
    ai_confidence: input.ai_confidence || null,
    tags: input.tags || [],
    emotional_state: null,
    times_snoozed: 0,
    last_viewed_at: null,
    created_at: now,
    updated_at: now,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const db = await supbaseAvailable();

  if (!db) {
    const task = makeTask(input);
    _memTasks = [task, ..._memTasks];
    eventBus.emit('task:created', { task, source: input.ai_generated ? 'chat' : 'manual' });
    return task;
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: USER_ID,
      title: input.title,
      description: input.description || null,
      project_id: input.project_id || null,
      due_date: input.due_date || null,
      priority: input.priority || 3,
      tags: input.tags || [],
      ai_generated: input.ai_generated || false,
      ai_confidence: input.ai_confidence || null,
      status: 'todo',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message);
  }

  eventBus.emit('task:created', { task: data, source: input.ai_generated ? 'chat' : 'manual' });
  return data;
}

/**
 * Get all tasks for the user
 */
export async function getTasks(filters?: {
  status?: string[];
  project_id?: string;
}): Promise<Task[]> {
  const db = await supbaseAvailable();

  if (!db) {
    let tasks = [..._memTasks];
    if (filters?.status) tasks = tasks.filter(t => filters.status!.includes(t.status));
    if (filters?.project_id) tasks = tasks.filter(t => t.project_id === filters.project_id);
    return tasks;
  }

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.in('status', filters.status);
  if (filters?.project_id) query = query.eq('project_id', filters.project_id);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string): Promise<Task | null> {
  const db = await supbaseAvailable();

  if (!db) return _memTasks.find(t => t.id === id) || null;

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', USER_ID)
    .single();

  if (error) return null;
  return data;
}

/**
 * Update a task
 */
export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const db = await supbaseAvailable();
  const { id, ...updates } = input;

  if (!db) {
    const idx = _memTasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    const updated = { ..._memTasks[idx], ...updates, updated_at: new Date().toISOString() } as Task;
    _memTasks[idx] = updated;
    eventBus.emit('task:updated', { task: updated });
    if (updated.status === 'done') eventBus.emit('task:completed', { task: updated });
    return updated;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', USER_ID)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw new Error(error.message);
  }

  eventBus.emit('task:updated', { task: data });
  if (data.status === 'done') eventBus.emit('task:completed', { task: data });
  return data;
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const db = await supbaseAvailable();

  if (!db) {
    _memTasks = _memTasks.filter(t => t.id !== id);
    eventBus.emit('task:deleted', { taskId: id });
    return;
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', USER_ID);

  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.message);
  }

  eventBus.emit('task:deleted', { taskId: id });
}

/**
 * Get projects for task categorization
 */
export async function getProjects() {
  const db = await supbaseAvailable();
  if (!db) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('status', 'active')
    .order('name');

  if (error) return [];
  return data || [];
}

/**
 * Find project by name (case-insensitive)
 */
export async function findProjectByName(name: string) {
  const db = await supbaseAvailable();
  if (!db) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', USER_ID)
    .ilike('name', name)
    .single();

  if (error) return null;
  return data;
}
