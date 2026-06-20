# Kata 1: Basic Chat

You'll build a working chat interface backed by the Anthropic API — from a blank client all the way to an agent that can take actions in the UI.

## What you'll learn

- How to initialize the Anthropic SDK in a browser environment
- Why the API is stateless and how to manage conversation context yourself
- How to give the model a tool and implement the agent loop that drives it

## Certification domains covered

- **Domain 1**: Agentic Architecture & Orchestration
- **Domain 2**: Tool Design & MCP Integration
- **Domain 5**: Context Management & Reliability

## Tasks

Open `Chat.tsx` and complete the tasks in order. The solution is in `Chat.solution.tsx` if you get stuck.

### Task 1: Send your first message

Create an Anthropic client and call the API:

- Create `new Anthropic({ apiKey, baseURL, dangerouslyAllowBrowser: true })` at module scope
- Call `client.messages.create()` with `model`, `max_tokens`, and `messages`
- Display the assistant reply in the chat

**SDK reference**: [Client setup](https://docs.anthropic.com/en/docs/initial-setup) · [Messages API](https://docs.anthropic.com/en/api/messages)

### Task 2: Context management

The API has no memory — every call starts fresh. You own the history:

- Build a `history` array from all prior messages plus the new user message
- Pass the full `history` on every request
- Append each assistant reply to `history` before the next call

**SDK reference**: [Messages API](https://docs.anthropic.com/en/api/messages)

### Task 3: Tool use — agent loop

Let the model take real actions. You'll wire up a `set_theme` tool that toggles the UI between light and dark mode:

- Define the tool with `name`, `description`, and `input_schema`
- Pass `tools: [SET_THEME_TOOL]` in every API call
- When `stop_reason === 'tool_use'`, call `window.toggleTheme?.()` to execute it
- Append the assistant tool-call turn and a `tool_result` turn to `history`
- Call the API again to get the model's confirmation — this is the agent loop

Try asking: *"switch to dark mode"* and watch the model decide to use the tool.

**SDK reference**: [Tool use](https://docs.anthropic.com/en/docs/tool-use)

---

## Verification checklist

- [ ] Chat responds to messages
- [ ] Conversation history is preserved across turns
- [ ] Asking to "switch theme" toggles light/dark mode and the model confirms it did
