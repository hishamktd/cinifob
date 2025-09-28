'use client';

import React, { createContext, useContext, useState } from 'react';

import { AlertColor } from '@mui/material';

import { Toast } from '@core/components/toast';

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op for SSR/test environments
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
      return {
        showToast: () => {},
      };
    }
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showToast = (msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast open={open} message={message} severity={severity} onClose={handleClose} />
    </ToastContext.Provider>
  );
};
