import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

  it('renders with title and subtitle', () => {
    renderWithTheme(
      <AppEmptyState
        title="No movies"
        subtitle="Start adding movies to your watchlist"
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
    const icon = screen.getByTestId('app-icon');
    expect(icon).toHaveAttribute('data-icon', 'mdi:movie-off');
  });

  it('renders with custom height', () => {
    const { container } = renderWithTheme(
      <AppEmptyState
        title="Empty"
        height={400}
      />
    );
    const emptyState = container.firstChild;
    expect(emptyState).toHaveStyle({ minHeight: '400px' });
  });

  it('renders with action button', () => {
    renderWithTheme(
      <AppEmptyState
        title="No results"
        action={<button>Try again</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});