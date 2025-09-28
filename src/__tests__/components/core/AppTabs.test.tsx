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
    { label: 'Movies', value: 'movies' },
    { label: 'TV Shows', value: 'tv-shows' },
    { label: 'Watchlist', value: 'watchlist' }
  ];

  it('renders all tabs', () => {
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        value="movies"
        onChange={() => {}}
      />
    );

    expect(screen.getByRole('tab', { name: 'Movies' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'TV Shows' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Watchlist' })).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        value="tv-shows"
        onChange={() => {}}
      />
    );

    const activeTab = screen.getByRole('tab', { name: 'TV Shows' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when tab is clicked', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        value="movies"
        onChange={handleChange}
      />
    );

    const watchlistTab = screen.getByRole('tab', { name: 'Watchlist' });
    fireEvent.click(watchlistTab);

    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), 'watchlist');
  });

  it('renders with custom variant', () => {
    const { container } = renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        value="movies"
        onChange={() => {}}
        variant="fullWidth"
      />
    );

    const tabsElement = container.querySelector('.MuiTabs-flexContainer');
    expect(tabsElement).toHaveStyle({ width: '100%' });
  });

  it('renders centered tabs', () => {
    const { container } = renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        value="movies"
        onChange={() => {}}
        centered
      />
    );

    const tabs = container.querySelector('.MuiTabs-centered');
    expect(tabs).toBeInTheDocument();
  });

  it('renders with icons', () => {
    const tabsWithIcons = [
      { label: 'Movies', value: 'movies', icon: <span>🎬</span> },
      { label: 'TV Shows', value: 'tv-shows', icon: <span>📺</span> }
    ];

    renderWithTheme(
      <AppTabs
        tabs={tabsWithIcons}
        value="movies"
        onChange={() => {}}
      />
    );

    expect(screen.getByText('🎬')).toBeInTheDocument();
    expect(screen.getByText('📺')).toBeInTheDocument();
  });

  it('handles disabled tabs', () => {
    const tabsWithDisabled = [
      { label: 'Movies', value: 'movies' },
      { label: 'Coming Soon', value: 'coming', disabled: true }
    ];

    renderWithTheme(
      <AppTabs
        tabs={tabsWithDisabled}
        value="movies"
        onChange={() => {}}
      />
    );

    const disabledTab = screen.getByRole('tab', { name: 'Coming Soon' });
    expect(disabledTab).toBeDisabled();
  });

  it('renders with custom color', () => {
    renderWithTheme(
      <AppTabs
        tabs={mockTabs}
        value="movies"
        onChange={() => {}}
        indicatorColor="secondary"
        textColor="secondary"
      />
    );

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();
  });
});