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
//
// Create a client instance at module scope (not inside the component).
// Pass:
//   - apiKey: import.meta.env.ANTHROPIC_API_KEY
//   - baseURL: `${window.location.origin}/api/anthropic`
//   - dangerouslyAllowBrowser: true
//
// const client = new Anthropic({ ... })
// ─────────────────────────────────────────────────────────────────────────────

export function Chat() {
  const [messages, setMessages] = useState<MessageParam[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: MessageParam = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      if (!streamingEnabled) {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 2: Context management
        // The Anthropic API is stateless — it has no memory between calls.
        // Every request must include the full conversation history in `messages`
        // so the model can see what was said before.
        //
        // Call client.messages.create() with:
        //   - model: 'claude-haiku-4-5'
        //   - max_tokens: 1024
        //   - messages: updatedMessages
        //
        // Extract the assistant text and append it to messages:
        //   const assistantText = response.content[0].type === 'text' ? response.content[0].text : '';
        //   setMessages([...updatedMessages, { role: 'assistant', content: assistantText }]);
        //
        // Your code here...
        // ─────────────────────────────────────────────────────────────────────
      } else {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 3: Streaming
        // Instead of waiting for the full response, messages.stream() returns
        // chunks as they arrive via SSE. Each text_delta event fires as the
        // model writes, letting you update the UI in real time.
        //
        // Use client.messages.stream() with the same params as messages.create.
        // Listen to the 'text' event to update streamingText incrementally:
        //   stream.on('text', (text) => setStreamingText((prev) => prev + text))
        // After the stream closes, call stream.finalMessage() to get the full
        // response, commit it to messages, and clear streamingText.
        //
        // Your code here...
        // ─────────────────────────────────────────────────────────────────────
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TASK 4: System message
    // A system message sets persistent instructions for the model that sit
    // outside the user/assistant turn structure. It is passed once per request
    // via the top-level `system` field — not inside `messages`.
    //
    // Pass systemPrompt.trim() as system: '...' in your messages.create /
    // messages.stream calls when it is non-empty.
    // ─────────────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────────────
    // TASK 5: Tool use — agent loop
    // Tools let the model take actions in the world. When the model decides to
    // call a tool, the API returns stop_reason: 'tool_use'. Your code executes
    // the tool, sends the result back as a tool_result turn, and calls the API
    // again — this request/execute/respond cycle is the agent loop.
    //
    // 1. Define a SET_THEME_TOOL (Anthropic.Tool) that calls window.toggleTheme()
    // 2. Pass tools: [SET_THEME_TOOL] in every messages.create / messages.stream call
    // 3. After the response, check stop_reason === 'tool_use'
    // 4. If so: call window.toggleTheme?.(), append the assistant tool-call turn
    //    and a tool_result turn to messages, then call the API again for the reply
    // ─────────────────────────────────────────────────────────────────────────
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
      const { type, ...rest } = block as unknown as { type: string; [k: string]: unknown };
      return (
        <Box key={i} sx={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.85 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{type}</Typography>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(rest, null, 2)}
          </pre>
        </Box>
      );
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <FormControlLabel
          control={
            <Switch checked={streamingEnabled} onChange={(e) => setStreamingEnabled(e.target.checked)}
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
        <Alert severity="error" onClose={() => setError(null)}>{error}
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
            <Typography variant="caption" sx={{ opacity: 0.7 }}>{msg.role}
            </Typography>
            {renderMessageContent(msg)}
          </Paper>
        ))}
        {streamingText && (
          <Paper
            elevation={1}
            sx={{ p: 1.5, maxWidth: '70%', alignSelf: 'flex-start', bgcolor: 'action.hover' }}
          >
            <Typography variant="caption" color="text.secondary">assistant
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{streamingText}
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
