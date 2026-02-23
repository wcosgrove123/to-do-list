# Claude Code Context

This file provides context for Claude Code agents working on this project.

## Project Overview

**ADHD Productivity OS** - A chat-first, AI-powered productivity system designed for ADHD workflows.

**Key Principle**: Build in vertical slices with working versions at every step. Each phase should be functional before moving to the next.

## Architecture Philosophy

### Modularity
- Each feature is a self-contained module in `/features/`
- Modules communicate via EventBus (no tight coupling)
- Agents can work on one module without affecting others

### Event-Driven Design
- All inter-module communication uses EventBus
- Example: Chat emits `task:created`, Tasks module listens and updates
- See `lib/events/EventBus.ts` for event types

### Type Safety
- Full TypeScript coverage
- Shared types in `lib/db/supabase.ts`
- Feature-specific types in each feature's `/types/` directory

## Current State (Phase 1 Complete)

### Working Features ✅
- Chat interface with AI categorization (Ollama)
- Task CRUD operations
- EventBus architecture
- Supabase schema (needs Docker to run)
- Clean, modern UI (no emojis, professional styles)

### Not Yet Implemented 🚧
- Calendar integration (Phase 2)
- Projects auto-detection (Phase 3)
- Email triage (Phase 4)
- Notes / Second Brain (Phase 5)
- Mobile / Voice (Phase 6)
- ADHD-specific features (Phase 7)

## Development Workflow

### Adding New Features
1. Create feature module in `/features/<name>/`
2. Add components, services, and types subdirectories
3. Define EventBus events in `lib/events/EventBus.ts`
4. Emit events when state changes
5. Listen to relevant events from other modules

### Module Structure
```
features/<module-name>/
├── components/      # React components
├── services/        # Business logic, API calls
└── types/          # TypeScript types
```

### EventBus Patterns
```typescript
// Emitting an event
eventBus.emit('task:created', { task, source: 'chat' });

// Listening to an event
eventBus.on('task:created', (data) => {
  console.log('Task created:', data.task);
});
```

## Database Schema

### Key Tables
- `projects` - PARA organization (Projects, Areas, Resources, Archives)
- `tasks` - Task management with AI metadata
- `calendar_events` - Calendar events linked to tasks
- `notes` - Second brain / knowledge management
- `emails` - Email triage and categorization
- `chat_messages` - Chat history with AI actions

### Relationships
- Tasks belong to Projects
- Calendar events can be created from Tasks
- Notes can be linked to Tasks and Projects
- Emails can be linked to Tasks, Notes, and Projects

## AI Integration

### Ollama (Local LLM)
- Base URL: `http://localhost:11434`
- Model: `llama3.1`
- Purpose: Categorize user input into tasks/events/notes

### Categorization Flow
1. User types in chat
2. `lib/ai/ollama.ts::categorizeInput()` calls Ollama
3. Extract: category, title, project, due date, priority, tags
4. Show preview with confidence score
5. On confirm, emit event (e.g., `chat:action_confirmed`)
6. Relevant module (Tasks) handles event and creates item

## Styling Guidelines

### Design Principles (User Requirements)
- **No emojis** - Keep it clean and professional
- **Modern & professional** - Not too playful
- **Not too much whitespace** - Efficient use of space
- **Features organized and easy to find** - Clear navigation

### Tailwind Classes
- Primary color: `bg-blue-600`, `text-blue-600`
- Cards: `bg-white dark:bg-gray-800 rounded-lg shadow-lg`
- Borders: `border-gray-200 dark:border-gray-700`
- Text: `text-gray-900 dark:text-white`

## Port Configuration

**Important**: Avoid using port 8000 (user has other projects using it).

- Next.js dev server: Defaults to 3000, auto-increments if busy (3001, 3002, etc.)
- Supabase: 54321 (API), 54323 (Studio)
- Ollama: 11434

## Common Tasks

### Starting Development
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Supabase (requires Docker)
supabase start

