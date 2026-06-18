import { createTheme } from '@mui/material/styles';

export function makeTheme(mode: 'light' | 'dark') {
  return createTheme({ palette: { mode } });
}
