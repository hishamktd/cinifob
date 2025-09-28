'use client';

import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { ToastProps } from './types';

export const Toast = ({
  open,
  message,
  severity = 'info',
  duration = 3000,
  onClose,
}: ToastProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export type { ToastProps } from './types';
