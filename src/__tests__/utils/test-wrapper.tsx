import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/hooks/useToast';
import { MovieStatusProvider } from '@/contexts/MovieStatusContext';
import { toastSlice } from '@core/store/slices/toast.slice';

// Create a test store
const createTestStore = () =>
  configureStore({
    reducer: {
      toast: toastSlice.reducer,
    },
  });

// Create test theme
const theme = createTheme();

// Mock session
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: '2025-12-31T23:59:59.999Z',
};

import { Session } from 'next-auth';
import { Store } from '@reduxjs/toolkit';

interface TestWrapperProps {
  children: React.ReactNode;
  session?: Session | null;
  store?: Store;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  session = mockSession,
  store = createTestStore(),
}) => {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ToastProvider>
              <MovieStatusProvider>{children}</MovieStatusProvider>
            </ToastProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  );
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: {
    session?: Session | null;
    store?: Store;
  },
) => {
  return {
    ...render(<TestWrapper {...options}>{ui}</TestWrapper>),
  };
};

// Re-export everything from testing library
export * from '@testing-library/react';
