'use client';

import { useRouter } from 'next/navigation';
import { Box, Container, Typography } from '@mui/material';
import { AppIcon, AppButton } from '@core/components';
import { MainLayout } from '@core/components/layout/main-layout';
import { ROUTES } from '@core/constants';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 200px)',
            textAlign: 'center',
          }}
        >
          <AppIcon icon="solar:lock-keyhole-bold" size={120} color="warning" />

          <Typography variant="h1" sx={{ mt: 4, mb: 2, fontSize: { xs: '3rem', md: '4rem' } }}>
            401
          </Typography>

          <Typography variant="h4" gutterBottom>
            Unauthorized Access
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
            You need to be logged in to access this page. Please sign in to continue enjoying your
            movie collection.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <AppButton
              onClick={() => router.push(ROUTES.LOGIN)}
              variant="contained"
              size="large"
              startIcon="solar:login-bold"
            >
              Sign In
            </AppButton>

            <AppButton
              onClick={() => router.push(ROUTES.REGISTER)}
              variant="outlined"
              size="large"
              startIcon="solar:user-plus-bold"
            >
              Sign Up
            </AppButton>
          </Box>

          <AppButton
            onClick={() => router.back()}
            variant="text"
            sx={{ mt: 2 }}
            startIcon="solar:arrow-left-bold"
          >
            Go Back
          </AppButton>
        </Box>
      </Container>
    </MainLayout>
  );
}
