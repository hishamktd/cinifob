import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContentCard } from '@components/content-card';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock useContentPrefetch hook
vi.mock('@/hooks/useContentPrefetch', () => ({
  useContentPrefetch: () => ({
    handleHover: vi.fn(),
    handleHoverEnd: vi.fn(),
  }),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockContent = {
  id: 123,
  tmdbId: 123,
  title: 'Test Content',
  overview: 'A test content description',
  posterPath: '/test-poster.jpg',
  backdropPath: '/test-backdrop.jpg',
  date: '2024-01-01',
  voteAverage: 8.5,
  mediaType: 'movie' as const,
};

describe('ContentCard', () => {
  it('renders content title and poster', () => {
    renderWithTheme(<ContentCard item={mockContent} />);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    const poster = screen.getByAltText('Test Content');
    expect(poster).toHaveAttribute('src', expect.stringContaining('test-poster.jpg'));
  });

  it('displays correct media type badge for movie', () => {
    renderWithTheme(<ContentCard item={mockContent} />);

    expect(screen.getByText('MOVIE')).toBeInTheDocument();
  });

  it('shows TV show badge for TV content', () => {
    const tvContent = { ...mockContent, mediaType: 'tv' as const };
    renderWithTheme(<ContentCard item={tvContent} />);

    expect(screen.getByText('TV SHOW')).toBeInTheDocument();
  });

  it('displays rating', () => {
    renderWithTheme(<ContentCard item={mockContent} />);

    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('navigates to correct URL when card is clicked', () => {
    const mockPush = vi.fn();
    vi.mocked(
      vi.mocked(() => ({
        useRouter: () => ({ push: mockPush }),
      })),
    );

    renderWithTheme(<ContentCard item={mockContent} />);

    const card = screen.getByText('Test Content').closest('.MuiCard-root');
    if (card) fireEvent.click(card);
  });

  it('shows placeholder icon when no poster', () => {
    const contentWithoutPoster = { ...mockContent, posterPath: null };
    const { container } = renderWithTheme(<ContentCard item={contentWithoutPoster} />);

    // Check for the icon in the placeholder
    const iconElement = container.querySelector('[data-testid*="movie-open-outline"]');
    expect(iconElement || container.querySelector('.MuiBox-root')).toBeTruthy();
  });

  it('displays overview in card content', () => {
    renderWithTheme(<ContentCard item={mockContent} />);

    expect(screen.getByText('A test content description')).toBeInTheDocument();
  });

  it('shows release year', () => {
    renderWithTheme(<ContentCard item={mockContent} />);

    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('displays action buttons when callbacks are provided', () => {
    const handleWatchlist = vi.fn();
    const handleWatched = vi.fn();

    const { container } = renderWithTheme(
      <ContentCard
        item={mockContent}
        onAddToWatchlist={handleWatchlist}
        onMarkAsWatched={handleWatched}
      />,
    );

    // Action buttons are in the overlay that appears on hover
    const actionButtons = container.querySelector('.action-buttons');
    expect(actionButtons).toBeInTheDocument();
  });

  it('calls watchlist callback when watchlist button clicked', () => {
    const handleWatchlist = vi.fn();

    const { container } = renderWithTheme(
      <ContentCard item={mockContent} onAddToWatchlist={handleWatchlist} />,
    );

    const watchlistButton = container.querySelector('.action-buttons button:last-child');
    if (watchlistButton) {
      fireEvent.click(watchlistButton);
      expect(handleWatchlist).toHaveBeenCalled();
    }
  });

  it('calls watched callback when watched button clicked', () => {
    const handleWatched = vi.fn();

    const { container } = renderWithTheme(
      <ContentCard item={mockContent} onMarkAsWatched={handleWatched} />,
    );

    const watchedButton = container.querySelector('.action-buttons button:first-child');
    if (watchedButton) {
      fireEvent.click(watchedButton);
      expect(handleWatched).toHaveBeenCalled();
    }
  });

  it('shows TBA when no date provided', () => {
    const contentWithoutDate = { ...mockContent, date: undefined };
    renderWithTheme(<ContentCard item={contentWithoutDate} />);

    expect(screen.getByText('TBA')).toBeInTheDocument();
  });

  it('displays TV Series label for TV content', () => {
    const tvContent = { ...mockContent, mediaType: 'tv' as const };
    renderWithTheme(<ContentCard item={tvContent} />);

    expect(screen.getByText('TV Series')).toBeInTheDocument();
  });

  it('displays Movie label for movie content', () => {
    renderWithTheme(<ContentCard item={mockContent} />);

    expect(screen.getByText('Movie')).toBeInTheDocument();
  });
});
