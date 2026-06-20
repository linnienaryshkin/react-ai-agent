# Anthropic API Concepts

A practical reference for the concepts behind the katas. Read top to bottom once, then use as a reference while coding.

---

## max_tokens

`max_tokens` sets a hard cap on how many tokens the model can generate in a single response. The model stops as soon as it hits the limit — mid-sentence if needed.

```ts
client.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 1024, // required — there is no default
  messages: [...],
})
```

A token is roughly 0.75 words. `1024` tokens ≈ 750 words — enough for most conversational replies. For tasks that produce long output (code, essays, structured data), set it higher.

**Why it's required** — unlike some APIs, the Anthropic SDK has no default. You always declare intent upfront.

---

## Multi-Turn Conversations

The API is **stateless** — it has no memory between calls. Every request is independent. To have a conversation, you maintain a `history` array yourself and pass the full thing on every call.

```ts
const history: MessageParam[] = [];

// User sends a message
history.push({ role: 'user', content: 'Hello!' });

const response = await client.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 1024,
  messages: history, // full history every time
});

// Append the reply so it's included in the next call
history.push({ role: 'assistant', content: response.content });
```

Roles strictly alternate: `user`, `assistant`, `user`, `assistant`, … The API rejects requests where two consecutive messages share the same role.

**Why stateless?** — it makes the API simple, scalable, and transparent. You own the context, so you can summarize it, truncate it, or inject information at any point.

---

## Tool Functions

Tools let the model take actions — call an API, read a file, update the UI. You define what tools are available; the model decides when to call them.

A tool definition has three parts:

```ts
const MY_TOOL: Anthropic.Tool = {
  name: 'set_theme',                          // identifier the model uses to call it
  description:
    'Toggle the app color theme between light and dark mode. ' +
    'Call this when the user asks to switch, change, or toggle the theme.',
  input_schema: {                             // JSON Schema for the tool's parameters
    type: 'object',
    properties: {
      // define parameters here, or leave empty if the tool takes none
    },
    required: [],
  },
};
```

Pass tools in every request:

```ts
client.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 1024,
  tools: [MY_TOOL],
  messages: history,
});
```

**Writing good descriptions** — the description is the model's only guide for when and how to use the tool. Be explicit about the trigger condition ("call this when the user asks to…"). Vague descriptions lead to missed calls or wrong calls.

---

## The Agent Loop

When the model wants to use a tool, it doesn't execute it — it asks you to. Your code runs the tool and reports the result back. The model then produces its final reply. This request → execute → respond cycle is the **agent loop**.

`stop_reason` tells you why the model stopped generating:

| `stop_reason` | Meaning |
|---------------|---------|
| `'end_turn'` | Normal reply, nothing to do |
| `'tool_use'` | Model wants to call a tool — your code must handle it |
| `'max_tokens'` | Hit the token limit mid-response |

```ts
const response = await client.messages.create({ ... });

if (response.stop_reason === 'tool_use') {
  // 1. Find the tool_use block in the response
  const toolCall = response.content.find(b => b.type === 'tool_use');

  // 2. Execute the tool
  window.toggleTheme?.();

  // 3. Append the assistant's turn (which contains the tool call)
  history.push({ role: 'assistant', content: response.content });

  // 4. Append the tool result as a user turn
  history.push({
    role: 'user',
    content: [{ type: 'tool_result', tool_use_id: toolCall.id, content: 'Theme toggled.' }],
  });

  // 5. Call the API again — model produces its final reply
  const followUp = await client.messages.create({ ..., messages: history });
  history.push({ role: 'assistant', content: followUp.content });
}
```

The loop can repeat — if the follow-up response also has `stop_reason === 'tool_use'`, you handle it again. In production agents, this runs until `stop_reason === 'end_turn'`.

---

## Content Blocks

`response.content` is always an **array of blocks**, never a plain string. A single response can contain multiple blocks of different types.

```ts
// A response might look like:
response.content = [
  { type: 'text', text: 'Sure, I'll switch the theme for you.' },
  { type: 'tool_use', id: 'toolu_01...', name: 'set_theme', input: {} },
]
```

Common block types:

| Type | When it appears |
|------|-----------------|
| `text` | Any normal reply |
| `tool_use` | Model is calling a tool (`stop_reason === 'tool_use'`) |
| `tool_result` | Your code reporting back the result of a tool call (you construct this) |

When rendering messages, always iterate over blocks — never assume `content` is a string:

```ts
for (const block of response.content) {
  if (block.type === 'text') {
    console.log(block.text);
  } else if (block.type === 'tool_use') {
    console.log(`Tool called: ${block.name}`, block.input);
  }
}
```

A response can include multiple `tool_use` blocks if the model decides to call several tools in one turn. Handle all of them before sending back results.

---

**SDK reference**: [Messages API](https://docs.anthropic.com/en/api/messages) · [Tool use](https://docs.anthropic.com/en/docs/tool-use) · [Models](https://docs.anthropic.com/en/docs/about-claude/models)
