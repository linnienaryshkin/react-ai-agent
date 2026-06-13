import { describe, it, expect } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

// Tests run in Node, not the browser, so we initialize the client directly
// against api.anthropic.com without a proxy. The API key is read from the
// process environment (populated by a .env file via Vite / dotenv).
// dangerouslyAllowBrowser is not needed here — that flag only applies to
// browser runtimes where key exposure is a security concern.
const client = new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY,
});

describe('Prompt Engineering', () => {
  // Each test carries a 30-second timeout because the Anthropic API can take
  // several seconds to respond, especially under rate limiting. Vitest's
  // default timeout (5 s) is too short and produces false failures.

  it('should classify text correctly with a zero-shot prompt', async () => {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      // max_tokens: 10 is enough for a single-word classification response.
      // Setting it low keeps latency and cost minimal for this kind of test.
      max_tokens: 10,
      // temperature: 0 minimises randomness in the output, making the test
      // deterministic enough to assert on. It does not guarantee identical
      // output on every call, but makes divergence rare for clear-cut cases.
      temperature: 0,
      messages: [
        {
          role: 'user',
          // The prompt explicitly tells the model to respond with only the
          // label. Without this constraint the model may add explanation text
          // that breaks the string assertion below.
          content:
            'Classify the following text as "spam" or "not_spam". Respond with ONLY the classification, nothing else.\n\nText: "Congratulations! You won a $1000 gift card! Click here now!"',
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // .toLowerCase() makes the assertion case-insensitive — the model may
    // capitalise the label even when asked not to.
    expect(text.toLowerCase()).toContain('spam');
  }, 30000);

  it('should extract entities using a few-shot prompt', async () => {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      temperature: 0,
      tools: [
        {
          name: 'record_entities',
          description: 'Record extracted entities from text',
          input_schema: {
            type: 'object' as const,
            properties: {
              people: { type: 'array', items: { type: 'string' } },
              locations: { type: 'array', items: { type: 'string' } },
              organizations: { type: 'array', items: { type: 'string' } },
            },
            required: ['people', 'locations', 'organizations'],
          },
        },
      ],
      // Forcing the tool call guarantees a structured response every time.
      // Without tool_choice: 'tool', the model might answer in plain prose
      // at temperature 0 if it judges the text to be straightforward.
      tool_choice: { type: 'tool', name: 'record_entities' },
      messages: [
        {
          role: 'user',
          content:
            'Extract entities from: "John Smith works at Google in Mountain View, California."',
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === 'tool_use');
    expect(toolUse).toBeDefined();
    if (toolUse?.type === 'tool_use') {
      const result = toolUse.input as {
        people: string[];
        locations: string[];
        organizations: string[];
      };
      expect(result.people).toContain('John Smith');
      expect(result.organizations).toContain('Google');
      // .some() rather than .toContain() because the model may return
      // "Mountain View" and "California" as separate entries or combined.
      expect(result.locations.some((l) => l.includes('Mountain View'))).toBe(true);
    }
  }, 30000);

  it('should follow system prompt persona consistently', async () => {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 100,
      temperature: 0,
      // The system prompt establishes the persona. Claude treats it as a
      // high-priority instruction that applies to the entire conversation.
      // Repeating the rule ("ALWAYS", "Every response must") reinforces it —
      // without emphasis the model occasionally breaks character at temperature 0.
      system:
        'You are a pirate. You ALWAYS respond in pirate speak. Every response must contain "arrr" or "matey".',
      messages: [{ role: 'user', content: 'What is 2 + 2?' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.toLowerCase() : '';
    // We check for either keyword because the model may use one or the other
    // depending on how it phrases the pirate response.
    const hasPirateSpeak = text.includes('arrr') || text.includes('matey');
    expect(hasPirateSpeak).toBe(true);
  }, 30000);
});
