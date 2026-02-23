export type { Task, Project } from '@/lib/db/supabase';

export interface CreateTaskInput {
  title: string;
  description?: string;
  project_id?: string;
  due_date?: string;
  priority?: number;
  tags?: string[];
  ai_generated?: boolean;
  ai_confidence?: number;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  status?: 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
}
