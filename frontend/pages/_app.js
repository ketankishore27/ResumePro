import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/node';
import CssBaseline from '@mui/material/node/CssBaseline/index.js';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e676', // Bright green accent
      light: '#66ffa6',
      dark: '#00c853',
      contrastText: '#000',
    },
    secondary: {
      main: '#ff4081', // Pink accent
      light: '#ff79b0',
      dark: '#c60055',
      contrastText: '#000',
    },
    background: {
      default: '#0a0a0a', // Deep black
      paper: '#1a1a1a',   // Dark grey for cards/papers
    },
    surface: {
      main: '#212121',    // Medium grey for surfaces
      light: '#2a2a2a',   // Lighter grey
      dark: '#121212',    // Darker grey
    },
    text: {
      primary: '#ffffff',   // White text
      secondary: '#b0b0b0', // Light grey text
      disabled: '#666666',  // Disabled text
    },
    divider: '#333333',     // Dark dividers
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        '@keyframes focusRingPulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 230, 118, 0.45)' },
          '70%': { boxShadow: '0 0 0 6px rgba(0, 230, 118, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0, 230, 118, 0)' },
        },
        body: {
          background: 'url("/G500-2020-86-Deutsche-Telekom-GettyImages-1210335103.jpg") center center / cover no-repeat fixed',
          position: 'relative',
          minHeight: '100vh',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.92) 0%, rgba(26, 26, 26, 0.88) 100%)',
            zIndex: -1,
          }
        },
        '#nprogress': {
          pointerEvents: 'none',
        },
        '#nprogress .bar': {
          background: '#00e676',
          height: '3px',
        },
        '#nprogress .peg': {
          boxShadow: '0 0 10px #00e676, 0 0 5px #00e676',
        },
        '#nprogress .spinner': {
          display: 'none',
        },
        'a:focus-visible, button:focus-visible, [tabindex]:not([tabindex="-1"]):focus-visible, .MuiButtonBase-root:focus-visible': {
          outline: 'none',
          borderRadius: 8,
          transition: 'box-shadow 0.2s ease',
          boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)',
          animation: 'focusRingPulse 1.2s ease-in-out infinite',
        },
        '@media (prefers-reduced-motion: reduce)': {
          'a:focus-visible, button:focus-visible, [tabindex]:not([tabindex="-1"]):focus-visible, .MuiButtonBase-root:focus-visible': {
            animation: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(26, 26, 26, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(51, 51, 51, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 26, 26, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(51, 51, 51, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 230, 118, 0.15)',
            borderColor: 'rgba(0, 230, 118, 0.5)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 230, 118, 0.3)',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)'
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #00e676 30%, #4caf50 90%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(45deg, #00c853 30%, #388e3c 90%)',
            color: '#000000',
          },
          '&.Mui-disabled': {
            color: '#666666',
          }
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)'
          },
          '&.Mui-focusVisible': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)'
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#333333',
          color: '#ffffff',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)'
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)',
            animation: 'focusRingPulse 1.2s ease-in-out infinite',
          },
          '&.Mui-focusVisible': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)',
            animation: 'focusRingPulse 1.2s ease-in-out infinite',
          },
        },
        colorPrimary: {
          backgroundColor: '#00e676',
          color: '#000000',
        },
        colorSecondary: {
          backgroundColor: '#ff4081',
          color: '#000000',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(33, 33, 33, 0.05)',
            backdropFilter: 'blur(12px)',
            '& fieldset': {
              borderColor: 'rgba(51, 51, 51, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#00e676',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00e676',
            },
            // Keyboard focus ring on the entire input wrapper
            '&:focus-within': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)',
              animation: 'focusRingPulse 1.2s ease-in-out infinite',
              borderRadius: 8,
            },
            '&.Mui-focused': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)',
              animation: 'focusRingPulse 1.2s ease-in-out infinite',
              borderRadius: 8,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(33, 33, 33, 0.05)',
          backdropFilter: 'blur(12px)',
          borderRadius: 8,
          '& fieldset': {
            borderColor: 'rgba(51, 51, 51, 0.3)',
          },
          '&:hover fieldset': {
            borderColor: '#00e676',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#00e676',
          },
          '&:focus-within': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)',
            animation: 'focusRingPulse 1.2s ease-in-out infinite',
          },
          '&.Mui-focused': {
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(0, 230, 118, 0.9), 0 0 0 6px rgba(0, 230, 118, 0.25)',
            animation: 'focusRingPulse 1.2s ease-in-out infinite',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 26, 26, 0.05)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#333333',
        },
        head: {
          backgroundColor: 'rgba(33, 33, 33, 0.05)',
          backdropFilter: 'blur(12px)',
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#333333',
          borderRadius: 4,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#00e676',
        },
      },
    },
  },
});

import { PdfTextProvider } from '../src/context/PdfTextContext';
import { ToastProvider } from '../src/context/ToastContext';

export default function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
    const router = require('next/router').default;
    NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.08 });
    const handleStart = () => NProgress.start();
    const handleDone = () => NProgress.done();
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, []);
  return (
    <PdfTextProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </ThemeProvider>
    </PdfTextProvider>
  );
}
