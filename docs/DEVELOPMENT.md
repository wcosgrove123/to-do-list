# Development Workflow

## Getting Started

### Initial Setup

```bash
# Clone or navigate to project
cd adhd-productivity-os

# Install dependencies
pnpm install

# Initialize Supabase (if not done)
supabase init

# Start Docker Desktop (required for Supabase)

# Start Supabase local development
supabase start
```

### Daily Development Workflow

```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: Next.js dev server
pnpm dev

# Terminal 3: Database migrations (if needed)
supabase db push
```

## Project Structure

```
adhd-productivity-os/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
│
├── features/                # Feature modules (modular architecture)
│   ├── chat/
│   │   ├── components/      # React components
│   │   ├── services/        # Business logic
│   │   └── types/           # TypeScript types
│   └── tasks/
│       ├── components/
│       ├── services/
│       └── types/
│
├── lib/                     # Shared libraries
│   ├── ai/                  # Ollama integration
│   ├── db/                  # Supabase client
│   └── events/              # EventBus system
│
├── components/              # Shared UI components
│   └── ui/                  # shadcn/ui components (future)
│
├── supabase/               # Supabase configuration
│   ├── config.toml         # Local Supabase config
│   └── migrations/         # Database migrations
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── FULL_PLAN.md
│   ├── PHASE_1_TESTING.md
│   └── DEVELOPMENT.md
│
├── .env.local             # Environment variables (not committed)
├── .env.example           # Template for environment variables
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── README.md              # Quick start guide
└── CLAUDE.md              # Context for Claude Code agents
```

## Coding Conventions

### TypeScript

- **Use explicit types**: Avoid `any` when possible
- **Interfaces over types**: Use `interface` for object shapes
- **Export types**: Export all types from `/types/index.ts` in each module

Example:
```typescript
// ✅ Good
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
}

// ❌ Avoid
const task: any = { ... }
```

### React Components

- **Functional components**: Use function components, not classes
- **TypeScript props**: Always type props
- **Client components**: Add `'use client'` directive when needed

Example:
```typescript
'use client';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  // Component logic
}
```

### File Naming

- **Components**: PascalCase (e.g., `TaskCard.tsx`)
- **Services**: camelCase (e.g., `taskService.ts`)
- **Types**: camelCase (e.g., `index.ts` in `/types/`)
- **Directories**: lowercase with hyphens (e.g., `features/chat-history/`)

### Styling

- **Tailwind classes**: Use Tailwind utility classes
- **No inline styles**: Avoid `style={{ }}` when possible
- **Dark mode**: Always include dark mode variants

Example:
```tsx
// ✅ Good
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">

// ❌ Avoid
<div style={{ backgroundColor: 'white', borderRadius: '8px' }}>
```

## EventBus Patterns

### Emitting Events

```typescript
import { eventBus } from '@/lib/events/EventBus';

// When creating a task
const task = await createTask(input);
eventBus.emit('task:created', { task, source: 'chat' });
```

### Listening to Events

```typescript
useEffect(() => {
  // Subscribe to event
  const unsubscribe = eventBus.on('task:created', (data) => {
    console.log('Task created:', data.task.title);
    refreshTaskList();
  });

  // Cleanup on unmount
  return () => unsubscribe();
}, []);
```

### Adding New Events

1. Add type to `EventMap` in `lib/events/EventBus.ts`
2. Emit in relevant module
3. Listen in dependent modules

Example:
```typescript
// 1. Add to EventMap
export type EventMap = {
  // ...existing events
  'note:created': { note: Note };
};

// 2. Emit when note is created
eventBus.emit('note:created', { note });

// 3. Listen in other modules
eventBus.on('note:created', ({ note }) => {
  console.log('Note created:', note.title);
});
```

## Database Workflow

### Creating Migrations

```bash
# Create a new migration
supabase migration new add_notes_table

# Edit the migration file in supabase/migrations/
# Example: 20260217000000_add_notes_table.sql
```

Migration template:
```sql
-- Description of what this migration does

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_user ON notes(user_id);
```

### Applying Migrations

```bash
# Apply migrations to local database
supabase db push

# Reset database (WARNING: deletes all data)
supabase db reset
```

### Viewing Data

```bash
# Open Supabase Studio
# Automatically opens at http://localhost:54323

# Or manually open in browser
open http://localhost:54323
```

## Testing Workflow

### Manual Testing

