# AI Kata

Hands-on coding exercises for learning the Anthropic API and agentic patterns. Built for frontend engineers preparing for the **Anthropic Architect Certification**.

## Quick Start

```bash
npm install
cp .env.example .env   # paste your Anthropic API key
npm run dev            # http://localhost:5173
```

## Structure

Each kata lives in `src/katas/` with:

- `README.md` — instructions and learning objectives
- `*.tsx` — skeleton file with task stubs (your workspace)
- `*.solution.tsx` — completed reference implementation

## Available Katas

1. **Basic Chat** — API client, context management, streaming, system messages, tool use

See [docs/CURRICULUM_ROADMAP.md](docs/CURRICULUM_ROADMAP.md) for the full learning path.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Tech Stack

- React + TypeScript + Vite
- Material UI (MUI)
- @anthropic-ai/sdk

## Prerequisites

- Node.js 20+
- An Anthropic API key ([setup guide](docs/API_KEY_SETUP.md))
