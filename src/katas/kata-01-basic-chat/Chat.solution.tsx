import { useState } from 'react';
import type React from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1: Initialize the Anthropic client
// ─────────────────────────────────────────────────────────────────────────────

// The client is created once at module scope, not inside the component.
// Creating it inside the component would produce a new instance on every render.
const client = new Anthropic({
  // ANTHROPIC_API_KEY is exposed to the browser via Vite's envPrefix config.
  // Without the VITE_ prefix (Vite's default), you must explicitly whitelist
  // the prefix in vite.config.ts: envPrefix: ['VITE_', 'ANTHROPIC_']
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

// messages and setMessages come from App (lifted state) so the conversation
// history survives tab switches. All other state is local — it resets on
// unmount, which is fine (loading spinner, partial stream text, etc. are
// transient by nature).
interface ChatProps {
  messages: MessageParam[];
  setMessages: React.Dispatch<React.SetStateAction<MessageParam[]>>;
}

export function Chat({ messages, setMessages }: ChatProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  // streamingText holds the partial assistant reply while a stream is in flight.
  // It is separate from messages so we can show incremental text without
  // committing an incomplete entry to the conversation history.
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNewChat = () => {
    setMessages([]);
    setStreamingText('');
    setError(null);
  };

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

    try {
      if (streamingEnabled) {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 3: Implement streaming
        // ─────────────────────────────────────────────────────────────────────

        setStreamingText('');
        // messages.stream() returns a helper that wraps the raw SSE stream.
        // It accumulates chunks internally and exposes both event callbacks
        // and a finalMessage() promise — no manual SSE parsing needed.
        const stream = client.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
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
        const assistantText =
          finalMessage.content[0].type === 'text' ? finalMessage.content[0].text : '';
        setMessages([...updatedMessages, { role: 'assistant', content: assistantText }]);
        // Clear the in-flight partial text now that it's committed to history.
        setStreamingText('');
        // ─────────────────────────────────────────────────────────────────────
      } else {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 2: Send a message (non-streaming)
        // ─────────────────────────────────────────────────────────────────────

        const response = await client.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          // The full conversation history is sent on every request — the API
          // is stateless. Claude has no memory across calls; context comes
          // entirely from the messages array we pass each time.
          messages: updatedMessages,
        });

        // response.content is an array that can contain text blocks, tool_use
        // blocks, or thinking blocks. For a plain chat turn it will always be
        // a single TextBlock, but checking .type guards against edge cases
        // (e.g. if a system prompt triggers a tool call).
        const assistantText = response.content[0].type === 'text' ? response.content[0].text : '';
        setMessages([...updatedMessages, { role: 'assistant', content: assistantText }]);
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

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 4: Structured output via tool_use
  // ─────────────────────────────────────────────────────────────────────────────

  interface SentimentResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    reasoning: string;
  }

  const analyzeLastMessage = async (): Promise<SentimentResult | null> => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return null;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      tools: [
        {
          name: 'record_sentiment',
          // The description is what the model reads to decide how to populate
          // the fields. Be explicit about what each call represents — vague
          // descriptions produce inconsistent outputs.
          description: 'Record the sentiment analysis of the given text.',
          input_schema: {
            // 'as const' is required because TypeScript widens the literal
            // type 'object' to string without it, failing the SDK's type check.
            type: 'object' as const,
            properties: {
              sentiment: {
                type: 'string',
                // enum constrains the model to one of these exact values,
                // making downstream TypeScript narrowing safe and reliable.
                enum: ['positive', 'negative', 'neutral'],
                description: 'The overall sentiment',
              },
              confidence: {
                type: 'number',
                description: 'Confidence score between 0 and 1',
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation of the classification',
              },
            },
            required: ['sentiment', 'confidence', 'reasoning'],
          },
        },
      ],
      // tool_choice: { type: 'tool' } forces the model to call this specific
      // tool instead of deciding on its own. This is the key to reliable
      // structured output — without it the model may respond in plain text.
      tool_choice: { type: 'tool', name: 'record_sentiment' },
      // A fresh single-turn conversation rather than the full chat history —
      // the tool is a side-call, not part of the ongoing dialogue.
      messages: [
        {
          role: 'user',
          content: `Analyze the sentiment of this text: "${typeof lastUserMsg.content === 'string' ? lastUserMsg.content : ''}"`,
        },
      ],
    });

    // response.content is an array; when tool_choice forces a tool call the
    // first (and only) block will be a ToolUseBlock. We find it defensively
    // in case the model returns an error text block instead.
    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') return null;
    // toolUse.input is typed as unknown by the SDK — we cast to our interface
    // because the JSON schema above guarantees the shape.
    return toolUse.input as SentimentResult;
  };
  // ─────────────────────────────────────────────────────────────────────────────

  // Suppresses the TypeScript "declared but never read" error while the
  // function is not yet wired to a UI button.
  void analyzeLastMessage;

  // MessageParam.content can be either a plain string or a ContentBlock array
  // (e.g. when tool results are present). This helper normalises both to string
  // for display purposes.
  const getTextContent = (msg: MessageParam): string => {
    if (typeof msg.content === 'string') return msg.content;
    const textBlock = msg.content.find((b) => b.type === 'text');
    return textBlock && 'text' in textBlock ? textBlock.text : '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleNewChat}>
          New Chat
        </Button>
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
              bgcolor: msg.role === 'user' ? 'primary.dark' : 'grey.800',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {msg.role}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {getTextContent(msg)}
            </Typography>
          </Paper>
        ))}
        {/* streamingText is rendered as a temporary bubble that disappears once
            the stream completes and the final message is committed to history. */}
        {streamingText && (
          <Paper
            elevation={1}
            sx={{ p: 1.5, maxWidth: '70%', alignSelf: 'flex-start', bgcolor: 'grey.800' }}
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
