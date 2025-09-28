import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard } from '@components/movie/movie-card';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MovieStatusProvider } from '@/contexts/MovieStatusContext';

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <MovieStatusProvider>
        {component}
      </MovieStatusProvider>
    </ThemeProvider>
  );
};

const mockMovie = {
  id: 123,
  tmdbId: 123,
  title: 'Test Movie',
  overview: 'A test movie description',
  posterPath: '/test-poster.jpg',
  backdropPath: '/test-backdrop.jpg',
  releaseDate: new Date('2024-01-01'),
  voteAverage: 8.5,
  voteCount: 1000,
  popularity: 75.5,
  adult: false,
  originalLanguage: 'en',
  originalTitle: 'Test Movie',
  genreIds: [28, 12],
  video: false,
  runtime: 120,
  status: 'Released',
  tagline: 'Test tagline',
  homepage: 'https://test.com',
  budget: 100000000,
  revenue: 200000000,
  imdbId: 'tt1234567',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('MovieCard', () => {
  it('renders movie title and poster', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    const poster = screen.getByAltText('Test Movie');
    expect(poster).toHaveAttribute('src', expect.stringContaining('test-poster.jpg'));
  });

  it('displays movie rating', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByTestId('app-icon')).toHaveAttribute('data-icon', 'mdi:star');
  });

  it('shows release year', () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    renderWithProviders(<MovieCard movie={mockMovie} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledWith(mockMovie);
  });

  it('shows watchlist button when user is authenticated', () => {
    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        showActions
        isAuthenticated
      />
    );

    expect(screen.getByLabelText(/add to watchlist/i)).toBeInTheDocument();
  });

  it('shows watched button when user is authenticated', () => {
    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        showActions
        isAuthenticated
      />
    );

    expect(screen.getByLabelText(/mark as watched/i)).toBeInTheDocument();
  });

  it('handles watchlist toggle', () => {
    const handleWatchlist = vi.fn();
    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        showActions
        isAuthenticated
        onWatchlistToggle={handleWatchlist}
      />
    );

    const watchlistButton = screen.getByLabelText(/add to watchlist/i);
    fireEvent.click(watchlistButton);

    expect(handleWatchlist).toHaveBeenCalledWith(mockMovie);
  });

  it('handles watched toggle', () => {
    const handleWatched = vi.fn();
    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        showActions
        isAuthenticated
        onWatchedToggle={handleWatched}
      />
    );

    const watchedButton = screen.getByLabelText(/mark as watched/i);
    fireEvent.click(watchedButton);

    expect(handleWatched).toHaveBeenCalledWith(mockMovie);
  });

  it('shows in watchlist state', () => {
    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        showActions
        isAuthenticated
        isInWatchlist
      />
    );

    expect(screen.getByLabelText(/remove from watchlist/i)).toBeInTheDocument();
  });

  it('shows watched state', () => {
    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        showActions
        isAuthenticated
        isWatched
      />
    );

    expect(screen.getByLabelText(/mark as unwatched/i)).toBeInTheDocument();
  });

  it('displays user rating when watched', () => {
    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        showActions
        isAuthenticated
        isWatched
        userRating={4}
      />
    );

    expect(screen.getByText('Your Rating: 4/5')).toBeInTheDocument();
  });

  it('shows placeholder when no poster', () => {
    const movieWithoutPoster = { ...mockMovie, posterPath: null };
    renderWithProviders(<MovieCard movie={movieWithoutPoster} />);

    const placeholder = screen.getByTestId('movie-poster-placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('handles loading state', () => {
    renderWithProviders(<MovieCard movie={mockMovie} loading />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays overview on hover', () => {
    renderWithProviders(<MovieCard movie={mockMovie} showOverviewOnHover />);

    const card = screen.getByRole('button');
    fireEvent.mouseEnter(card);

    expect(screen.getByText('A test movie description')).toBeInTheDocument();
  });

  it('shows genres when provided', () => {
    const genres = [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' }
    ];

    renderWithProviders(
      <MovieCard
        movie={mockMovie}
        genres={genres}
        showGenres
      />
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Adventure')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <MovieCard movie={mockMovie} className="custom-card" />
    );

    const card = container.querySelector('.custom-card');
    expect(card).toBeInTheDocument();
  });
});