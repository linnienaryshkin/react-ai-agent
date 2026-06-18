import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Chat as ChatExercise } from './katas/kata-01-basic-chat/Chat';
import { Chat as ChatSolution } from './katas/kata-01-basic-chat/Chat.solution';

interface LayoutProps {
  mode: 'light' | 'dark';
  onToggleTheme: () => void;
}

function Layout({ mode, onToggleTheme }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = location.pathname === '/solution' ? 1 : 0;

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
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={onToggleTheme} aria-label="toggle theme">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<ChatExercise />} />
          <Route path="/solution" element={<ChatSolution />} />
        </Routes>
      </Box>
    </Box>
  );
}

interface AppProps {
  mode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function App({ mode, onToggleTheme }: AppProps) {
  return (
    <BrowserRouter>
      <Layout mode={mode} onToggleTheme={onToggleTheme} />
    </BrowserRouter>
  );
}
