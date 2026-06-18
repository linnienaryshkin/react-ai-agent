# Kata 1: Basic Chat

## Learning Objectives

By completing this kata you will learn to:

- Initialize the Anthropic TypeScript SDK in a browser environment
- Send messages to the API and handle responses
- Manage conversation history across a stateless API
- Stream responses in real-time using `messages.stream()`
- Provide persistent model instructions via a system message
- Give the model tools to act on the world and implement an agent loop

## Certification Domains Covered

- **Domain 1**: Agentic Architecture & Orchestration
- **Domain 4**: Prompt Engineering & Structured Output
- **Domain 5**: Context Management & Reliability

## Prerequisites

- API key set up (see [API_KEY_SETUP.md](../../../docs/API_KEY_SETUP.md))
- `npm install` completed
- `npm run dev` running

## Tasks

Open `Chat.tsx` and complete the five tasks in order:

### Task 1: Send a Message to the Anthropic API

Initialize the Anthropic client at module scope and make your first `messages.create` call:

- Pass `apiKey`, `baseURL: \`${window.location.origin}/api/anthropic\``, and `dangerouslyAllowBrowser: true`
- Call `client.messages.create()` with `model`, `max_tokens`, and `messages`
- Extract the assistant text from `response.content[0]` and append it to state

**SDK Reference**: [Client initialization](https://docs.anthropic.com/en/docs/initial-setup) · [Messages API](https://docs.anthropic.com/en/api/messages)

### Task 2: Context Management

The Anthropic API is stateless — it has no memory between calls. Make multi-turn conversation work:

- Pass the full `messages` array on every request so the model has prior context
- Append each new user and assistant turn to the local array before the next call

**SDK Reference**: [Messages API](https://docs.anthropic.com/en/api/messages)

### Task 3: Streaming

Instead of waiting for the full response, stream tokens as they arrive:

- Use `client.messages.stream()` with the same params as `messages.create`
- Listen to `stream.on('text', callback)` to update the UI incrementally
- Await `stream.finalMessage()` to get the canonical final message, then commit it to history

**SDK Reference**: [Streaming](https://docs.anthropic.com/en/api/messages-streaming)

### Task 4: System Message

Give the model persistent instructions that apply to every turn:

- Pass `system: '...'` as a top-level field alongside `messages` — not inside the array
- The system message is invisible to users but shapes every response

**SDK Reference**: [System prompts](https://docs.anthropic.com/en/docs/system-prompts)

### Task 5: Tool Use — Agent Loop

Let the model take actions in the world by defining a tool:

- Define a `set_theme` tool with `name`, `description`, and `input_schema`
- Pass `tools: [SET_THEME_TOOL]` in every API call
- When `stop_reason === 'tool_use'`, execute the tool (`window.toggleTheme?.()`)
- Append the assistant tool-call turn and a `tool_result` turn to messages
- Call the API again to get the model's confirmation — this cycle is the agent loop

**SDK Reference**: [Tool use](https://docs.anthropic.com/en/docs/tool-use)

## Verification

Once all tasks are complete:

1. Chat responds to messages
2. Conversation history is preserved across turns
3. Streaming toggle shows text appearing word by word
4. System prompt textarea shapes the model's responses
5. Asking to "switch theme" toggles light/dark mode and the model confirms

## Solution

If you get stuck, check `Chat.solution.tsx` for the complete implementation.
