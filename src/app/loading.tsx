import { Box, CircularProgress, Container } from '@mui/material';

export default function Loading() {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
        }}
      >
        <CircularProgress size={60} />
        <Box sx={{ textAlign: 'center' }}>
          <Box component="span" sx={{ fontSize: '1.2rem', color: 'text.secondary' }}>
            Loading amazing movies...
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
