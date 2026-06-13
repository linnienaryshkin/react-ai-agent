# Kata 1: Basic Chat

## Learning Objectives

By completing this kata you will learn to:

- Initialize the Anthropic TypeScript SDK in a browser environment
- Manage a stateful conversation using `MessageParam[]`
- Send messages and receive complete responses
- Stream responses in real-time using `messages.stream()`
- Extract structured data via the `tool_use` technique
- Write prompt regression tests with deterministic output

## Certification Domains Covered

- **Domain 4**: Prompt Engineering & Structured Output
- **Domain 5**: Context Management & Reliability

## Prerequisites

- API key set up (see [API_KEY_SETUP.md](../../../docs/API_KEY_SETUP.md))
- `npm install` completed
- `npm run dev` running

## Tasks

Open `Chat.tsx` and complete the five tasks in order:

### Task 1: Initialize the Client

Import the Anthropic SDK and create a client instance. The key points:

- The API key is exposed via `import.meta.env.ANTHROPIC_API_KEY` (Vite convention)
- You must pass `dangerouslyAllowBrowser: true` since this runs in the browser
- The client is created once, outside the component

**SDK Reference**: [Client initialization](https://docs.anthropic.com/en/docs/initial-setup)

### Task 2: Send a Message (Non-Streaming)

Implement the basic request-response flow:

- Call `client.messages.create()` with model, max_tokens, and the full messages array
- The response object has a `content` array — the first element is a `TextBlock`
- Extract `.text` from it and append to conversation history

**SDK Reference**: [Messages API](https://docs.anthropic.com/en/api/messages)

### Task 3: Streaming

When the streaming toggle is on, use the streaming helper:

- `client.messages.stream()` returns a stream object
- Listen to `stream.on('text', callback)` for incremental chunks
- `await stream.finalMessage()` gives you the complete message when done
- Update `streamingText` state on each chunk, then commit to `messages` at the end

**SDK Reference**: [Streaming](https://docs.anthropic.com/en/api/messages-streaming)

### Task 4: Structured Output

Create a function that forces Claude to return structured JSON:

- Define a tool with `name`, `description`, and `input_schema` (JSON Schema)
- Use `tool_choice: { type: 'tool', name: '...' }` to force the model to call it
- The tool never actually executes — you just read the `.input` field as structured data
- This is the recommended pattern for reliable JSON extraction

**SDK Reference**: [Tool use](https://docs.anthropic.com/en/docs/tool-use)

### Task 5: Prompt Engineering Test

Open `Chat.test.ts` and implement the tests:

- Each test calls the API directly (no React)
- Use `temperature: 0` for maximum determinism
- Assert on the response content or structure
- Run with `npm run test`

**Tips**:

- These tests make real API calls (~$0.001 each with Haiku)
- `tool_use` with `tool_choice` is more reliable than asking for JSON in prose
- XML tags (`<input>`, `<examples>`) help Claude parse complex prompts

## Verification

Once all tasks are complete:

1. Run `npm run dev` — chat should work with real responses
2. Toggle streaming on — text should appear incrementally
3. Run `npm run test` — all prompt tests pass

## Solution

If you get stuck, check `Chat.solution.tsx` and `Chat.test.solution.ts` for the complete implementation.
