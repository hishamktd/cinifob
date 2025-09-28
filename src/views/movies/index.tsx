'use client';

import React from 'react';
import { Typography } from '@mui/material';

import { AppPagination, AppSearchBar, AppEmptyState, AppTabs } from '@core/components';
import { ContentCard, ContentCardSkeleton } from '@/components/content-card';
import { MovieSearchType } from '@core/enums';
import { Movie } from '@/types';
import { AppTabItem } from '@core/components/app-tabs';
import { MoviesPageContainer, MoviesGrid, SkeletonGrid, TabsWrapper } from './styled-components';

interface MoviesPageViewProps {
  movies: Partial<Movie>[];
  loading: boolean;
  searchQuery: string;
  searchType: MovieSearchType;
  page: number;
  totalPages: number;
  isInWatchlist: (tmdbId: number) => boolean;
  isWatched: (tmdbId: number) => boolean;
  onSearchChange: (query: string) => void;
  onSearch: (query: string) => void;
  onTabChange: (tabId: string) => void;
  onPageChange: (page: number) => void;
  onAddToWatchlist: (movie: Partial<Movie>) => Promise<void>;
  onMarkAsWatched: (movie: Partial<Movie>) => Promise<void>;
  onBrowsePopular: () => void;
}

const MoviesPageView: React.FC<MoviesPageViewProps> = ({
  movies,
  loading,
  searchQuery,
  searchType,
  page,
  totalPages,
  isInWatchlist,
  isWatched,
  onSearchChange,
  onSearch,
  onTabChange,
  onPageChange,
  onAddToWatchlist,
  onMarkAsWatched,
  onBrowsePopular,
}) => {
  const renderContent = () => {
    return (
      <>
        {loading ? (
          <SkeletonGrid>
            {Array.from({ length: 12 }).map((_, index) => (
              <ContentCardSkeleton key={index} />
            ))}
          </SkeletonGrid>
        ) : movies.length === 0 ? (
          <AppEmptyState
            icon="mdi:movie-search-outline"
            title={searchQuery ? `No movies found for "${searchQuery}"` : 'No movies found'}
            description={
              searchQuery
                ? 'Try adjusting your search terms or browse our popular movies.'
                : 'Discover amazing movies by searching or browsing our collection.'
            }
            actionLabel="Browse Popular"
            actionIcon="mdi:fire"
            onAction={onBrowsePopular}
          />
        ) : (
          <>
            <MoviesGrid>
              {movies.map((movie) => (
                <ContentCard
                  key={movie.tmdbId}
                  item={{
                    id: movie.id || 0,
                    tmdbId: movie.tmdbId || 0,
                    mediaType: 'movie',
                    title: movie.title || 'Unknown Title',
                    overview: movie.overview,
                    posterPath: movie.posterPath,
                    backdropPath: movie.backdropPath,
                    date: movie.releaseDate?.toString(),
                    voteAverage: movie.voteAverage,
                    voteCount: movie.voteCount,
                    popularity: movie.popularity,
                    genreIds: Array.isArray(movie.genres)
                      ? typeof movie.genres[0] === 'object'
                        ? (movie.genres as unknown as { id: number }[]).map((g) => g.id)
                        : (movie.genres as (string | number)[]).map((g) => Number(g))
                      : undefined,
                  }}
                  isInWatchlist={movie.tmdbId ? isInWatchlist(movie.tmdbId) : false}
                  isWatched={movie.tmdbId ? isWatched(movie.tmdbId) : false}
                  onAddToWatchlist={() => onAddToWatchlist(movie)}
                  onMarkAsWatched={() => onMarkAsWatched(movie)}
                />
              ))}
            </MoviesGrid>

            {totalPages > 1 && (
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  onPageChange(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showInfo
                position="center"
              />
            )}
          </>
        )}
      </>
    );
  };

  const getTabItems = (): AppTabItem[] => [
    {
      id: MovieSearchType.POPULAR,
      label: 'Popular',
      icon: 'mdi:fire',
      content: renderContent(),
    },
    {
      id: MovieSearchType.NOW_PLAYING,
      label: 'Now Playing',
      icon: 'mdi:play-circle',
      content: renderContent(),
    },
    {
      id: MovieSearchType.UPCOMING,
      label: 'Upcoming',
      icon: 'mdi:calendar-clock',
      content: renderContent(),
    },
    {
      id: MovieSearchType.TOP_RATED,
      label: 'Top Rated',
      icon: 'mdi:star',
      content: renderContent(),
    },
  ];

  return (
    <MoviesPageContainer>
      <div className="page-wrapper">
        <div className="page-header">
          <Typography variant="h3" component="h1" className="page-title">
            Browse Movies
          </Typography>
        </div>

        <div className="search-section">
          <AppSearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onSearch={onSearch}
            placeholder="Search for movies..."
            loading={loading}
          />
        </div>

        {searchQuery ? (
          <div className="content-section">{renderContent()}</div>
        ) : (
          <TabsWrapper>
            <AppTabs
              tabs={getTabItems()}
              defaultTab={searchType}
              onChange={onTabChange}
              variant="fullWidth"
            />
          </TabsWrapper>
        )}
      </div>
    </MoviesPageContainer>
  );
};

export default MoviesPageView;
