import { useState } from 'react';
// import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1: First message
// Create an Anthropic client at module scope. Call client.messages.create()
// inside handleSend, append the assistant reply to messages, and display it.
//
// const client = new Anthropic({
//   apiKey: import.meta.env.ANTHROPIC_API_KEY,
//   baseURL: `${window.location.origin}/api/anthropic`,
//   dangerouslyAllowBrowser: true,
// });
// ─────────────────────────────────────────────────────────────────────────────

export function Chat() {
  const [messages, setMessages] = useState<MessageParam[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      const userMessage: MessageParam = { role: 'user', content: input.trim() };

      if (!userMessage.content || loading) return;

      const history: MessageParam[] = [...messages, userMessage];
      setMessages(history);
      setInput('');
      setLoading(true);

      // ───────────────────────────────────────────────────────────────────────
      // TASK 2: Context management
      // The API is stateless — pass the full history on every request so the
      // model knows what was said before. Append the assistant reply to history.
      //
      // Your code here...
      // ───────────────────────────────────────────────────────────────────────

      // ───────────────────────────────────────────────────────────────────────
      // TASK 3: Tool use — agent loop
      // Define a set_theme tool and pass it in every request. When stop_reason
      // is 'tool_use', call window.toggleTheme?.(), send the tool_result turn,
      // then call the API again to get the model's final reply.
      //
      // Your code here...
      // ───────────────────────────────────────────────────────────────────────
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (msg: MessageParam) => {
    const blocks =
      typeof msg.content === 'string'
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
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {type}
          </Typography>
          <pre style={{ margin: 0 }}>{JSON.stringify(rest, null, 2)}</pre>
        </Box>
      );
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 2 }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((msg, i) => (
          <Paper
            key={i}
            elevation={1}
            sx={{
              p: 1.5,
              maxWidth: '70%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              bgcolor: msg.role === 'user' ? 'secondary.main' : 'action.hover',
              ...(msg.role === 'user' && { color: 'secondary.contrastText' }),
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {msg.role}
            </Typography>
            {renderMessageContent(msg)}
          </Paper>
        ))}
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
