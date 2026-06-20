# Anthropic Models

## Current Models

| Model | API Name | Best For | Input | Output |
|-------|----------|----------|-------|--------|
| Claude Opus 4 | `claude-opus-4-5` | Complex reasoning, hard tasks | $15 / MTok | $75 / MTok |
| Claude Sonnet 4 | `claude-sonnet-4-5` | Balanced performance and cost | $3 / MTok | $15 / MTok |
| Claude Haiku 4 | `claude-haiku-4-5` | Speed, high volume, low cost | $0.80 / MTok | $4 / MTok |

> MTok = million tokens. Prices as of June 2026 — check [anthropic.com/pricing](https://www.anthropic.com/pricing) for current rates.

## Which Model to Use

**In the katas** — all exercises use `claude-haiku-4-5`. It's fast, cheap, and capable enough for everything covered here.

**In production** — start with Haiku for latency-sensitive or high-volume tasks (classification, extraction, short replies). Move to Sonnet when you need stronger reasoning or longer outputs. Reach for Opus only when the task genuinely requires it — the cost difference is significant.

## Context Windows

All current Claude models support a **200k token** context window. For reference, 200k tokens is roughly 150,000 words — more than enough for any single conversation in this curriculum.

## Extended Thinking

Opus and Sonnet support extended thinking — the model reasons step-by-step before answering. Useful for complex multi-step problems. Not covered in this curriculum, but worth knowing exists.

**SDK reference**: [Models overview](https://docs.anthropic.com/en/docs/about-claude/models)
