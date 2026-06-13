import { useState } from 'react';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1: Initialize the Anthropic client
// ─────────────────────────────────────────────────────────────────────────────
// Import Anthropic from '@anthropic-ai/sdk' and create a client instance.
// You need to pass:
//   - apiKey: import.meta.env.ANTHROPIC_API_KEY
//   - baseURL: `${window.location.origin}/api/anthropic`  (Vite proxy avoids browser CORS issues)
//   - dangerouslyAllowBrowser: true
//
// const client = ...

// ─────────────────────────────────────────────────────────────────────────────

export function Chat() {
  const [messages, setMessages] = useState<MessageParam[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const handleNewChat = () => {
    setMessages([]);
    setStreamingText('');
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: MessageParam = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      if (streamingEnabled) {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 3: Implement streaming
        // ─────────────────────────────────────────────────────────────────────
        // Use client.messages.stream() with:
        //   - model: 'claude-haiku-4-5'
        //   - max_tokens: 1024
        //   - messages: updatedMessages
        //
        // Listen to the 'text' event to update streamingText in real-time.
        // After the stream completes (await stream.finalMessage()), add the
        // full assistant response to the messages array and clear streamingText.
        //
        // Your code here...
        // ─────────────────────────────────────────────────────────────────────
      } else {
        // ─────────────────────────────────────────────────────────────────────
        // TASK 2: Send a message (non-streaming)
        // ─────────────────────────────────────────────────────────────────────
        // Call client.messages.create() with:
        //   - model: 'claude-haiku-4-5'
        //   - max_tokens: 1024
        //   - messages: updatedMessages
        //
        // Extract the text from the response:
        //   response.content[0] has type 'text' and a .text property.
        //
        // Add the assistant message to the messages state:
        //   setMessages([...updatedMessages, { role: 'assistant', content: assistantText }]);
        //
        // Your code here...
        // ─────────────────────────────────────────────────────────────────────
      }
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 4: Structured output via tool_use
  // ─────────────────────────────────────────────────────────────────────────────
  // Create a function that extracts structured data from the conversation.
  // Define a tool with a JSON schema (e.g. sentiment analysis) and use
  // tool_choice: { type: 'tool', name: 'your_tool_name' } to force a tool call.
  //
  // Example signature:
  //   async function analyzeLastMessage(): Promise<{ sentiment: string; confidence: number }>
  //
  // Steps:
  //   1. Define a tool with name, description, and input_schema
  //   2. Call client.messages.create() with tools and tool_choice
  //   3. Find the tool_use block in response.content
  //   4. Return toolUseBlock.input as your typed result
  //
  // Your code here...
  // ─────────────────────────────────────────────────────────────────────────────

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
