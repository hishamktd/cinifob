import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EpisodeTracker } from '@components/episode-tracker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';
import axios from 'axios';

vi.mock('axios');

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <SessionProvider session={{ user: { id: 'user123' }, expires: '2025-01-01' }}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </SessionProvider>
  );
};

const mockTVShow = {
  id: 123,
  name: 'Test TV Show',
  number_of_seasons: 3,
  number_of_episodes: 30,
  seasons: [
    {
      id: 1,
      season_number: 1,
      episode_count: 10,
      name: 'Season 1',
      air_date: '2023-01-01'
    },
    {
      id: 2,
      season_number: 2,
      episode_count: 10,
      name: 'Season 2',
      air_date: '2023-06-01'
    },
    {
      id: 3,
      season_number: 3,
      episode_count: 10,
      name: 'Season 3',
      air_date: '2024-01-01'
    }
  ]
};

const mockSeasonDetails = {
  id: 1,
  season_number: 1,
  name: 'Season 1',
  episodes: [
    {
      id: 101,
      episode_number: 1,
      name: 'Pilot',
      air_date: '2023-01-01',
      runtime: 45,
      still_path: '/episode1.jpg'
    },
    {
      id: 102,
      episode_number: 2,
      name: 'Episode 2',
      air_date: '2023-01-08',
      runtime: 42,
      still_path: '/episode2.jpg'
    }
  ]
};

const mockWatchedEpisodes = [
  { season: 1, episode: 1, watchedAt: '2024-01-15' }
];

describe('EpisodeTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays TV show seasons', () => {
    renderWithProviders(
      <EpisodeTracker tvShow={mockTVShow} />
    );

    expect(screen.getByText('Season 1')).toBeInTheDocument();
    expect(screen.getByText('Season 2')).toBeInTheDocument();
    expect(screen.getByText('Season 3')).toBeInTheDocument();
  });

  it('shows overall progress', () => {
    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        watchedEpisodes={mockWatchedEpisodes}
      />
    );

    expect(screen.getByText(/1\/30 episodes watched/i)).toBeInTheDocument();
  });

  it('calculates and displays progress percentage', () => {
    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        watchedEpisodes={mockWatchedEpisodes}
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '3'); // 1/30 = ~3%
  });

  it('expands season to show episodes', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker tvShow={mockTVShow} />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      expect(screen.getByText('Pilot')).toBeInTheDocument();
      expect(screen.getByText('Episode 2')).toBeInTheDocument();
    });
  });

  it('marks episode as watched', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { success: true }
    });

    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        onEpisodeWatch={vi.fn()}
      />
    );

    // Expand season
    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      const watchButton = screen.getAllByLabelText(/mark as watched/i)[0];
      fireEvent.click(watchButton);
    });

    expect(axios.post).toHaveBeenCalledWith('/api/user/episodes/watched', {
      tvShowId: 123,
      seasonNumber: 1,
      episodeNumber: 1
    });
  });

  it('marks episode as unwatched', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    vi.mocked(axios.delete).mockResolvedValueOnce({
      data: { success: true }
    });

    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        watchedEpisodes={mockWatchedEpisodes}
      />
    );

    // Expand season
    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      const unwatchButton = screen.getByLabelText(/mark as unwatched/i);
      fireEvent.click(unwatchButton);
    });

    expect(axios.delete).toHaveBeenCalled();
  });

  it('marks entire season as watched', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { success: true }
    });

    renderWithProviders(
      <EpisodeTracker tvShow={mockTVShow} />
    );

    const markSeasonButton = screen.getAllByLabelText(/mark season as watched/i)[0];
    fireEvent.click(markSeasonButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/user/episodes/season/watched', {
        tvShowId: 123,
        seasonNumber: 1
      });
    });
  });

  it('shows episode runtime', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker tvShow={mockTVShow} />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      expect(screen.getByText('45 min')).toBeInTheDocument();
      expect(screen.getByText('42 min')).toBeInTheDocument();
    });
  });

  it('displays episode air date', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker tvShow={mockTVShow} />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 8, 2023/)).toBeInTheDocument();
    });
  });

  it('shows watched badge for watched episodes', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        watchedEpisodes={mockWatchedEpisodes}
      />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      const watchedBadge = screen.getByText('Watched');
      expect(watchedBadge).toBeInTheDocument();
    });
  });

  it('shows season progress', () => {
    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        watchedEpisodes={[
          { season: 1, episode: 1 },
          { season: 1, episode: 2 },
          { season: 1, episode: 3 }
        ]}
      />
    );

    expect(screen.getByText(/Season 1.*3\/10/)).toBeInTheDocument();
  });

  it('highlights next episode to watch', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        watchedEpisodes={mockWatchedEpisodes}
      />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      const nextEpisode = screen.getByText('Episode 2').closest('.episode-item');
      expect(nextEpisode).toHaveClass('next-to-watch');
    });
  });

  it('allows bulk episode selection', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        allowBulkActions
      />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      fireEvent.click(selectAllCheckbox);

      const markSelectedButton = screen.getByRole('button', { name: /mark selected as watched/i });
      expect(markSelectedButton).toBeInTheDocument();
    });
  });

  it('filters episodes by watched status', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        watchedEpisodes={mockWatchedEpisodes}
      />
    );

    const filterButton = screen.getByLabelText(/filter episodes/i);
    fireEvent.click(filterButton);

    const unwatchedFilter = screen.getByRole('menuitem', { name: /show unwatched/i });
    fireEvent.click(unwatchedFilter);

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      expect(screen.queryByText('Pilot')).not.toBeInTheDocument();
      expect(screen.getByText('Episode 2')).toBeInTheDocument();
    });
  });

  it('shows episode thumbnails', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockSeasonDetails
    });

    renderWithProviders(
      <EpisodeTracker
        tvShow={mockTVShow}
        showThumbnails
      />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      const thumbnails = screen.getAllByRole('img');
      expect(thumbnails[0]).toHaveAttribute('src', expect.stringContaining('episode1.jpg'));
      expect(thumbnails[1]).toHaveAttribute('src', expect.stringContaining('episode2.jpg'));
    });
  });

  it('handles loading state', () => {
    vi.mocked(axios.get).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithProviders(
      <EpisodeTracker tvShow={mockTVShow} />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Failed to load'));

    renderWithProviders(
      <EpisodeTracker tvShow={mockTVShow} />
    );

    const season1Button = screen.getByText('Season 1');
    fireEvent.click(season1Button);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load episodes/i)).toBeInTheDocument();
    });
  });
});