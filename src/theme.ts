import { createTheme, alpha } from '@mui/material/styles';

export function makeTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  const brand = {
    50: '#f0f4ff',
    100: '#dce6ff',
    200: '#b9cdff',
    300: '#8aabff',
    400: '#587ef7',
    500: '#3b5bdb',
    600: '#2f4ac4',
    700: '#263ba3',
    800: '#1e2e80',
    900: '#162162',
  };

  const base = createTheme({ palette: { mode } });

  return createTheme(base, {
    palette: {
      mode,
      primary: {
        main: brand[500],
        light: brand[400],
        dark: brand[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? brand[400] : brand[600],
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0f1117' : '#f5f7fa',
        paper: isDark ? '#1a1d27' : '#ffffff',
      },
      divider: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08),
      text: {
        primary: isDark ? '#e8eaf6' : '#1a1d2e',
        secondary: isDark ? '#9299b8' : '#5a6074',
      },
      action: {
        hover: isDark ? alpha(brand[400], 0.1) : alpha(brand[500], 0.06),
      },
    },

    typography: {
      fontFamily: '"Inter", "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h6: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      body2: {
        lineHeight: 1.65,
      },
      caption: {
        fontSize: '0.7rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
        fontWeight: 600,
      },
    },

    shape: {
      borderRadius: 10,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark
              ? `${alpha('#ffffff', 0.15)} transparent`
              : `${alpha('#000000', 0.15)} transparent`,
          },
          '::-webkit-scrollbar': { width: 6 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': {
            borderRadius: 99,
            background: isDark ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15),
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? `linear-gradient(135deg, #12152a 0%, #1a1d30 100%)`
              : `linear-gradient(135deg, ${brand[600]} 0%, ${brand[500]} 100%)`,
            boxShadow: isDark
              ? `0 1px 0 ${alpha('#ffffff', 0.06)}, 0 4px 24px ${alpha('#000000', 0.4)}`
              : `0 1px 0 ${alpha(brand[800], 0.1)}, 0 4px 20px ${alpha(brand[700], 0.25)}`,
            backdropFilter: 'blur(12px)',
          },
        },
      },

      MuiToolbar: {
        styleOverrides: {
          root: { minHeight: 56, paddingLeft: 20, paddingRight: 20 },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 56,
            paddingBottom: 0,
            opacity: 0.65,
            transition: 'opacity 0.2s',
            '&.Mui-selected': { opacity: 1 },
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: '3px 3px 0 0',
            backgroundColor: '#ffffff',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06)}`,
          },
          elevation1: {
            boxShadow: isDark
              ? `0 2px 8px ${alpha('#000000', 0.35)}`
              : `0 1px 4px ${alpha('#000000', 0.07)}, 0 2px 12px ${alpha('#000000', 0.04)}`,
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              fontSize: '0.9rem',
              transition: 'box-shadow 0.2s, border-color 0.2s',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: brand[400],
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(brand[500], 0.2)}`,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: brand[500],
                  borderWidth: 1.5,
                },
              },
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'background 0.18s, transform 0.1s',
            '&:active': { transform: 'scale(0.93)' },
            '&.Mui-disabled': { opacity: 0.35 },
          },
        },
      },

      MuiTypography: {
        styleOverrides: {
          caption: {
            letterSpacing: '0.06em',
          },
        },
      },
    },
  });
}
