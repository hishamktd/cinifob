'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography } from '@mui/material';
import { AppIcon, AppButton } from '@core/components';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <AppIcon icon="solar:danger-triangle-bold" size={120} color="error" />

        <Typography variant="h1" sx={{ mt: 4, mb: 2, fontSize: { xs: '3rem', md: '4rem' } }}>
          Something went wrong!
        </Typography>

        <Typography variant="h5" gutterBottom color="text.secondary">
          We encountered an unexpected error
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          Don&apos;t worry, even the best movies have bloopers. We&apos;ve logged this issue and our
          team will look into it. Please try again or go back to the homepage.
        </Typography>

        {process.env.NODE_ENV === 'development' && error.message && (
          <Box
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 1,
              bgcolor: 'error.light',
              color: 'error.contrastText',
              maxWidth: 600,
              width: '100%',
            }}
          >
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {error.message}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <AppButton
            onClick={() => reset()}
            variant="contained"
            size="large"
            startIcon="solar:refresh-bold"
          >
            Try Again
          </AppButton>

          <AppButton
            onClick={() => router.push('/')}
            variant="outlined"
            size="large"
            startIcon="solar:home-bold"
          >
            Go Home
          </AppButton>
        </Box>
      </Box>
    </Container>
  );
}
