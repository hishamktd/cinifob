import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppTabs } from '@core/components/app-tabs';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppTabs', () => {
  const mockTabs = [
    { id: 'movies', label: 'Movies', content: <div>Movies content</div> },
    { id: 'tv-shows', label: 'TV Shows', content: <div>TV Shows content</div> },
    { id: 'watchlist', label: 'Watchlist', content: <div>Watchlist content</div> }
  ];

  it('renders all tabs', () => {
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        defaultTab="movies"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('TV Shows')).toBeInTheDocument();
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('renders tab content', () => {
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        defaultTab="movies"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Movies content')).toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        defaultTab="movies"
        onChange={handleChange}
      />
    );

    const watchlistTab = screen.getByRole('tab', { name: /Watchlist/ });
    fireEvent.click(watchlistTab);

    expect(handleChange).toHaveBeenCalledWith('watchlist');
  });

  it('renders with custom variant', () => {
    const { container } = renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        defaultTab="movies"
        onChange={() => {}}
        variant="fullWidth"
      />
    );

    const tabsElement = container.querySelector('.MuiTabs-root');
    expect(tabsElement).toBeInTheDocument();
  });

  it('renders centered tabs', () => {
    const { container } = renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        defaultTab="movies"
        onChange={() => {}}
        centered
      />
    );

    const tabs = container.querySelector('.MuiTabs-centered');
    expect(tabs).toBeInTheDocument();
  });

  it('renders with icons', () => {
    const tabsWithIcons = [
      { id: 'movies', label: 'Movies', content: <div>Movies content</div>, icon: 'mdi:movie' },
      { id: 'tv-shows', label: 'TV Shows', content: <div>TV content</div>, icon: 'mdi:television' }
    ];

    renderWithTheme(
      <AppTabs
        tabs={tabsWithIcons}
        defaultTab="movies"
        onChange={() => {}}
      />
    );

    // Check that both tabs render with their labels
    const movieLabels = screen.getAllByText('Movies');
    const tvLabels = screen.getAllByText('TV Shows');
    expect(movieLabels.length).toBeGreaterThan(0);
    expect(tvLabels.length).toBeGreaterThan(0);
  });

  it('handles disabled tabs', () => {
    const tabsWithDisabled = [
      { id: 'movies', label: 'Movies', content: <div>Movies</div> },
      { id: 'coming', label: 'Coming Soon', content: <div>Coming</div>, disabled: true }
    ];

    renderWithTheme(
      <AppTabs
        tabs={tabsWithDisabled}
        defaultTab="movies"
        onChange={() => {}}
      />
    );

    const disabledTab = screen.getByRole('tab', { name: /Coming Soon/ });
    expect(disabledTab).toBeDisabled();
  });

  it('renders with badges', () => {
    const tabsWithBadges = [
      { id: 'movies', label: 'Movies', content: <div>Movies</div>, badge: 5 },
      { id: 'tv-shows', label: 'TV Shows', content: <div>TV</div>, badge: 3 }
    ];

    renderWithTheme(
      <AppTabs
        tabs={tabsWithBadges}
        defaultTab="movies"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders with vertical orientation', () => {
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        defaultTab="movies"
        onChange={() => {}}
        orientation="vertical"
      />
    );

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();
  });
});