# System Architecture

## Overview

The ADHD Productivity OS is built with a **modular, event-driven architecture** to enable:
- Independent feature development
- Easy testing and debugging
- Future scalability
- ADHD-friendly development (small, focused modules)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Next.js)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Chat Interface (Primary Input)                │  │
│  │  Natural language: "Remind me to email John"          │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        AI Categorization (Ollama/llama3.1)            │  │
│  │  Extract: category, title, project, due date          │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        EventBus (Decoupled Communication)             │  │
│  │  Events: task:created, calendar:updated, etc.         │  │
│  └───┬──────────┬─────────┬──────────┬──────────────────┘  │
│      │          │         │          │                      │
│      ▼          ▼         ▼          ▼                      │
│  ┌────────┐ ┌────────┐ ┌──────┐ ┌────────┐                │
│  │ Tasks  │ │Calendar│ │Email │ │ Notes  │                │
│  │ Module │ │ Module │ │Module│ │ Module │                │
│  └───┬────┘ └───┬────┘ └───┬──┘ └───┬────┘                │
│      │          │           │        │                      │
│      └──────────┴───────────┴────────┘                      │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Supabase (PostgreSQL)                       │  │
│  │  Tables: tasks, calendar_events, emails, notes        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Services:
  ├─ Ollama (localhost:11434) - AI processing
  ├─ n8n (future) - Email automation
  └─ OAuth providers (future) - Gmail, Outlook
```

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 19 + Next.js 15 | Server components, App Router, best Claude Code support |
| **Language** | TypeScript | Type safety, better IDE support, catches errors early |
| **Styling** | Tailwind CSS | Utility-first, consistent design, dark mode support |
| **Database** | Supabase (PostgreSQL) | RLS, realtime subscriptions, local dev with Docker |
| **AI/LLM** | Ollama (llama3.1) | Privacy-first, runs locally on RTX 4070 |
| **State** | React Context + EventBus | Simple, no Redux complexity, event-driven |
| **Package Manager** | pnpm | Fast, disk efficient, strict dependency resolution |

## Module Breakdown

### 1. Chat Module (`/features/chat`)

**Purpose**: Primary user input interface

**Components**:
- `ChatInterface.tsx` - Main chat UI (input, message history)
- `ChatMessage.tsx` - Individual message bubble
- `ConfidenceIndicator.tsx` - Shows AI confidence (0-100%)
- `ActionPreview.tsx` - Preview of what will be created

**Services**:
- `chatActions.ts` - Handles confirmed actions, creates tasks/events/notes

**Data Flow**:
1. User types message
2. Submit → `categorizeInput()` (Ollama)
3. Display preview with confidence score
4. User confirms → Emit `chat:action_confirmed` event
5. Task/Calendar/Notes module handles event

**EventBus Events**:
- **Emits**: `chat:message_sent`, `chat:action_confirmed`
- **Listens**: None (pure input module)

### 2. Tasks Module (`/features/tasks`)

**Purpose**: Task management with PARA organization

**Components**:
- `TaskList.tsx` - Display tasks with filters (All, To Do, In Progress, Done)
- `TaskCard.tsx` - Individual task with status change, delete

**Services**:
- `taskService.ts` - CRUD operations (createTask, updateTask, deleteTask)

**Data Flow**:
1. Listen to `chat:action_confirmed` event (if category === 'task')
2. Call `createTask()` → Supabase insert
3. Emit `task:created` event
4. TaskList reloads and displays new task

**EventBus Events**:
- **Emits**: `task:created`, `task:updated`, `task:completed`, `task:deleted`
- **Listens**: `chat:action_confirmed`

**Database Schema**:
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('backlog', 'todo', 'in_progress', 'done', 'cancelled')),
  priority INT CHECK (priority BETWEEN 1 AND 5),
  due_date TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),
  tags TEXT[],
  emotional_state TEXT,
  times_snoozed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Calendar Module (`/features/calendar`) - Phase 2

**Purpose**: Master calendar for time-based commitments

**Components** (To be built):
- `CalendarView.tsx` - Month/week/day views
- `EventCard.tsx` - Individual calendar event

**Services**:
- `calendarService.ts` - CRUD for calendar events
- `recurrenceHandler.ts` - Handle recurring events

**Data Flow**:
1. Listen to `task:created` event
2. If task has `due_date`, create calendar event
3. Emit `calendar:event_created`

**EventBus Events**:
- **Emits**: `calendar:event_created`, `calendar:event_updated`
- **Listens**: `task:created` (auto-create events from tasks with due dates)

### 4. Projects Module (`/features/projects`) - Phase 3

**Purpose**: PARA organization (Projects, Areas, Resources, Archives)

**Database Schema**:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  para_type TEXT CHECK (para_type IN ('project', 'area', 'resource', 'archive')),
  status TEXT CHECK (status IN ('active', 'archived')),
  color_hex TEXT DEFAULT '#3b82f6',
  icon TEXT
);
```

