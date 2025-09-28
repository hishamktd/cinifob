import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MainLayout } from '@core/components/layout/main-layout';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SessionProvider session={null}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </SessionProvider>
  );
};

describe('MainLayout', () => {
  it('renders children content', () => {
    renderWithProviders(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header', () => {
    renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderWithProviders(
      <MainLayout showFooter>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('applies container styles', () => {
    const { container } = renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveStyle({ minHeight: '100vh' });
  });

  it('renders with custom className', () => {
    const { container } = renderWithProviders(
      <MainLayout className="custom-layout">
        <div>Content</div>
      </MainLayout>
    );

    const layoutDiv = container.querySelector('.custom-layout');
    expect(layoutDiv).toBeInTheDocument();
  });

  it('handles loading state', () => {
    renderWithProviders(
      <MainLayout loading>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders breadcrumbs when provided', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Movies', href: '/movies' },
      { label: 'Details' }
    ];

    renderWithProviders(
      <MainLayout breadcrumbs={breadcrumbs}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders sidebar when enabled', () => {
    renderWithProviders(
      <MainLayout showSidebar>
        <div>Content</div>
      </MainLayout>
    );

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders with full width option', () => {
    const { container } = renderWithProviders(
      <MainLayout fullWidth>
        <div>Content</div>
      </MainLayout>
    );

    const mainContent = container.querySelector('.MuiContainer-maxWidthFalse');
    expect(mainContent).toBeInTheDocument();
  });

  it('renders back button when specified', () => {
    renderWithProviders(
      <MainLayout showBackButton>
        <div>Content</div>
      </MainLayout>
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('renders page title in header', () => {
    renderWithProviders(
      <MainLayout title="Movie Details">
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Movie Details')).toBeInTheDocument();
  });
});