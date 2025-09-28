import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RelatedContent } from '@components/related-content';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';

vi.mock('axios');

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockRelatedContent = [
  {
    id: 1,
    title: 'Related Movie 1',
    poster_path: '/related1.jpg',
    vote_average: 7.5,
    release_date: '2024-01-01'
  },
  {
    id: 2,
    title: 'Related Movie 2',
    poster_path: '/related2.jpg',
    vote_average: 8.0,
    release_date: '2024-02-01'
  },
  {
    id: 3,
    title: 'Related Movie 3',
    poster_path: '/related3.jpg',
    vote_average: 6.5,
    release_date: '2024-03-01'
  }
];

describe('RelatedContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays related content', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: mockRelatedContent }
    });

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Related Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Related Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Related Movie 3')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/content/movie/123/related');
  });

  it('shows loading state while fetching', () => {
    vi.mocked(axios.get).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no related content', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: [] }
    });

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No related content found')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('API Error'));

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load related content/i)).toBeInTheDocument();
    });
  });

  it('calls onClick handler when item is clicked', async () => {
    const handleClick = vi.fn();
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: mockRelatedContent }
    });

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        onItemClick={handleClick}
      />
    );

    await waitFor(() => {
      const firstItem = screen.getByText('Related Movie 1').closest('button');
      fireEvent.click(firstItem!);
    });

    expect(handleClick).toHaveBeenCalledWith(mockRelatedContent[0]);
  });

  it('limits displayed items based on limit prop', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: mockRelatedContent }
    });

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        limit={2}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Related Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Related Movie 2')).toBeInTheDocument();
      expect(screen.queryByText('Related Movie 3')).not.toBeInTheDocument();
    });
  });

  it('shows view more button when there are more items', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: [...mockRelatedContent, ...mockRelatedContent] }
    });

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        limit={3}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view more/i })).toBeInTheDocument();
    });
  });

  it('expands to show all items when view more is clicked', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: [...mockRelatedContent, ...mockRelatedContent] }
    });

    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        limit={3}
      />
    );

    await waitFor(() => {
      const viewMoreButton = screen.getByRole('button', { name: /view more/i });
      fireEvent.click(viewMoreButton);
    });

    await waitFor(() => {
      // Should show all 6 items now
      const items = screen.getAllByText(/Related Movie/);
      expect(items.length).toBe(6);
    });
  });

  it('works with TV show content type', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 1,
            name: 'Related TV Show',
            poster_path: '/tv-poster.jpg',
            vote_average: 8.5,
            first_air_date: '2024-01-01'
          }
        ]
      }
    });

    renderWithTheme(
      <RelatedContent
        contentType="tv"
        contentId={456}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Related TV Show')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/content/tv/456/related');
  });

  it('applies custom title', () => {
    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        title="You might also like"
      />
    );

    expect(screen.getByText('You might also like')).toBeInTheDocument();
  });

  it('hides title when showTitle is false', () => {
    renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        showTitle={false}
      />
    );

    expect(screen.queryByText('Related Content')).not.toBeInTheDocument();
  });

  it('renders in horizontal scroll mode', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: mockRelatedContent }
    });

    const { container } = renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        layout="horizontal"
      />
    );

    await waitFor(() => {
      const scrollContainer = container.querySelector('.horizontal-scroll');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  it('renders in grid layout', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: mockRelatedContent }
    });

    const { container } = renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
        layout="grid"
      />
    );

    await waitFor(() => {
      const gridContainer = container.querySelector('.grid-layout');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  it('refreshes content when contentId changes', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: mockRelatedContent }
    });

    const { rerender } = renderWithTheme(
      <RelatedContent
        contentType="movie"
        contentId={123}
      />
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { results: [{ id: 999, title: 'New Related Movie' }] }
    });

    rerender(
      <ThemeProvider theme={theme}>
        <RelatedContent
          contentType="movie"
          contentId={456}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(screen.getByText('New Related Movie')).toBeInTheDocument();
    });
  });
});