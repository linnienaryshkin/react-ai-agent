import { useState } from 'react';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Chat as ChatExercise } from './katas/kata-01-basic-chat/Chat';
import { Chat as ChatSolution } from './katas/kata-01-basic-chat/Chat.solution';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = location.pathname === '/solution' ? 1 : 0;

  const [solutionMessages, setSolutionMessages] = useState<MessageParam[]>([]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ mr: 4 }}>
            AI Kata
          </Typography>
          <Tabs
            value={tab}
            onChange={(_, v) => navigate(v === 1 ? '/solution' : '/')}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab label="Exercise" />
            <Tab label="Solution" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<ChatExercise />} />
          <Route
            path="/solution"
            element={<ChatSolution messages={solutionMessages} setMessages={setSolutionMessages} />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
