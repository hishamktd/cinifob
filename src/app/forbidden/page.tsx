'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Container, Typography } from '@mui/material';
import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';

export default function ForbiddenPage() {
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
          <AppIcon icon="solar:shield-cross-bold" size={120} color="error" />

          <Typography variant="h1" sx={{ mt: 4, mb: 2, fontSize: { xs: '3rem', md: '4rem' } }}>
            403
          </Typography>

          <Typography variant="h4" gutterBottom>
            Access Forbidden
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
            You don&apos;t have permission to access this resource. If you believe this is a
            mistake, please contact support.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => router.push('/')}
              variant="contained"
              size="large"
              startIcon={<AppIcon icon="solar:home-bold" />}
            >
              Go Home
            </Button>

            <Button
              onClick={() => router.back()}
              variant="outlined"
              size="large"
              startIcon={<AppIcon icon="solar:arrow-left-bold" />}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