**Seed Data**:
- Cue Insights (Area)
- DCAC (Area)
- GW Grad School (Area)
- Job Search (Project)
- Personal (Area)

### 5. Email Module (`/features/email`) - Phase 4

**Purpose**: Email triage and categorization

**External Integration**:
- **n8n workflow**: Fetch emails every 15 minutes
- **Gmail/Outlook OAuth**: Access user's email
- **AI categorization**: Categorize emails by project

**Data Flow**:
1. n8n fetches new emails
2. Call Ollama to categorize
3. Insert into `emails` table
4. If action needed, emit `task:created`

### 6. Notes Module (`/features/notes`) - Phase 5

**Purpose**: Second brain / knowledge management

**Components**:
- `NoteEditor.tsx` - Markdown editor
- `NoteList.tsx` - Grid or list view
- `NoteSearch.tsx` - Full-text search

**Features**:
- Full-text search with PostgreSQL `to_tsvector`
- Auto-linking to tasks/projects
- Extract action items from notes (AI)

## EventBus Design

### Why EventBus?

**Problem**: Tightly coupled modules = hard to modify, hard to test
**Solution**: EventBus decouples modules, each can work independently

### Implementation

```typescript
// lib/events/EventBus.ts
class EventBus {
  on<K extends keyof EventMap>(eventName: K, handler: EventHandler<EventMap[K]>): void
  emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): Promise<void>
  off(eventName: string, handler: EventHandler): void
}
```

### Event Types

```typescript
export type EventMap = {
  // Task events
  'task:created': { task: Task; source: 'chat' | 'manual' };
  'task:updated': { task: Task };
  'task:completed': { task: Task };
  'task:deleted': { taskId: string };

  // Calendar events
  'calendar:event_created': { event: CalendarEvent };
  'calendar:event_updated': { event: CalendarEvent };

  // Chat events
  'chat:message_sent': { message: ChatMessage };
  'chat:action_confirmed': { actionType: string; payload: any };

  // ... more events
};
```

### Usage Example

```typescript
// Emitting (in Chat module)
eventBus.emit('task:created', { task, source: 'chat' });

// Listening (in Tasks module)
eventBus.on('task:created', ({ task, source }) => {
  console.log('New task created:', task.title);
  refreshTaskList();
});
```

## AI Integration (Ollama)

### Categorization Prompt

```typescript
const SYSTEM_PROMPT = `You are a task categorization AI for an ADHD productivity system.
Categorize user input into: task, calendar_event, email_draft, note, or other.

Extract:
- Title: Clear, actionable title
- Due dates: Parse natural language (e.g., "tomorrow", "Friday")
- Projects: Match to Cue Insights, DCAC, GW Grad School, Job Search, Personal
- Priority: 1 (lowest) to 5 (highest)
- Tags: Relevant keywords

Return JSON:
{
  "category": "task",
  "confidence": 0.95,
  "title": "extracted title",
  "project": "Cue Insights",
  "dueDate": "2026-02-17T00:00:00Z",
  "priority": 3,
  "tags": ["email", "urgent"],
  "reasoning": "why this category"
}`;
```