1. **Start services**:
   ```bash
   # Terminal 1: Ollama
   ollama serve

   # Terminal 2: Dev server
   pnpm dev
   ```

2. **Test in browser**: http://localhost:3001

3. **Check console**: Look for EventBus logs and errors

4. **Verify database**: Check Supabase Studio

### Testing Checklist

Before committing:
- [ ] App runs without errors
- [ ] Chat creates tasks correctly
- [ ] Tasks display in list
- [ ] Status changes work
- [ ] No TypeScript errors
- [ ] No console warnings

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `phase-1`, `phase-2`, etc. - Phase-specific branches
- `feature/<name>` - Feature branches

### Commit Messages

Format: `<type>(<scope>): <description>`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

Examples:
```bash
git commit -m "feat(chat): add confidence indicator"
git commit -m "fix(tasks): resolve status update bug"
git commit -m "docs: update Phase 1 testing guide"
```

### Before Committing

```bash
# Check for TypeScript errors
pnpm build

# Format code (if using Prettier)
pnpm format

# Commit changes
git add .
git commit -m "feat(module): description"
```

## Debugging Tips

### EventBus Debugging

Check console for EventBus logs:
```
[EventBus] task:created { task: {...}, source: 'chat' }
[EventBus] No listeners for task:updated
```

### Supabase Debugging

Check Supabase logs:
```bash
# View logs
supabase logs

# Check specific service
supabase logs db
supabase logs api
```

### Ollama Debugging

Test Ollama manually:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test categorization
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Categorize this: Buy groceries tomorrow",
  "stream": false
}'
```

### Common Errors

**Error**: "Failed to connect to Supabase"
- **Solution**: Check if Docker is running, restart Supabase

**Error**: "Ollama API error"
- **Solution**: Verify Ollama is running with `ollama serve`

**Error**: "Port 3001 already in use"
- **Solution**: Kill process on that port or let Next.js auto-increment

## Environment Variables

### Required Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>

# Ollama
NEXT_PUBLIC_OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

# User (for Phase 1 single-user mode)
NEXT_PUBLIC_USER_ID=00000000-0000-0000-0000-000000000000
```

### Adding New Variables

1. Add to `.env.example`
2. Add to `.env.local`
3. Document in README.md

## Module Development

### Creating a New Feature Module

```bash
# Create directory structure
mkdir -p features/<module-name>/{components,services,types}

# Create index files
touch features/<module-name>/components/index.ts
touch features/<module-name>/services/index.ts
touch features/<module-name>/types/index.ts
```

### Module Template

```typescript
// features/<module>/types/index.ts
export interface ModuleData {
  id: string;
  name: string;
}

// features/<module>/services/moduleService.ts
import { supabase } from '@/lib/db/supabase';

export async function getModuleData() {
  const { data, error } = await supabase
    .from('module_table')
    .select('*');

  if (error) throw error;
  return data;
}

// features/<module>/components/ModuleComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { getModuleData } from '../services/moduleService';

export function ModuleComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getModuleData();
    setData(data);
  };

  return <div>{/* Component UI */}</div>;
}
```

## Performance Optimization

### Best Practices

1. **Debounce user input**: Prevent excessive AI calls
2. **Memoize expensive calculations**: Use `useMemo`
3. **Lazy load components**: Use `React.lazy()` for large modules
4. **Optimize images**: Use Next.js `<Image>` component
5. **Index database queries**: Add indexes to frequently queried columns

### Monitoring Performance

```typescript
// Add timing logs
console.time('AI categorization');
const result = await categorizeInput(input);
console.timeEnd('AI categorization');
```

## Production Deployment (Future)

### Build for Production

```bash
# Build optimized bundle
pnpm build

# Test production build locally
pnpm start
```

### Environment Setup

1. **Vercel** (or similar): Deploy Next.js app
2. **Supabase Cloud**: Migrate to cloud database
3. **Ollama Server**: Deploy on dedicated server OR switch to Claude API

### Environment Variables (Production)

Update `.env.production`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase Cloud URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Cloud anon key
- `NEXT_PUBLIC_OLLAMA_BASE_URL` - Ollama server URL

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Ollama Docs**: https://github.com/ollama/ollama
- **Tailwind Docs**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## Getting Help

1. Check [CLAUDE.md](../CLAUDE.md) for context
2. Review [Architecture](./ARCHITECTURE.md)
3. Search [GitHub Issues](https://github.com/anthropics/claude-code/issues)
4. Ask Claude Code for help
