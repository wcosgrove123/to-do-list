# Phase 1 Testing Guide

## Prerequisites

Before testing, ensure you have:

1. **Docker Desktop** running
2. **Ollama** installed and running
3. **Node.js** and **pnpm** installed
4. **Dependencies** installed (`pnpm install`)

## Setup Instructions

### 1. Start Ollama

```bash
# Terminal 1: Start Ollama server
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags

# Pull the model (if not already downloaded)
ollama pull llama3.1
```

### 2. Start Supabase

```bash
# Terminal 2: Start Supabase local development
supabase start

# This will output:
# - API URL: http://localhost:54321
# - Studio URL: http://localhost:54323
# - anon key: [key]
# - service_role key: [key]
```

### 3. Start Next.js

```bash
# Terminal 3: Start development server
pnpm dev

# App will start on http://localhost:3001 (or next available port)
```

## Test Cases

### Test 1: Basic Task Creation

**Objective**: Verify chat can create a task

**Steps**:
1. Open http://localhost:3001
2. Type in chat: `Buy groceries tomorrow`
3. Press Enter

**Expected**:
- AI responds with categorization: "I understood this as a **task**: 'Buy groceries tomorrow'"
- Confidence score displays (should be high, ~90%+)
- Action preview shows:
  - Title: "Buy groceries tomorrow"
  - Due Date: Tomorrow's date
  - Priority: 3
  - Project: Personal
- Click "Confirm"
- Task appears in Tasks panel on the right
- Status: "To Do"

**Pass Criteria**:
- ✅ Task created successfully
- ✅ Due date is tomorrow
- ✅ Appears in task list immediately

### Test 2: Project Detection

**Objective**: Verify AI detects project from keywords

**Test Cases**:
| Input | Expected Project | Keywords |
|-------|------------------|----------|
| "Cue project meeting Friday" | Cue Insights | "cue" |
| "Swim practice Tuesday 6pm" | DCAC | "swim" |
| "GW thesis outline by next week" | GW Grad School | "gw", "thesis" |
| "Update resume for teaching jobs" | Job Search | "resume", "jobs" |
| "Pay rent this weekend" | Personal | (no keywords) |

**Steps**:
1. Type each input in chat
2. Verify project assignment in preview
3. Confirm and check task list

**Pass Criteria**:
- ✅ Project correctly detected for each input
- ✅ Confidence score ≥ 80% for clear inputs

### Test 3: Multiple Tasks

**Objective**: Create multiple tasks and verify they all appear

**Steps**:
1. Create task: "Call dentist tomorrow"
2. Create task: "Email John about project"
3. Create task: "Prepare presentation for Friday"

**Expected**:
- All 3 tasks visible in task list
- Tasks sorted by creation date (newest first)
- Each task has correct metadata

**Pass Criteria**:
- ✅ All tasks created successfully
- ✅ Task count shows (3) in "All" tab
- ✅ No duplicate tasks

### Test 4: Task Status Changes

**Objective**: Verify status changes work

**Steps**:
1. Create a task: "Test task"
2. In task list, change status dropdown to "In Progress"
3. Verify task moves to "In Progress" tab
4. Change status to "Done"
5. Verify task moves to "Done" tab

**Expected**:
- Task moves between tabs based on status
- Tab counts update correctly
- No errors in console

**Pass Criteria**:
- ✅ Status changes update immediately
- ✅ Tab filtering works
- ✅ Counts are accurate

### Test 5: Task Deletion

**Objective**: Verify task deletion works

**Steps**:
1. Create a task: "Delete me"
2. Click "Delete" button
3. Confirm deletion dialog
4. Verify task disappears from list

**Expected**:
- Confirmation dialog appears
- Task removed after confirmation
- Task count decreases

**Pass Criteria**:
- ✅ Task deleted successfully
- ✅ No errors
- ✅ List updates immediately

### Test 6: Confidence Indicators

**Objective**: Verify confidence scores work correctly

**Test Cases**:
| Input | Expected Confidence | Reason |
|-------|---------------------|--------|
| "Buy groceries tomorrow" | High (≥80%) | Clear task, clear due date |
| "Maybe do something later" | Low (<60%) | Vague, unclear |
| "Email someone about stuff" | Medium (60-79%) | Missing details |

**Steps**:
1. Type each input
2. Check confidence indicator in preview
3. For low confidence, verify warning displays

**Expected**:
- High confidence: Green indicator
- Medium confidence: Yellow indicator
- Low confidence: Red indicator + warning message

**Pass Criteria**:
- ✅ Confidence scores display correctly
- ✅ Color coding matches confidence level
- ✅ Low confidence shows warning

### Test 7: Priority Assignment

**Objective**: Verify priority is assigned correctly

**Steps**:
1. Create task: "URGENT: Fix critical bug"
2. Create task: "Maybe clean desk later"
3. Check priority in task cards

**Expected**:
- Urgent task: Priority 4 or 5 (high)
- Optional task: Priority 1 or 2 (low)

