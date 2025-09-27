import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import { AppIcon } from '@core/components/app-icon';

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
          <Button
            component={Link}
            href="/"
            variant="contained"
            size="large"
            startIcon={<AppIcon icon="solar:home-bold" />}
          >
            Go Home
          </Button>

          <Button
            component={Link}
            href="/movies"
            variant="outlined"
            size="large"
            startIcon={<AppIcon icon="solar:video-library-bold" />}
          >
            Browse Movies
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
