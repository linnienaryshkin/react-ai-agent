# Curriculum Roadmap

Learning path for the Anthropic Architect Certification, built for frontend engineers.

## Kata 1: Basic Chat (Domain 4, 5)

Initialize the Anthropic client, manage conversation context, stream responses, extract structured data via tool_use, and write prompt regression tests.

**Skills**: SDK setup, MessageParam, streaming, tool_use for structured output, temperature control.

## Kata 2: Tool Use & Function Calling (Domain 2)

Build a chat that calls real tools — a weather lookup, a calculator, a URL fetcher. Learn the full tool lifecycle: define, invoke, execute, return results.

**Skills**: Tool definitions, input_schema, tool_result messages, multi-turn tool loops, error handling in tool responses.

## Kata 3: Agentic Loop (Domain 1)

Build a minimal autonomous agent that thinks, calls tools, observes results, and repeats until it reaches a goal. Introduces the core agentic pattern.

**Skills**: stop_reason detection, loop control, max iterations guard, result extraction, agent state management.

## Kata 4: Multi-Agent Orchestration (Domain 1)

An orchestrator spawns specialized sub-agents (researcher + writer) and coordinates their outputs. Teaches delegation and synthesis patterns.

**Skills**: Agent decomposition, context scoping per agent, result aggregation, orchestration strategies.

## Kata 5: MCP Integration (Domain 2)

Connect to a local MCP server and use tools discovered dynamically. Understand the difference between hardcoded tools and protocol-driven tool discovery.

**Skills**: MCP config, tool discovery, server lifecycle, transport setup, tool distribution patterns.

## Kata 6: Context Window Management (Domain 5)

Handle a conversation that grows beyond the context window. Implement progressive summarization and understand the risks of context loss.

**Skills**: Token counting, message pruning, summarization prompts, context positioning, degradation detection.

## Kata 7: Validation-Retry Loop (Domain 4, 5)

Request structured output, validate it against a schema, and retry with error feedback injected into the conversation. Multi-pass review pattern.

**Skills**: JSON Schema validation, retry strategies, error message injection, escalation patterns, confidence thresholds.

## Kata 8: Production Patterns (All Domains)

Capstone kata covering: system prompt versioning, a prompt regression test suite, cost estimation, retry-with-backoff, and rate limit handling.

**Skills**: Prompt versioning, cost tracking, retry logic, rate limit headers, production error handling.
