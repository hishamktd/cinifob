import Link from 'next/link';
import { Box, Container, Typography } from '@mui/material';
import { AppIcon, AppButton } from '@core/components';
import { ROUTES } from '@core/constants';

export default function NotFound() {
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
        <AppIcon icon="solar:ghost-bold" size={120} color="primary" />

        <Typography variant="h1" sx={{ mt: 4, mb: 2, fontSize: { xs: '4rem', md: '6rem' } }}>
          404
        </Typography>

        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          Oops! The page you&apos;re looking for seems to have wandered off into the movie
          multiverse. Let&apos;s get you back on track.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <AppButton
            component={Link}
            href={ROUTES.HOME}
            variant="contained"
            size="large"
            startIcon="solar:home-bold"
          >
            Go Home
          </AppButton>

          <AppButton
            component={Link}
            href={ROUTES.MOVIES}
            variant="outlined"
            size="large"
            startIcon="solar:video-library-bold"
          >
            Browse Movies
          </AppButton>
        </Box>
      </Box>
    </Container>
  );
}
