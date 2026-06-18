import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1: Send a message to the Anthropic API
// Initialize the client and make your first messages.create call.
// ─────────────────────────────────────────────────────────────────────────────

// The client is created once at module scope, not inside the component.
// Creating it inside the component would produce a new instance on every render.
const client = new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY,

  // The Anthropic API blocks browser requests at the network level (CORS +
  // org-level policy). We route through a Vite dev-server proxy defined in
  // vite.config.ts which strips the Origin header before forwarding to
  // api.anthropic.com, bypassing the CORS check.
  // window.location.origin is used because the SDK requires an absolute URL —
  // a relative path like '/api/anthropic' throws "Invalid URL" at construction time.
  baseURL: `${window.location.origin}/api/anthropic`,

  // Required when running in a browser context. The SDK throws without it as a
  // reminder that exposing an API key client-side is unsafe in production.
  // Acceptable here because this is a local learning environment.
  dangerouslyAllowBrowser: true,
});
// ─────────────────────────────────────────────────────────────────────────────

export function Chat() {
  const [messages, setMessages] = useState<MessageParam[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  // streamingText holds the partial assistant reply while a stream is in flight.
  // It is separate from messages so we can show incremental text without
  // committing an incomplete entry to the conversation history.
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: MessageParam = { role: 'user', content: input.trim() };
    // Build the updated array locally before calling setMessages so we can
    // pass it directly to the API. Reading state after setMessages would still
    // give us the old value within the same event loop tick.
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    // ─────────────────────────────────────────────────────────────────────────
    // TASK 5: Tool use — agent loop
    // Tools let the model take actions in the world. When the model decides to
    // call a tool, the API returns stop_reason: 'tool_use'. Your code executes
    // the tool, sends the result back as a tool_result turn, and calls the API
    // again — this request/execute/respond cycle is the agent loop.
    // ─────────────────────────────────────────────────────────────────────────

    // The set_theme tool lets the model toggle the app's light/dark mode
    // in response to a user request. It takes no input — toggling is
    // stateless from the model's perspective (it doesn't need to know
    // the current mode; window.toggleTheme handles that).
    const SET_THEME_TOOL: Anthropic.Tool = {
      name: 'set_theme',
      description:
        'Toggle the app color theme between light and dark mode. ' +
        'Call this when the user asks to switch, change, or toggle the theme.',
      input_schema: { type: 'object' as const, properties: {}, required: [] },
    };

    // Handles a completed model response: if the model called set_theme, executes
    // the tool and sends a follow-up to get the confirmation text; otherwise
    // commits the plain assistant text directly to the message list.
    const handleResponse = async (
      content: Anthropic.ContentBlock[],
      stopReason: string | null,
      priorMessages: MessageParam[],
    ) => {
      if (stopReason === 'tool_use') {
        const toolUseBlock = content.find((b) => b.type === 'tool_use');
        if (toolUseBlock && toolUseBlock.type === 'tool_use') {
          window.toggleTheme?.();

          const assistantToolTurn: MessageParam = { role: 'assistant', content };
          const toolResultTurn: MessageParam = {
            role: 'user',
            content: [{ type: 'tool_result' as const, tool_use_id: toolUseBlock.id, content: 'Theme toggled.' }],
          };
          const next = [...priorMessages, assistantToolTurn, toolResultTurn];
          setMessages(next);

          const followUp = await client.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            ...(systemPrompt.trim() && { system: systemPrompt.trim() }),
            tools: [SET_THEME_TOOL],
            messages: next,
          });
          const assistantText = followUp.content[0]?.type === 'text' ? followUp.content[0].text : '';
          setMessages([...next, { role: 'assistant', content: assistantText }]);
        }
      } else {
        const assistantText = content[0]?.type === 'text' ? content[0].text : '';
        setMessages([...priorMessages, { role: 'assistant', content: assistantText }]);
      }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // TASK 4: System message
    // A system message sets persistent instructions for the model that sit
    // outside the user/assistant turn structure. It is passed once per request
    // via the top-level `system` field — not inside `messages`.
    // ─────────────────────────────────────────────────────────────────────────

    try {
      if (!streamingEnabled) {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 2: Context management
        // The Anthropic API is stateless — it has no memory between calls.
        // Every request must include the full conversation history in `messages`
        // so the model can see what was said before.
        // ─────────────────────────────────────────────────────────────────────

        const response = await client.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          ...(systemPrompt.trim() && { system: systemPrompt.trim() }),
          tools: [SET_THEME_TOOL],
          // The full conversation history is sent on every request — the API
          // is stateless. Claude has no memory across calls; context comes
          // entirely from the messages array we pass each time.
          messages: updatedMessages,
        });

        // When stop_reason is 'tool_use' the model wants to call set_theme.
        // We execute it, then send a tool_result turn to get the final reply.
        await handleResponse(response.content, response.stop_reason, updatedMessages);
        // ─────────────────────────────────────────────────────────────────────
      } else {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 3: Streaming
        // Instead of waiting for the full response, messages.stream() returns
        // chunks as they arrive via SSE. Each text_delta event fires as the
        // model writes, letting you update the UI in real time.
        // ─────────────────────────────────────────────────────────────────────

        setStreamingText('');
        // messages.stream() returns a helper that wraps the raw SSE stream.
        // It accumulates chunks internally and exposes both event callbacks
        // and a finalMessage() promise — no manual SSE parsing needed.
        const stream = client.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          ...(systemPrompt.trim() && { system: systemPrompt.trim() }),
          tools: [SET_THEME_TOOL],
          messages: updatedMessages,
        });

        // The 'text' event fires on every text_delta chunk.
        // We use the functional updater form (prev => prev + text) because
        // multiple events can fire before React batches the state updates —
        // using the previous value directly would cause chunks to be dropped.
        stream.on('text', (text) => {
          setStreamingText((prev) => prev + text);
        });

        // finalMessage() resolves once the stream closes (message_stop event).
        // We use its content rather than the accumulated streamingText string
        // because the SDK has already assembled the canonical final message,
        // including metadata like stop_reason and usage tokens.
        const finalMessage = await stream.finalMessage();
        setStreamingText('');
        await handleResponse(finalMessage.content, finalMessage.stop_reason, updatedMessages);
        // ─────────────────────────────────────────────────────────────────────
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error('API call failed:', err);
    } finally {
      // finally runs whether the try block succeeded or threw, ensuring
      // loading is always cleared even if an error occurs mid-stream.
      setLoading(false);
    }
  };

  const renderMessageContent = (msg: MessageParam) => {
    const blocks = typeof msg.content === 'string'
      ? [{ type: 'text' as const, text: msg.content }]
      : msg.content;

    return blocks.map((block, i) => {
      if (block.type === 'text') {
        return (
          <Typography key={i} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {block.text}
          </Typography>
        );
      }
      // All non-text block types: render type label + JSON payload.
      const { type, ...rest } = block as unknown as { type: string; [k: string]: unknown };
      return (
        <Box key={i} sx={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.85 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{type}</Typography>
          <pre style={{ margin: 0 }}>{JSON.stringify(rest, null, 2)}</pre>
        </Box>
      );
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={streamingEnabled}
              onChange={(e) => setStreamingEnabled(e.target.checked)}
            />
          }
          label="Streaming"
        />
      </Box>

      <TextField
        label="System prompt"
        multiline
        minRows={2}
        maxRows={6}
        size="small"
        fullWidth
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Optional instructions sent before every conversation…"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((msg, i) => (
          <Paper
            key={i}
            elevation={1}
            sx={{
              p: 1.5,
              maxWidth: '70%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              bgcolor: msg.role === 'user' ? 'primary.main' : 'action.hover',
              ...(msg.role === 'user' && { color: 'primary.contrastText' }),
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {msg.role}
            </Typography>
            {renderMessageContent(msg)}
          </Paper>
        ))}
        {/* streamingText is rendered as a temporary bubble that disappears once
            the stream completes and the final message is committed to history. */}
        {streamingText && (
          <Paper
            elevation={1}
            sx={{ p: 1.5, maxWidth: '70%', alignSelf: 'flex-start', bgcolor: 'action.hover' }}
          >
            <Typography variant="caption" color="text.secondary">
              assistant
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {streamingText}
            </Typography>
          </Paper>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // Shift+Enter inserts a newline in the TextField; plain Enter sends.
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={loading}
        />
        <IconButton color="primary" onClick={handleSend} disabled={loading || !input.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
