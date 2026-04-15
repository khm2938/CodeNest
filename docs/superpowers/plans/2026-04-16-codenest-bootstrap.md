# CodeNest Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dockerized project scaffold for the CodeNest app and add a reusable prompt library organized by task type.

**Architecture:** Use a single development container as the initial project shell. Keep the application source intentionally thin for now, while separating stable prompt templates from mutable project state so future tasks can load only what they need. The prompt library is organized by workflow stage: core, planning, and execution.

**Tech Stack:** Docker, Docker Compose, Markdown

---

### Task 1: Create the project root scaffold

**Files:**
- Create: `CodeNest/Dockerfile`
- Create: `CodeNest/docker-compose.yml`
- Create: `CodeNest/.dockerignore`
- Create: `CodeNest/.gitignore`
- Create: `CodeNest/README.md`
- Create: `CodeNest/app/README.md`

- [ ] **Step 1: Add the docker runtime files**

```dockerfile
FROM node:22-bookworm-slim

WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash ca-certificates curl git \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development

CMD ["sleep", "infinity"]
```

- [ ] **Step 2: Add the compose service**

```yaml
services:
  workspace:
    build:
      context: .
      dockerfile: Dockerfile
    working_dir: /workspace
    volumes:
      - .:/workspace
    stdin_open: true
    tty: true
    command: sleep infinity
```

- [ ] **Step 3: Add ignore rules and root docs**

```gitignore
node_modules
.env
.DS_Store
```

```markdown
# CodeNest

This repository starts as a dockerized workspace for a Notion-style productivity app.

## Current scope

- Project scaffolding only
- Prompt library for planning and execution
- Mutable project state stored separately from prompts

## Start the container

```powershell
docker compose up -d --build
```
```

```markdown
# App Source

Application code will live here once the first product slice is implemented.
```

- [ ] **Step 4: Verify the scaffold is coherent**

Run:

```powershell
Get-ChildItem -Recurse CodeNest
```

Expected:
- `Dockerfile`, `docker-compose.yml`, `README.md`, `.gitignore`, `.dockerignore`
- `app/`, `prompts/`, `state/`, `docs/superpowers/plans/`

- [ ] **Step 5: Commit**

```bash
git add CodeNest
git commit -m "chore: add CodeNest scaffold"
```

### Task 2: Add the prompt library

**Files:**
- Create: `CodeNest/prompts/00-index.md`
- Create: `CodeNest/prompts/10-core/11-project-master.md`
- Create: `CodeNest/prompts/10-core/12-feature-design.md`
- Create: `CodeNest/prompts/10-core/13-feature-breakdown.md`
- Create: `CodeNest/prompts/10-core/14-priority.md`
- Create: `CodeNest/prompts/20-planning/21-user-flow.md`
- Create: `CodeNest/prompts/20-planning/22-component-breakdown.md`
- Create: `CodeNest/prompts/20-planning/23-data-model.md`
- Create: `CodeNest/prompts/20-planning/24-contracts.md`
- Create: `CodeNest/prompts/20-planning/25-testing.md`
- Create: `CodeNest/prompts/20-planning/26-mvp-cut.md`
- Create: `CodeNest/prompts/30-execution/31-implementation.md`
- Create: `CodeNest/prompts/30-execution/32-review-qa.md`
- Create: `CodeNest/prompts/30-execution/33-documentation.md`
- Create: `CodeNest/prompts/30-execution/34-architecture-comparison.md`
- Create: `CodeNest/prompts/30-execution/35-expansion-decision.md`

- [ ] **Step 1: Add the index and core templates**

```markdown
# Prompt Index

## Core

- `10-core/11-project-master.md` - project rules and operating model
- `10-core/12-feature-design.md` - turn an idea into a spec
- `10-core/13-feature-breakdown.md` - split a feature into buildable slices
- `10-core/14-priority.md` - rank candidate features for MVP

## Planning

- `20-planning/21-user-flow.md` - map the user journey
- `20-planning/22-component-breakdown.md` - split UI and state boundaries
- `20-planning/23-data-model.md` - design the minimum data model
- `20-planning/24-contracts.md` - define API or function contracts
- `20-planning/25-testing.md` - split testing into concrete cases
- `20-planning/26-mvp-cut.md` - remove non-essential scope

## Execution

- `30-execution/31-implementation.md` - implement the scoped task
- `30-execution/32-review-qa.md` - review for regressions and risks
- `30-execution/33-documentation.md` - update docs after change
- `30-execution/34-architecture-comparison.md` - compare implementation approaches
- `30-execution/35-expansion-decision.md` - decide whether to ship now or defer
```

- [ ] **Step 2: Add the workflow templates**

Write the markdown bodies into the files listed above. Use the approved prompt set from the design stage, grouped into:
- Core templates for project rules and feature definition
- Planning templates for flow, data, contracts, and MVP cuts
- Execution templates for implementation, review, documentation, and expansion decisions

- [ ] **Step 3: Verify the folder structure**

Run:

```powershell
Get-ChildItem -Recurse CodeNest\prompts
```

Expected:
- Numbered folders for core, planning, and execution
- Markdown files for each reusable prompt template

### Task 3: Add mutable project state files

**Files:**
- Create: `CodeNest/state/current-state.md`
- Create: `CodeNest/state/decisions.md`
- Create: `CodeNest/state/backlog.md`

- [ ] **Step 1: Add the state files**

```markdown
# Current State

- Product: Notion-style productivity app
- Scope: scaffold only
- Next: first small product slice
```

```markdown
# Decisions

- Keep prompts separate from mutable project state
- Start with one development container
```

```markdown
# Backlog

- First page editing slice
- Persisted pages
- Minimal navigation
```

- [ ] **Step 2: Verify the state layout**

Run:

```powershell
Get-ChildItem -Recurse CodeNest\state
```

Expected:
- `current-state.md`
- `decisions.md`
- `backlog.md`
