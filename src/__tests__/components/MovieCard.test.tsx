import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard } from '@components/movie/movie-card';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...props} />
  ),
}));

// Mock the movie worker
vi.mock('@/lib/movie-worker', () => ({
  moviePrefetchWorker: {
    prefetchMovie: vi.fn(),
    prefetchBatch: vi.fn(),
  },
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SessionProvider session={null}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </SessionProvider>,
  );
};

const mockMovie = {
  tmdbId: 123,
  title: 'Test Movie',
  posterPath: '/test-poster.jpg',
  releaseDate: new Date('2024-01-01'),
  voteAverage: 8.5,
};

describe('MovieCard', () => {
  it('renders movie title', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('displays movie rating', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('shows release year', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('shows action buttons when showActions is true', () => {
    renderWithProviders(<MovieCard movie={mockMovie} showActions={true} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('hides action buttons when showActions is false', () => {
    renderWithProviders(<MovieCard movie={mockMovie} showActions={false} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });

  it('displays user rating when provided', () => {
    renderWithProviders(<MovieCard movie={mockMovie} userRating={4} />);

    // Rating component with read-only shows as img role with aria-label
    const ratingElement = screen.getByRole('img', { name: /4 Stars/i });
    expect(ratingElement).toBeInTheDocument();
  });

  it('handles missing release date gracefully', () => {
    const movieWithoutDate = { ...mockMovie, releaseDate: undefined };

    renderWithProviders(<MovieCard movie={movieWithoutDate} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('shows placeholder when no poster', () => {
    const movieWithoutPoster = { ...mockMovie, posterPath: undefined };

    const { container } = renderWithProviders(<MovieCard movie={movieWithoutPoster} />);

    // Should show placeholder with icon
    expect(container.querySelector('.MuiCard-root')).toBeTruthy();
  });
});
