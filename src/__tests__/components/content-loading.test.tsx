import { render, screen } from '@testing-library/react';
import { ContentLoading, ContentLoadingPage } from '@/components/content-loading';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ContentLoading', () => {
  it('renders loading state with title and subtitle', () => {
    renderWithTheme(<ContentLoading title="Test Title" subtitle="Loading content..." />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('renders skeleton cards based on itemCount', () => {
    const { container } = renderWithTheme(
      <ContentLoading
        title="Test"
        subtitle="Loading..."
        itemCount={4}
        showStats={false}
        showFilters={false}
      />,
    );

    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBe(4);
  });

  it('renders stats section when showStats is true', () => {
    const { container } = renderWithTheme(
      <ContentLoading title="Test" subtitle="Loading..." showStats={true} showFilters={false} />,
    );

    // Stats section has 4 cards with circular skeletons
    const circularSkeletons = container.querySelectorAll('.MuiSkeleton-circular');
    expect(circularSkeletons.length).toBeGreaterThan(0);
  });

  it('renders filters section when showFilters is true', () => {
    const { container } = renderWithTheme(
      <ContentLoading title="Test" subtitle="Loading..." showStats={false} showFilters={true} />,
    );

    // Check for toggle button group
    const toggleGroup = screen.getByRole('group');
    expect(toggleGroup).toBeInTheDocument();

    // Check for toggle buttons by value attribute
    const buttons = container.querySelectorAll('button[value]');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveAttribute('value', 'all');
    expect(buttons[1]).toHaveAttribute('value', 'movies');
    expect(buttons[2]).toHaveAttribute('value', 'tv');
  });

  describe('ContentLoadingPage', () => {
    it('renders watchlist loading page', () => {
      renderWithTheme(<ContentLoadingPage type="watchlist" />);

      expect(screen.getByText('My Watchlist')).toBeInTheDocument();
      expect(screen.getByText('Loading your watchlist...')).toBeInTheDocument();
    });

    it('renders watched loading page', () => {
      renderWithTheme(<ContentLoadingPage type="watched" />);

      expect(screen.getByText('Watched Content')).toBeInTheDocument();
      expect(screen.getByText('Loading your watched movies and TV shows...')).toBeInTheDocument();
    });
  });
});
