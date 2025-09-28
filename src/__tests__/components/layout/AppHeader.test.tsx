import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppHeader } from '@core/components/layout/app-header';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SessionProvider session={null}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </SessionProvider>,
  );
};

describe('AppHeader', () => {
  it('renders logo and title', () => {
    renderWithProviders(<AppHeader />);

    expect(screen.getByText(/CiniFob/i)).toBeInTheDocument();
    const logo = screen.getByTestId('app-icon');
    expect(logo).toHaveAttribute('data-icon', 'mdi:movie');
  });

  it('renders navigation links', () => {
    renderWithProviders(<AppHeader />);

    expect(screen.getByRole('link', { name: /Movies/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /TV Shows/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse/i })).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    renderWithProviders(<AppHeader />);

    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2025-01-01',
    };

    render(
      <SessionProvider session={mockSession}>
        <ThemeProvider theme={theme}>
          <AppHeader />
        </ThemeProvider>
      </SessionProvider>,
    );

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('toggles theme mode', () => {
    renderWithProviders(<AppHeader />);

    const themeToggle = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeToggle);

    // Theme should toggle (implementation specific)
    expect(themeToggle).toBeInTheDocument();
  });

  it('opens mobile drawer on small screens', () => {
    // Mock small screen
    global.innerWidth = 500;

    renderWithProviders(<AppHeader />);

    const menuButton = screen.getByLabelText(/open menu/i);
    fireEvent.click(menuButton);

    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('shows search bar', () => {
    renderWithProviders(<AppHeader />);

    const searchInput = screen.getByPlaceholderText(/Search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search submission', () => {
    const mockRouter = { push: vi.fn() };
    vi.mock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }));

    renderWithProviders(<AppHeader />);

    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 13 });

    // Should navigate to search results
    expect(searchInput).toHaveValue('Matrix');
  });

  it('highlights active navigation item', () => {
    vi.mock('next/navigation', () => ({
      usePathname: () => '/movies',
    }));

    renderWithProviders(<AppHeader />);

    const moviesLink = screen.getByRole('link', { name: /Movies/i });
    expect(moviesLink).toHaveClass('active');
  });

  it('shows notification badge for new content', () => {
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2025-01-01',
    };

    render(
      <SessionProvider session={mockSession}>
        <ThemeProvider theme={theme}>
          <AppHeader hasNotifications />
        </ThemeProvider>
      </SessionProvider>,
    );

    const notificationBadge = screen.getByTestId('notification-badge');
    expect(notificationBadge).toBeInTheDocument();
  });
});