**Pass Criteria**:
- ✅ AI detects urgency from keywords
- ✅ Priority badge displays correctly
- ✅ Colors match priority (red = high, gray = low)

### Test 8: Tags Extraction

**Objective**: Verify AI extracts relevant tags

**Test Cases**:
| Input | Expected Tags |
|-------|---------------|
| "Email John about urgent meeting" | ["email", "urgent", "meeting"] |
| "Buy milk and eggs at store" | ["groceries", "shopping"] |
| "Schedule swim practice" | ["swim", "coaching", "scheduling"] |

**Steps**:
1. Create task with input
2. Check tags in task card

**Pass Criteria**:
- ✅ Relevant tags extracted
- ✅ Tags display as badges
- ✅ No duplicate tags

### Test 9: Natural Date Parsing

**Objective**: Verify AI parses natural language dates

**Test Cases**:
| Input Date | Expected Due Date |
|------------|-------------------|
| "tomorrow" | Tomorrow's date |
| "Friday" | Next Friday |
| "next week" | ~7 days from now |
| "Tuesday" | Next Tuesday |

**Steps**:
1. Create task with date phrase
2. Check due date in preview and task card
3. Verify date is correct

**Pass Criteria**:
- ✅ Dates parsed correctly
- ✅ Displayed in readable format (e.g., "Feb 17, 2026")
- ✅ Time defaults to midnight

### Test 10: Error Handling

**Objective**: Verify app handles errors gracefully

**Test Cases**:
1. **Ollama not running**:
   - Stop Ollama
   - Try creating task
   - Expected: Fallback categorization with 50% confidence

2. **Supabase not running**:
   - Stop Supabase
   - Try creating task
   - Expected: Error message "Failed to create task"

3. **Empty input**:
   - Submit empty chat message
   - Expected: Send button disabled, no request made

**Pass Criteria**:
- ✅ Errors don't crash the app
- ✅ User-friendly error messages
- ✅ Fallback mechanisms work

## Manual Testing Checklist

### UI/UX
- [ ] Chat input accepts text
- [ ] Messages display in chronological order
- [ ] Confidence indicators show correct colors
- [ ] Action previews are readable
- [ ] Task cards display all metadata
- [ ] Status dropdown works
- [ ] Delete button shows confirmation
- [ ] Dark mode works (if system dark mode enabled)
- [ ] Responsive on different screen sizes

### Functionality
- [ ] Chat → Task creation works
- [ ] Project detection works
- [ ] Due date parsing works
- [ ] Priority assignment works
- [ ] Tags extraction works
- [ ] Task list filters work (All, To Do, In Progress, Done)
- [ ] Status changes persist
- [ ] Deletions persist
- [ ] Page refresh loads tasks correctly

### EventBus
- [ ] Check console for EventBus logs
- [ ] Verify `task:created` event fires
- [ ] Verify `task:updated` event fires
- [ ] Verify `task:deleted` event fires
- [ ] No unhandled errors in console

### Database
- [ ] Open Supabase Studio: http://localhost:54323
- [ ] Check `tasks` table has entries
- [ ] Check `projects` table has seed data (5 projects)
- [ ] Check `chat_messages` table has messages
- [ ] Verify UUIDs are valid
- [ ] Check timestamps are correct

## Performance Testing

### Response Times
- Chat input → AI response: < 3 seconds (depends on Ollama)
- Task creation → List update: < 500ms
- Status change: < 200ms

### Load Testing (Manual)
- Create 50+ tasks
- Verify list scrolls smoothly
- Check memory usage (should not spike)

## Known Issues / Limitations

### Phase 1
- No real-time updates (must refresh if using multiple tabs)
- AI categorization accuracy depends on Ollama model
- Single-user mode (user_id hardcoded)
- No task editing (can only change status or delete)
- No task search/filter by project

## Troubleshooting

### Issue: Chat doesn't respond
**Possible Causes**:
- Ollama not running
- Wrong Ollama URL in `.env.local`

**Solution**:
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Issue: Tasks don't save
**Possible Causes**:
- Supabase not running
- Database migration not applied

**Solution**:
```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start
```

### Issue: Page shows 404 or doesn't load
**Possible Causes**:
- Next.js not compiled
- Port conflict

**Solution**:
```bash
# Restart dev server
pnpm dev

# Check which port it's using (3001, 3002, etc.)
```

### Issue: TypeScript errors
**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules .next
pnpm install
```

## Success Criteria

Phase 1 is considered **COMPLETE** if:

- ✅ All 10 test cases pass
- ✅ No critical bugs in manual testing
- ✅ UI is clean, professional, easy to use
- ✅ EventBus events work correctly
- ✅ Database persists data
- ✅ AI categorization works at ≥70% accuracy
- ✅ Error handling is graceful

## Next Steps (Phase 2)

Once Phase 1 is verified:
1. Calendar integration
2. Task → Calendar event mapping
3. Recurring events
4. Calendar views (month/week/day)

See [FULL_PLAN.md](./FULL_PLAN.md) for complete roadmap.
