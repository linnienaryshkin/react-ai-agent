# AI Kata

Hands-on coding exercises for learning the Anthropic API and building agentic systems — in a running React app, in your browser, right now.

No toy scripts. Every kata is a real UI where you write the API code and immediately see it work.

## Who this is for

- **React engineers** who want to understand how the Anthropic API actually works — streaming, context, tool use — using patterns they already know
- **Agent builders** who want hands-on experience with agentic loops, tool design, and orchestration in a friendly JS environment
- **Certification candidates** preparing for the Anthropic Architect Certification and want to cover the exam domains through practice, not memorization

## Quick Start

```bash
npm install
cp .env.example .env   # paste your Anthropic API key
npm run dev            # http://localhost:5173
```

Each kata opens side-by-side: your workspace on the left, the reference solution on the right.

## Katas

| # | Name | What you build |
|---|------|----------------|
| 1 | **Basic Chat** | A working chat UI — API client, streaming, context management, and a tool-use agent loop |

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
