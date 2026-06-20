# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # ESLint
npm run format    # Prettier (formats src/)
```

## Architecture

This is a React + TypeScript + Vite app that serves as a hands-on learning curriculum for the Anthropic TypeScript SDK. It targets frontend engineers preparing for the Anthropic Architect Certification.

**Kata structure** — each kata lives under `src/katas/kata-NN-<name>/` and contains:

- `<Component>.tsx` — skeleton with task stubs (the learner's workspace)
- `<Component>.solution.tsx` — completed reference implementation
- `README.md` — learning objectives and task instructions

**App shell** (`src/App.tsx`) — renders the active kata's Exercise and Solution side-by-side via React Router tabs (`/` = exercise, `/solution` = solution). Theme state (light/dark) lives in `main.tsx` and is persisted in the `?theme=` URL param. `window.toggleTheme()` is exposed globally for the tool-use kata task.

**API proxy** — the Vite dev server proxies `/api/anthropic` → `https://api.anthropic.com` to avoid CORS in the browser. Kata components must set `baseURL: \`${window.location.origin}/api/anthropic\`` and `dangerouslyAllowBrowser: true` when constructing the Anthropic client.

**Env vars** — `ANTHROPIC_API_KEY` is exposed to the browser via `import.meta.env.ANTHROPIC_API_KEY` (`envPrefix: ['ANTHROPIC_']` in `vite.config.ts`). Copy from `.env.example`.

## Kata Curriculum

Only Kata 1 (Basic Chat) is implemented. It covers three tasks in order:

1. Send a message to the Anthropic API
2. Context management — stateless API, full history in every request
3. Tool use — agent loop, `set_theme` tool, `stop_reason: 'tool_use'`

New katas should follow the existing file/folder conventions and target these certification domains:

- Domain 1: Agentic Architecture & Orchestration
- Domain 2: Tool Design & MCP Integration
- Domain 4: Prompt Engineering & Structured Output
- Domain 5: Context Management & Reliability

`docs/ANTHROPIC_API.md` covers key API concepts (stateless multi-turn, tool definitions, agent loop). `docs/MODELS.md` lists current Claude model IDs and pricing.
