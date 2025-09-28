import { Container } from '@mui/material';
import { AppLoader } from '@core/components';

export default function Loading() {
  return (
    <Container>
      <AppLoader type="circular" size="large" message="Loading amazing movies..." fullscreen />
    </Container>
  );
}
