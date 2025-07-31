import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/node';
import CssBaseline from '@mui/material/node/CssBaseline/index.js';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

import { PdfTextProvider } from '../src/context/PdfTextContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <PdfTextProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </PdfTextProvider>
  );
}
