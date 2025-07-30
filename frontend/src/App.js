import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import ResumeInsights from './components/ResumeInsights';
import ResumeQuery from './components/ResumeQuery';
import UserRequest from './components/UserRequest';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<ResumeInsights />} />
          <Route path="/query" element={<ResumeQuery />} />
          <Route path="/request" element={<UserRequest />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
