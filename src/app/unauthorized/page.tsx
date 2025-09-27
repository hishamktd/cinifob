'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Container, Typography } from '@mui/material';
import { AppIcon } from '@core/components/app-icon';
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
            <Button
              onClick={() => router.push(ROUTES.LOGIN)}
              variant="contained"
              size="large"
              startIcon={<AppIcon icon="solar:login-bold" />}
            >
              Sign In
            </Button>

            <Button
              onClick={() => router.push(ROUTES.REGISTER)}
              variant="outlined"
              size="large"
              startIcon={<AppIcon icon="solar:user-plus-bold" />}
            >
              Sign Up
            </Button>
          </Box>

          <Button
            onClick={() => router.back()}
            variant="text"
            sx={{ mt: 2 }}
            startIcon={<AppIcon icon="solar:arrow-left-bold" />}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}
