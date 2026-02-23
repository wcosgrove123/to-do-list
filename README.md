# ADHD Productivity OS

A chat-first, AI-powered productivity system designed specifically for ADHD workflows.

## Overview

This system combines natural language input with AI categorization to create a frictionless task management experience. Instead of navigating complex UIs, you simply chat about what you need to do, and the AI organizes it for you.

**Current Status**: Phase 1 MVP Complete ✓

- ✅ Chat interface with AI categorization
- ✅ Task management with PARA organization
- ✅ EventBus architecture for modular components
- ✅ Ollama integration for local AI processing
- 🚧 Supabase database (requires Docker)
- 📋 Calendar integration (Phase 2)
- 📋 Email triage (Phase 4)
- 📋 Second brain / notes (Phase 5)

## Quick Start

### Prerequisites

1. **Node.js** (v18+) and **pnpm**
2. **Docker Desktop** (for Supabase local development)
3. **Ollama** (for AI categorization)
   ```bash
   # Install Ollama: https://ollama.ai
   # Pull the model:
   ollama pull llama3.1
   ```

### Installation

```bash
# Install dependencies
pnpm install

# Start Supabase (requires Docker Desktop running)
supabase start

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3001` (or next available port).

### First Run

1. **Start Ollama**: Make sure Ollama is running with `ollama serve`
2. **Start Docker**: Ensure Docker Desktop is running
3. **Initialize database**: `supabase start` will create local database
4. **Start app**: `pnpm dev`

## Usage

### Creating Tasks

Simply type in the chat:

- "Buy groceries tomorrow"
- "Email John about the GW project by Friday"
- "Swim practice Tuesday 6pm"

The AI will:
1. Categorize your input (task, event, note)
2. Extract metadata (due date, project, priority)
3. Show you a preview
4. Create the item when you confirm

### Viewing Tasks

Tasks are organized by status:
- **All**: All tasks
- **To Do**: Not started yet
- **In Progress**: Currently working on
- **Done**: Completed tasks

### Projects (PARA System)

The system uses PARA (Projects, Areas, Resources, Archives):

- **Cue Insights**: Work at market research company
- **DCAC**: Swim coaching
- **GW Grad School**: Master's program
- **Job Search**: Education jobs
- **Personal**: Home and life admin

Tasks are automatically categorized into projects based on keywords.

## Architecture

- **Frontend**: React 19 + Next.js 15 + TypeScript
- **Styling**: Tailwind CSS (clean, modern, professional)
- **Database**: Supabase (PostgreSQL)
- **AI**: Ollama (local LLM - llama3.1)
- **State**: React Context + EventBus
- **Package Manager**: pnpm

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture.

## Project Structure

```
.
├── app/                    # Next.js App Router
├── features/               # Feature modules
│   ├── chat/              # Chat interface & AI categorization
│   │   ├── components/    # React components
│   │   ├── services/      # Business logic
│   │   └── types/         # TypeScript types
│   └── tasks/             # Task management
│       ├── components/
│       ├── services/
│       └── types/
├── lib/                   # Shared libraries
│   ├── ai/               # Ollama integration
│   ├── db/               # Supabase client
│   └── events/           # EventBus system
├── components/           # Shared UI components
├── supabase/            # Database migrations
└── docs/                # Documentation
```

## Development

```bash
# Start dev server (with hot reload)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Database commands
pnpm db:push    # Apply migrations
pnpm db:reset   # Reset database
```

## Testing Phase 1

See [docs/PHASE_1_TESTING.md](./docs/PHASE_1_TESTING.md) for comprehensive testing guide.

**Quick test:**
1. Start Ollama: `ollama serve`
2. Start app: `pnpm dev`
3. Type: "Buy groceries tomorrow"
4. Verify: AI categorizes as task with due date
5. Confirm: Task appears in task list

## Roadmap

### Phase 1: MVP Chat + Tasks ✅ (Complete)
- Chat interface with AI categorization
- Task list with CRUD operations
- EventBus architecture

### Phase 2: Calendar Integration 🚧 (Next)
- Calendar view (month/week/day)
- Task → Calendar event mapping
- Recurring events

### Phase 3: Projects + PARA Organization
- Project dashboard
- Auto-detection of project from text
- Area vs Project distinction

### Phase 4: Email Integration
- Gmail OAuth
- n8n workflows for email fetching
- Email → Task conversion

### Phase 5: Notes / Second Brain
- Markdown editor
- Full-text search
- Auto-linking to tasks/projects

### Phase 6: Mobile + Voice
- PWA for mobile
- Voice input (Web Speech API)
- Push notifications

### Phase 7: ADHD Features
- Emotional state tracking
- Friction indicators
- Context protection mode
- Visual dashboard

## Troubleshooting

### Supabase won't start
- Ensure Docker Desktop is running
- Check if ports 54321-54324 are available
- Run `supabase stop` then `supabase start`

### Ollama errors
- Verify Ollama is running: `ollama list`
- Check model is downloaded: `ollama pull llama3.1`
- Test connection: `curl http://localhost:11434/api/tags`

### Port conflicts
- App will automatically use next available port (3001, 3002, etc.)
- Set custom port: `PORT=5000 pnpm dev`

## Contributing

This is a personal productivity system, but the architecture is designed to be:
- **Modular**: Each feature is independent
- **Event-driven**: Features communicate via EventBus
- **Type-safe**: Full TypeScript coverage
- **ADHD-friendly**: Built in vertical slices with working versions

## License

MIT

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and module breakdown
- [Full Plan](./docs/FULL_PLAN.md) - Complete 7-phase implementation plan
- [Phase 1 Testing](./docs/PHASE_1_TESTING.md) - Testing guide for MVP
- [Development](./docs/DEVELOPMENT.md) - Development workflow and conventions

## Support

For issues or questions, see:
- [GitHub Issues](https://github.com/anthropics/claude-code/issues) (for Claude Code issues)
- Project documentation in `/docs/`
