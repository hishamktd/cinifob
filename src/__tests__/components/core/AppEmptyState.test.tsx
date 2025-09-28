import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppEmptyState } from '@core/components/app-empty-state';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppEmptyState', () => {
  it('renders with title', () => {
    renderWithTheme(<AppEmptyState title="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    renderWithTheme(
      <AppEmptyState
        title="No movies"
        description="Start adding movies to your watchlist"
      />
    );
    expect(screen.getByText('No movies')).toBeInTheDocument();
    expect(screen.getByText('Start adding movies to your watchlist')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    renderWithTheme(
      <AppEmptyState
        title="Empty"
        icon="mdi:movie-off"
      />
    );
    // Check that the component renders without errors
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('renders with fullHeight', () => {
    renderWithTheme(
      <AppEmptyState
        title="Empty"
        fullHeight
      />
    );
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const handleAction = vi.fn();
    renderWithTheme(
      <AppEmptyState
        title="No results"
        actionLabel="Try again"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole('button', { name: 'Try again' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    renderWithTheme(
      <AppEmptyState
        title="Small empty state"
        size="small"
      />
    );
    expect(screen.getByText('Small empty state')).toBeInTheDocument();
  });

  it('renders with minimal variant', () => {
    renderWithTheme(
      <AppEmptyState
        title="Minimal"
        variant="minimal"
      />
    );
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });
});