-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECTS (PARA Organization)
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  para_type TEXT CHECK (para_type IN ('project', 'area', 'resource', 'archive')) DEFAULT 'project',
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  color_hex TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- ============================================================================
-- TASKS
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  status TEXT CHECK (status IN ('backlog', 'todo', 'in_progress', 'done', 'cancelled')) DEFAULT 'todo',
  priority INT CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,

  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- AI metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_created_from_chat_id UUID,
  ai_confidence DECIMAL(3,2),
  tags TEXT[] DEFAULT '{}',

  -- ADHD features
  emotional_state TEXT,
  times_snoozed INT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status != 'done';
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- ============================================================================
-- CALENDAR EVENTS
-- ============================================================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'America/New_York',

  recurrence_rule TEXT,

  ai_generated BOOLEAN DEFAULT false,
  ai_created_from_task_id UUID REFERENCES tasks(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_user_time ON calendar_events(user_id, start_time);

-- ============================================================================
-- NOTES (Second Brain)
-- ============================================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  title TEXT,
  content TEXT NOT NULL,
  format TEXT CHECK (format IN ('markdown', 'plain', 'rich')) DEFAULT 'markdown',

  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_notes_content_search ON notes USING GIN (to_tsvector('english', content));

-- ============================================================================
-- EMAILS
-- ============================================================================
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,

  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sender_email TEXT,
  sender_name TEXT,

  -- AI categorization
  category TEXT,
  ai_confidence DECIMAL(3,2),
  tags TEXT[] DEFAULT '{}',

  -- Linking
  linked_task_id UUID REFERENCES tasks(id),
  linked_note_id UUID REFERENCES notes(id),
  linked_project_id UUID REFERENCES projects(id),

  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emails_category ON emails(category);
CREATE INDEX idx_emails_received ON emails(received_at DESC);

-- ============================================================================
-- CHAT MESSAGES
-- ============================================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,

  content TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,

  -- AI action metadata
  action_type TEXT,
  action_payload JSONB,
  ai_confidence DECIMAL(3,2),

  -- User feedback
  was_helpful BOOLEAN,
  feedback_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user_created ON chat_messages(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (Single-user initially)
-- ============================================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- For now: Allow all (single-user mode)
CREATE POLICY allow_all_tasks ON tasks FOR ALL USING (true);
CREATE POLICY allow_all_calendar ON calendar_events FOR ALL USING (true);
CREATE POLICY allow_all_notes ON notes FOR ALL USING (true);
CREATE POLICY allow_all_emails ON emails FOR ALL USING (true);
CREATE POLICY allow_all_chat ON chat_messages FOR ALL USING (true);
CREATE POLICY allow_all_projects ON projects FOR ALL USING (true);

-- ============================================================================
-- SEED DATA (Initial projects for the user)
-- ============================================================================
INSERT INTO projects (user_id, name, description, para_type, color_hex, icon) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Cue Insights', 'PM role at market research company', 'area', '#3b82f6', '💼'),
  ('00000000-0000-0000-0000-000000000000', 'DCAC', 'Swim coaching at DCAC', 'area', '#10b981', '🏊'),
  ('00000000-0000-0000-0000-000000000000', 'GW Grad School', 'Master''s in Curriculum and Pedagogy', 'area', '#8b5cf6', '🎓'),
  ('00000000-0000-0000-0000-000000000000', 'Job Search', 'Education jobs', 'project', '#f59e0b', '🔍'),
  ('00000000-0000-0000-0000-000000000000', 'Personal', 'Home, chores, life admin', 'area', '#ec4899', '🏠');
