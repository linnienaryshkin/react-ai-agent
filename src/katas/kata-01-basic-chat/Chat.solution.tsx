import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';

const client = new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY,

  /**
   * Vite dev-server proxy (vite.config.ts) forwards this to api.anthropic.com,
   * bypassing the browser CORS block. Requires an absolute URL.
   */
  baseURL: `${window.location.origin}/api/anthropic`,

  /** Required in browser contexts — safe here since this is a local dev environment. */
  dangerouslyAllowBrowser: true,
});
/** ─────────────────────────────────────────────────────────────────────────── */

export function Chat() {
  const [messages, setMessages] = useState<MessageParam[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      const userMessage: MessageParam = { role: 'user', content: input.trim() };

      if (!userMessage.content || loading) return;

      /**
       * The API is stateless — every request must include the full conversation
       * history so the model knows what was said before.
       */
      const history: MessageParam[] = [...messages, userMessage];
      setMessages(history);
      setInput('');
      setLoading(true);

      /**
       * Tools are declared in the request; the model decides when to call them.
       * The input_schema describes the tool's parameters (none here).
       */
      const SET_THEME_TOOL: Anthropic.Tool = {
        name: 'set_theme',
        description:
          'Toggle the app color theme between light and dark mode. ' +
          'Call this when the user asks to switch, change, or toggle the theme.',
        input_schema: { type: 'object' as const, properties: {}, required: [] },
      };

      const PRINT_TOOL: Anthropic.Tool = {
        name: 'print_conversation',
        description:
          'Print the current conversation using the browser print dialog. ' +
          'Call this when the user asks to print, save, or export the chat.',
        input_schema: { type: 'object' as const, properties: {}, required: [] },
      };

      /**
       * response.content is an array of blocks (text, tool_use, etc.).
       * response.stop_reason signals why the model stopped: 'end_turn' for a
       * normal reply, 'tool_use' when it wants to call a tool.
       */
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        tools: [SET_THEME_TOOL, PRINT_TOOL],
        messages: history,
      });
      history.push({ role: 'assistant', content: response.content });
      setMessages([...history]);

      if (response.stop_reason === 'tool_use') {
        /**
         * A response can contain multiple tool_use blocks — every one must get
         * a corresponding tool_result in the next user turn or the API errors.
         */
        const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
        const toolResults = toolUseBlocks.map((block) => {
          if (block.type !== 'tool_use') return null;
          let content = '';
          if (block.name === 'set_theme') {
            window.toggleTheme?.();
            content = 'Theme toggled.';
          } else if (block.name === 'print_conversation') {
            window.print();
            content = 'Print dialog opened.';
          }
          return { type: 'tool_result' as const, tool_use_id: block.id, content };
        }).filter(Boolean) as ToolResultBlockParam[];

        if (toolResults.length > 0) {
          history.push({ role: 'user', content: toolResults });
          setMessages([...history]);

          /**
           * After executing the tool, send the result back so the model can
           * produce its final reply — this request/execute/respond cycle is the agent loop.
           */
          const followUp = await client.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            tools: [SET_THEME_TOOL, PRINT_TOOL],
            messages: history,
          });

          history.push({ role: 'assistant', content: followUp.content });
          setMessages([...history]);
        }
      }
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
      /** All non-text block types: render type label + JSON payload. */
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
          /** Shift+Enter inserts a newline in the TextField; plain Enter sends. */
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
