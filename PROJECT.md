---
id: jzrflryf
name: "ADHD Productivity OS"
kind: app
lifecycle: paused
status: "yellow"
status_note: "Unverified, set yellow by default; phase 1 MVP per README; not run since February 2026"
summary: "Chat-first task manager: type what you need to do and a local model categorises it into PARA projects and tasks."
origin: mine
version: "0.1.0"
tags: [run:localhost, port:7429, nextjs]
repo: https://github.com/wcosgrove123/to-do-list.git
deploy: { target: local }
launch:
  - { name: dev, cmd: "pnpm dev", port: 7429 }
danger_zone: false
links: []
depends_on: [oll4m4sv]
created: 2026-09-17
---

## What it is
Next.js 15 on port 7429, pnpm, Supabase for storage, EventBus between feature modules in features/. Ollama does the categorisation.

## Big plan
README phases: calendar, email triage, notes.

## Small plans
- [ ] None recorded.

## Decisions
- None documented.

## Notes
- Last real commit 2026-02-23.
- scratch/archive/to-do-list-old is the earlier copy.
- 2026-09-17 — manifest written during homelab reorg
