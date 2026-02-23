import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  para_type: 'project' | 'area' | 'resource' | 'archive';
  status: 'active' | 'archived';
  color_hex: string;
  icon: string | null;
  created_at: string;
  archived_at: string | null;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: number;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  ai_generated: boolean;
  ai_created_from_chat_id: string | null;
  ai_confidence: number | null;
  tags: string[];
  emotional_state: string | null;
  times_snoozed: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  timezone: string;
  recurrence_rule: string | null;
  ai_generated: boolean;
  ai_created_from_task_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  action_type: string | null;
  action_payload: any;
  ai_confidence: number | null;
  was_helpful: boolean | null;
  feedback_text: string | null;
  created_at: string;
};