# Terminal 3: Start Next.js
pnpm dev
```

### Adding a New EventBus Event
1. Add type to `EventMap` in `lib/events/EventBus.ts`
2. Emit in relevant module: `eventBus.emit('event:name', data)`
3. Listen in dependent module: `eventBus.on('event:name', handler)`

### Creating a New Feature Module
```bash
mkdir -p features/<module-name>/{components,services,types}
```

## Testing Approach

### Phase 1 Verification
1. **Chat → Task Creation**
   - Input: "Buy groceries tomorrow"
   - Expected: AI categorizes as task, extracts due date
   - Verify: Task appears in task list with due date = tomorrow

2. **Project Detection**
   - Input: "Cue project meeting Friday"
   - Expected: AI detects "Cue Insights" project
   - Verify: Task assigned to Cue Insights project

3. **Confidence Scores**
   - Input with ambiguity
   - Expected: Confidence < 80% shows warning
   - Verify: User can review before confirming

### Manual Testing (No Automated Tests Yet)
- Supabase needs Docker running
- Ollama needs to be started locally
- Browser testing at http://localhost:3001

## Known Issues / Limitations

### Phase 1
- **Supabase requires Docker**: Local dev won't work without Docker Desktop running
- **Ollama must be started manually**: No automatic startup
- **Single-user mode**: No authentication yet (user_id hardcoded)
- **No real-time updates**: Must refresh to see changes from other clients

### Future Considerations
- Add automated tests (Vitest + Testing Library)
- Implement real-time subscriptions with Supabase
- Add authentication (Phase 6+)
- Optimize Ollama prompts based on user feedback

## Module Boundaries

### Chat Module (`features/chat/`)
**Responsibilities**:
- Display chat interface
- Send user input to Ollama
- Show AI categorization preview
- Emit events when user confirms

**Does NOT**:
- Create tasks/events directly
- Access Supabase (only reads from EventBus)

### Tasks Module (`features/tasks/`)
**Responsibilities**:
- CRUD operations for tasks
- Display task list
- Listen to `task:created` events
- Update task status

**Does NOT**:
- Know about chat interface
- Categorize input (that's AI module's job)

### AI Module (`lib/ai/`)
**Responsibilities**:
- Call Ollama API
- Parse and validate AI responses
- Provide fallback categorization if AI fails

**Does NOT**:
- Store data in Supabase
- Emit EventBus events (Chat module does that)

## Future Agent Work

### Phase 2: Calendar Agent
- Work in `features/calendar/`
- Listen to `task:created` (if has due_date, create calendar event)
- Emit `calendar:event_created`

### Phase 4: Email Agent
- Work in `features/email/`
- Integrate with n8n workflows
- Listen to `email:received`, emit `task:created` if action needed

### Phase 5: Notes Agent
- Work in `features/notes/`
- Markdown editor
- Full-text search with `to_tsvector`
- Link notes to tasks/projects

## Success Criteria

**Phase 1 (Current)**:
- ✅ Type in chat → AI creates task → See in list
- ✅ Confidence scores display
- ✅ Projects auto-detected (by keywords)
- ✅ Clean, professional UI

**Phase 2 (Next)**:
- Tasks with due dates appear in calendar
- Recurring events work
- Calendar syncs with tasks

## Resources

- [Full Implementation Plan](./docs/FULL_PLAN.md)
- [Architecture Details](./docs/ARCHITECTURE.md)
- [Phase 1 Testing Guide](./docs/PHASE_1_TESTING.md)
- [Development Workflow](./docs/DEVELOPMENT.md)

## Questions for User

When in doubt:
- Ask about project categorization rules
- Clarify ADHD-specific feature requirements
- Verify styling preferences
- Confirm EventBus event naming conventions

This system is built **for ADHD brains**, so prioritize:
1. **Reducing friction**: One-step actions
2. **Visual clarity**: Clear status indicators
3. **Forgiving**: Easy undo, gentle nudges (not nagging)
4. **Celebrating wins**: Positive feedback on completions
