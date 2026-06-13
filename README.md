# AI Kata

Hands-on coding exercises for learning the Anthropic API and agentic patterns. Built for frontend engineers preparing for the **Anthropic Architect Certification**.

## Quick Start

```bash
# Install dependencies
npm install

# Set up your API key (see docs/API_KEY_SETUP.md for details)
cp .env.example .env
# Edit .env and paste your Anthropic API key

# Start the dev server
npm run dev
```

## Structure

Each kata lives in `src/katas/` with:

- `README.md` — instructions and learning objectives
- `*.tsx` — skeleton file with TODO markers (your workspace)
- `*.solution.tsx` — completed reference implementation

## Available Katas

1. **Basic Chat** — Client init, messages, streaming, structured output, prompt testing

See [docs/CURRICULUM_ROADMAP.md](docs/CURRICULUM_ROADMAP.md) for the full learning path.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run prompt engineering tests (requires API key) |

## Tech Stack

- React + TypeScript + Vite
- Material UI (MUI)
- @anthropic-ai/sdk
- Vitest

## Prerequisites

- Node.js 20+
- An Anthropic API key ([setup guide](docs/API_KEY_SETUP.md))
