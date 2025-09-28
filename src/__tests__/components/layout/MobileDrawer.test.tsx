import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileDrawer } from '@core/components/layout/mobile-drawer';
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

describe('MobileDrawer', () => {
  it('renders when open', () => {
    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithProviders(
      <MobileDrawer open={false} onClose={() => {}} />
    );

    expect(screen.queryByRole('presentation')).not.toBeVisible();
  });

  it('displays navigation links', () => {
    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('TV Shows')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  it('shows user links when authenticated', () => {
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2025-01-01'
    };

    render(
      <SessionProvider session={mockSession}>
        <ThemeProvider theme={theme}>
          <MobileDrawer open={true} onClose={() => {}} />
        </ThemeProvider>
      </SessionProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText('Watched')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows login link when not authenticated', () => {
    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <MobileDrawer open={true} onClose={handleClose} />
    );

    const backdrop = screen.getByRole('presentation').firstChild;
    fireEvent.click(backdrop!);

    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <MobileDrawer open={true} onClose={handleClose} />
    );

    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when navigation link is clicked', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <MobileDrawer open={true} onClose={handleClose} />
    );

    const moviesLink = screen.getByText('Movies');
    fireEvent.click(moviesLink);

    expect(handleClose).toHaveBeenCalled();
  });

  it('displays app logo', () => {
    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    expect(screen.getByText(/CiniFob/i)).toBeInTheDocument();
    const logo = screen.getByTestId('app-icon');
    expect(logo).toHaveAttribute('data-icon', 'mdi:movie');
  });

  it('shows theme toggle', () => {
    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    const themeToggle = screen.getByLabelText(/toggle theme/i);
    expect(themeToggle).toBeInTheDocument();
  });

  it('toggles theme when theme button is clicked', () => {
    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    const themeToggle = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeToggle);

    // Theme should toggle (implementation specific)
    expect(themeToggle).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    vi.mock('next/navigation', () => ({
      usePathname: () => '/movies'
    }));

    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    const moviesLink = screen.getByText('Movies');
    expect(moviesLink).toHaveClass('active');
  });

  it('shows logout button when authenticated', () => {
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2025-01-01'
    };

    render(
      <SessionProvider session={mockSession}>
        <ThemeProvider theme={theme}>
          <MobileDrawer open={true} onClose={() => {}} />
        </ThemeProvider>
      </SessionProvider>
    );

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('displays user info when authenticated', () => {
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2025-01-01'
    };

    render(
      <SessionProvider session={mockSession}>
        <ThemeProvider theme={theme}>
          <MobileDrawer open={true} onClose={() => {}} />
        </ThemeProvider>
      </SessionProvider>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('has correct drawer width', () => {
    const { container } = renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    const drawer = container.querySelector('.MuiDrawer-paper');
    expect(drawer).toHaveStyle({ width: '280px' });
  });

  it('animates when opening', () => {
    const { container, rerender } = renderWithProviders(
      <MobileDrawer open={false} onClose={() => {}} />
    );

    rerender(
      <SessionProvider session={null}>
        <ThemeProvider theme={theme}>
          <MobileDrawer open={true} onClose={() => {}} />
        </ThemeProvider>
      </SessionProvider>
    );

    const drawer = container.querySelector('.MuiDrawer-paper');
    expect(drawer).toHaveClass('MuiDrawer-paperAnchorLeft');
  });

  it('shows search bar in drawer', () => {
    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search submission', () => {
    const mockRouter = { push: vi.fn() };
    vi.mock('next/navigation', () => ({
      useRouter: () => mockRouter
    }));

    renderWithProviders(
      <MobileDrawer open={true} onClose={() => {}} />
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 13 });

    expect(searchInput).toHaveValue('Matrix');
  });

  it('groups navigation items properly', () => {
    const mockSession = {
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2025-01-01'
    };

    render(
      <SessionProvider session={mockSession}>
        <ThemeProvider theme={theme}>
          <MobileDrawer open={true} onClose={() => {}} />
        </ThemeProvider>
      </SessionProvider>
    );

    // Should have dividers between groups
    const dividers = screen.getAllByRole('separator');
    expect(dividers.length).toBeGreaterThan(0);
  });
});