### Response Handling

1. **High confidence (≥80%)**: Show preview, allow confirm
2. **Medium confidence (60-79%)**: Show warning, offer alternatives
3. **Low confidence (<60%)**: Ask user to clarify

### Fallback Strategy

If Ollama fails:
```typescript
return {
  category: 'task',
  confidence: 0.5,
  title: input.slice(0, 100),
  project: null,
  dueDate: null,
  priority: 3,
  tags: [],
  reasoning: 'Fallback categorization due to AI error'
};
```

## Database Design

### Key Design Principles

1. **UUID primary keys**: Better for distributed systems
2. **Timestamptz**: All timestamps with timezone
3. **Row-level security**: Ready for multi-user (disabled for Phase 1)
4. **Indexes on common queries**: `due_date`, `status`, `user_id`
5. **JSONB for flexible data**: `action_payload` in chat_messages

### Relationships

```
projects (1) ──< (many) tasks
projects (1) ──< (many) calendar_events
projects (1) ──< (many) notes

tasks (1) ──< (0..1) calendar_events (via ai_created_from_task_id)
tasks (1) ──< (many) emails (via linked_task_id)
notes (1) ──< (many) tasks (via linked_note_id in future)
```

### Migrations Strategy

- **Initial schema**: `supabase/migrations/20260216000000_initial_schema.sql`
- **Future changes**: Create new migration files with timestamps
- **Never edit existing migrations**: Always create new ones

## Deployment Architecture (Future)

### Phase 1: Local Development
- Next.js: `localhost:3001`
- Supabase: `localhost:54321` (Docker)
- Ollama: `localhost:11434`

### Phase 6+: Production (TBD)
- **Frontend**: Vercel or similar
- **Database**: Supabase Cloud
- **AI**: Ollama on dedicated server OR switch to Claude API
- **Email**: n8n on separate server

## Performance Considerations

### Current Optimizations
- **Ollama**: Use quantized models (q4_K_M) for faster inference
- **Supabase**: Indexes on frequently queried columns
- **EventBus**: Async event handlers, errors don't block other handlers

### Future Optimizations
- **Caching**: Cache AI responses for repeated queries
- **Debouncing**: Debounce chat input to reduce Ollama calls
- **Pagination**: Load tasks in batches (20-50 at a time)
- **Realtime subscriptions**: Only subscribe to relevant data

## Security Considerations

### Phase 1 (Single-user)
- RLS enabled but policies allow all (single-user mode)
- user_id hardcoded to `00000000-0000-0000-0000-000000000000`

### Future (Multi-user)
- Implement proper authentication (Supabase Auth)
- Update RLS policies: `USING (auth.uid() = user_id)`
- OAuth tokens encrypted at rest
- API keys in environment variables

## Monitoring & Debugging

### EventBus Logging
```typescript
// In development, log all events
if (process.env.NODE_ENV === 'development') {
  console.log(`[EventBus] ${eventName}`, data);
}
```

### Error Handling
- EventBus errors don't crash the app
- Fallback categorization if Ollama fails
- User-friendly error messages

## Testing Strategy

### Manual Testing (Phase 1)
- Test chat → task creation flow
- Verify AI categorization accuracy
- Check EventBus event propagation

### Future: Automated Testing
- **Unit tests**: Vitest for services and utilities
- **Component tests**: Testing Library for React components
- **E2E tests**: Playwright for full workflows
- **AI tests**: Compare categorization against known inputs

## Scalability Path

### Phase 1-3: Single User
- Local Ollama
- Local Supabase
- No auth

### Phase 4-5: Local Multi-User
- Supabase Auth
- RLS policies enforced
- OAuth for email

### Phase 6+: Cloud Deployment
- Vercel for frontend
- Supabase Cloud for database
- Dedicated Ollama server OR Claude API
- CDN for static assets
