import { describe, it } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// TASK 5: Prompt engineering test
// ─────────────────────────────────────────────────────────────────────────────
// This test calls the Anthropic API directly (no React component involved).
// It verifies that a carefully crafted prompt produces a predictable output shape.
//
// Steps:
//   1. Import Anthropic and create a client (same as Task 1)
//   2. Write a test that sends a fixed prompt with temperature: 0
//   3. Assert that the response matches expected criteria
//
// Example test ideas:
//   - Send "Classify this as spam or not spam: 'You won a prize!'" → expect "spam"
//   - Send a few-shot prompt for entity extraction → expect specific JSON shape
//   - Send a system prompt + user message → verify the response follows the persona
//
// Notes:
//   - This makes a REAL API call (costs ~$0.001 with Haiku)
//   - temperature: 0 makes output more deterministic
//   - These tests validate your prompt engineering, not the SDK itself
// ─────────────────────────────────────────────────────────────────────────────

describe('Prompt Engineering', () => {
  it.todo('should classify text correctly with a zero-shot prompt');

  it.todo('should extract entities using a few-shot prompt');

  it.todo('should follow system prompt persona consistently');
});
