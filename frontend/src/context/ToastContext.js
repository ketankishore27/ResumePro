import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';

const ToastContext = createContext({
  showToast: (_message, _severity = 'info', _duration) => {},
});

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [autoHideDuration, setAutoHideDuration] = useState(3000);
  const [fadeOut, setFadeOut] = useState(false);

  const showToast = useCallback((msg, sev = 'info', duration = 3000) => {
    setMessage(msg);
    setSeverity(sev);
    setAutoHideDuration(duration);
    setFadeOut(false);
    setOpen(true);
    
    // For error messages, start fade-out after 2 seconds
    if (sev === 'error') {
      setTimeout(() => {
        setFadeOut(true);
      }, 2000);
    }
  }, []);

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return;
    setFadeOut(true);
  };
  
  // Handle the actual closing after fade-out animation completes
  useEffect(() => {
    if (fadeOut) {
      const timer = setTimeout(() => {
        setOpen(false);
        setFadeOut(false);
      }, 300); // Match the fade duration
      return () => clearTimeout(timer);
    }
  }, [fadeOut]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
        TransitionProps={{
          style: {
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 300ms ease-out'
          }
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            // Match app theme colors more closely
            bgcolor:
              severity === 'success'
                ? 'primary.main'
                : severity === 'error'
                ? 'error.main'
                : severity === 'warning'
                ? 'warning.main'
                : 'info.main',
            color: '#000',
            '& .MuiAlert-icon': { color: '#000' },
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
