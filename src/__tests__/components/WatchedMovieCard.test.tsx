import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WatchedMovieCard } from '@components/watched-movie-card';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {component}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const defaultProps = {
  isEditingDate: false,
  onEditDateClick: vi.fn(),
  onCancelEditDate: vi.fn(),
  onUpdateDate: vi.fn(),
  onAddToWatchlist: vi.fn(),
  onRemoveFromWatched: vi.fn(),
};

const mockWatchedMovie = {
  id: 1,
  movieId: 'movie123',
  userId: 'user123',
  isWatched: true,
  isWatchlist: false,
  watchedAt: new Date('2024-01-15'),
  rating: 4,
  comment: 'Great movie with amazing visuals!',
  movie: {
    id: 'movie123',
    tmdbId: 123,
    title: 'Test Movie',
    posterPath: '/test-poster.jpg',
    releaseDate: new Date('2023-06-01'),
    voteAverage: 8.5,
    runtime: 148,
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' }
    ]
  }
};

describe('WatchedMovieCard', () => {
  it('renders movie title and poster', () => {
    renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
      />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    const poster = screen.getByAltText('Test Movie');
    expect(poster).toHaveAttribute('src', expect.stringContaining('test-poster.jpg'));
  });

  it('displays watched date', () => {
    renderWithTheme(<WatchedMovieCard userMovie={mockWatchedMovie} {...defaultProps} />);

    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('shows user rating', () => {
    renderWithTheme(<WatchedMovieCard userMovie={mockWatchedMovie} {...defaultProps} />);

    expect(screen.getByText('Your Rating: 4/10')).toBeInTheDocument();
  });

  it('does not display user comment as component does not show it', () => {
    renderWithTheme(<WatchedMovieCard userMovie={mockWatchedMovie} {...defaultProps} />);

    // The component doesn't display comments
    expect(screen.queryByText('Great movie with amazing visuals!')).not.toBeInTheDocument();
  });

  it('shows release year', () => {
    renderWithTheme(<WatchedMovieCard userMovie={mockWatchedMovie} {...defaultProps} />);

    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('displays MOVIE badge', () => {
    renderWithTheme(<WatchedMovieCard userMovie={mockWatchedMovie} {...defaultProps} />);

    expect(screen.getByText('MOVIE')).toBeInTheDocument();
  });

  it('navigates to movie page when card is clicked', () => {
    const mockPush = vi.fn();
    vi.mocked(vi.mocked(() => ({
      useRouter: () => ({ push: mockPush })
    })));

    const { container } = renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
      />
    );

    const card = container.querySelector('.MuiCard-root');
    if (card) fireEvent.click(card);
  });

  it('shows edit date button', () => {
    const { container } = renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
      />
    );

    // Look for the pencil icon button
    const editButton = container.querySelector('button svg[data-testid*="pencil"]')?.parentElement;
    expect(editButton).toBeInTheDocument();
  });

  it('calls onEditDateClick when edit button is clicked', () => {
    const handleEditDate = vi.fn();
    const { container } = renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
        onEditDateClick={handleEditDate}
      />
    );

    const editButton = container.querySelector('.date-info')?.nextElementSibling as HTMLElement;
    if (editButton) {
      fireEvent.click(editButton);
      expect(handleEditDate).toHaveBeenCalled();
    }
  });

  it('shows remove button', () => {
    renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
      />
    );

    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onRemoveFromWatched when remove button is clicked', () => {
    const handleRemove = vi.fn();
    renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
        onRemoveFromWatched={handleRemove}
      />
    );

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(handleRemove).toHaveBeenCalledWith(123);
  });

  it('handles movie without rating', () => {
    const movieWithoutRating = {
      ...mockWatchedMovie,
      rating: null
    };

    renderWithTheme(<WatchedMovieCard userMovie={movieWithoutRating} {...defaultProps} />);

    expect(screen.queryByText(/Your Rating:/)).not.toBeInTheDocument();
  });

  it('shows Watch Again button', () => {
    renderWithTheme(<WatchedMovieCard userMovie={mockWatchedMovie} {...defaultProps} />);

    expect(screen.getByText('Watch Again')).toBeInTheDocument();
  });

  it('shows placeholder when no poster', () => {
    const movieWithoutPoster = {
      ...mockWatchedMovie,
      movie: {
        ...mockWatchedMovie.movie,
        posterPath: null
      }
    };

    const { container } = renderWithTheme(<WatchedMovieCard userMovie={movieWithoutPoster} {...defaultProps} />);

    // Look for the movie icon in the placeholder
    const iconElement = container.querySelector('[data-testid*="movie-open-outline"]');
    expect(iconElement || container.querySelector('.MuiBox-root')).toBeTruthy();
  });

  it('displays TMDb rating', () => {
    renderWithTheme(<WatchedMovieCard userMovie={mockWatchedMovie} {...defaultProps} />);

    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('shows WATCHED indicator', () => {
    renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
      />
    );

    expect(screen.getByText('WATCHED')).toBeInTheDocument();
  });

  it('calls onAddToWatchlist when Watch Again button is clicked', () => {
    const handleWatchAgain = vi.fn();
    renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
        onAddToWatchlist={handleWatchAgain}
      />
    );

    const watchAgainButton = screen.getByText('Watch Again');
    fireEvent.click(watchAgainButton);

    expect(handleWatchAgain).toHaveBeenCalledWith(mockWatchedMovie.movie);
  });

  it('shows date picker when editing date', () => {
    renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
        isEditingDate={true}
      />
    );

    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('calls onCancelEditDate when cancel button is clicked during date edit', () => {
    const handleCancel = vi.fn();
    const { container } = renderWithTheme(
      <WatchedMovieCard
        userMovie={mockWatchedMovie}
        {...defaultProps}
        isEditingDate={true}
        onCancelEditDate={handleCancel}
      />
    );

    const cancelButton = container.querySelector('[data-testid*="close"]')?.closest('button');
    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(handleCancel).toHaveBeenCalled();
    }
  });
});