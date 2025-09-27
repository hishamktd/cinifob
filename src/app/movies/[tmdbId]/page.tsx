'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Grid,
  Rating,
  Skeleton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Link,
} from '@mui/material';

import { AppIcon } from '@core/components/app-icon';
import { MainLayout } from '@core/components/layout/main-layout';
import { Toast } from '@core/components/toast';
import { TMDB_CONFIG } from '@core/constants';
import { MovieStatus } from '@core/enums';
import { movieService } from '@/services/movie.service';
import { UserMovie } from '@/types';

export default function MovieDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [movie, setMovie] = useState<{
    id: number;
    tmdbId: number;
    title: string;
    overview?: string;
    posterPath?: string;
    backdropPath?: string;
    releaseDate?: string;
    runtime?: number;
    voteAverage?: number;
    voteCount?: number;
    tagline?: string;
    status?: string;
    originalLanguage?: string;
    budget?: string;
    revenue?: string;
    popularity?: number;
    homepage?: string;
    imdbId?: string;
    genres?: Array<{ id: number; name: string }>;
    cast?: Array<{
      personId: number;
      character?: string;
      order: number;
      person?: { name: string; profilePath?: string };
    }>;
    crew?: Array<{
      personId: number;
      job: string;
      department: string;
      person?: { name: string; profilePath?: string };
    }>;
    videos?: Array<{
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }>;
    productionCompanies?: Array<{
      companyId: number;
      name: string;
      logoPath?: string;
      originCountry?: string;
    }>;
    productionCountries?: Array<{
      iso31661: string;
      name: string;
    }>;
    spokenLanguages?: Array<{
      iso6391: string;
      name: string;
      englishName?: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userMovie, setUserMovie] = useState<UserMovie | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'info' | 'success' | 'error' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const tmdbId = parseInt(params.tmdbId as string);

  useEffect(() => {
    if (tmdbId) {
      fetchMovieDetails();
      if (session) {
        checkUserMovieStatus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, session]);

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(`/api/movies/${tmdbId}`);
      const data = await response.json();
      if (data.movie) {
        setMovie(data.movie);
      }
    } catch {
      console.error('Error fetching movie details');
      showToast('Failed to load movie details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkUserMovieStatus = async () => {
    try {
      const [watchlistRes, watchedRes] = await Promise.all([
        movieService.getWatchlist(),
        movieService.getWatchedMovies(),
      ]);

      const inWatchlist = watchlistRes.watchlist.find((um) => um.movie?.tmdbId === tmdbId);
      const inWatched = watchedRes.watched.find((um) => um.movie?.tmdbId === tmdbId);

      if (inWatched) {
        setUserMovie(inWatched);
        setRating(inWatched.rating || null);
      } else if (inWatchlist) {
        setUserMovie(inWatchlist);
      }
    } catch {
      console.error('Error checking user movie status');
    }
  };

  const handleAddToWatchlist = async () => {
    if (!session) {
      showToast('Please login to add to watchlist', 'warning');
      return;
    }

    if (!movie) return;

    setActionLoading(true);
    try {
      const movieData = {
        tmdbId: movie.tmdbId,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate ? new Date(movie.releaseDate) : undefined,
        genres: movie.genres?.map((g) => (typeof g === 'string' ? g : g.name)) || [],
        runtime: movie.runtime,
        voteAverage: movie.voteAverage,
        voteCount: movie.voteCount,
      };
      await movieService.addToWatchlist(movieData);
      showToast('Added to watchlist', 'success');
      await checkUserMovieStatus();
    } catch {
      showToast('Failed to add to watchlist', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsWatched = async () => {
    if (!session) {
      showToast('Please login to mark as watched', 'warning');
      return;
    }

    setRatingDialogOpen(true);
  };

  const handleSaveWatched = async () => {
    if (!movie) return;

    setActionLoading(true);
    try {
      const movieData = {
        tmdbId: movie.tmdbId,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        releaseDate: movie.releaseDate ? new Date(movie.releaseDate) : undefined,
        genres: movie.genres?.map((g) => (typeof g === 'string' ? g : g.name)) || [],
        runtime: movie.runtime,
        voteAverage: movie.voteAverage,
        voteCount: movie.voteCount,
      };
      await movieService.markAsWatched(movieData, rating || undefined);
      showToast('Marked as watched', 'success');
      setRatingDialogOpen(false);
      await checkUserMovieStatus();
    } catch {
      showToast('Failed to mark as watched', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    setActionLoading(true);
    try {
      await movieService.removeFromWatchlist(tmdbId);
      showToast('Removed from watchlist', 'success');
      setUserMovie(null);
    } catch {
      showToast('Failed to remove from watchlist', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (message: string, severity: 'info' | 'success' | 'error' | 'warning') => {
    setToast({ open: true, message, severity });
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 4 }}>
            <Skeleton variant="rectangular" height={400} />
            <Skeleton variant="text" sx={{ fontSize: '2rem', mt: 2 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (!movie) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h4">Movie not found</Typography>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  const backdropUrl = movie.backdropPath
    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.BACKDROP_SIZES[2]}${movie.backdropPath}`
    : null;

  const posterUrl = movie.posterPath
    ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZES[4]}${movie.posterPath}`
    : null;

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Unknown';

  const isInWatchlist = userMovie?.status === MovieStatus.WATCHLIST;
  const isWatched = userMovie?.status === MovieStatus.WATCHED;

  return (
    <MainLayout>
      {backdropUrl && (
        <Box
          sx={{
            position: 'relative',
            height: { xs: 200, md: 400 },
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Image src={backdropUrl} alt={movie.title} fill style={{ objectFit: 'cover' }} priority />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.9))',
            }}
          />
        </Box>
      )}

      <Container>
        <Box sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              {posterUrl ? (
                <Card sx={{ position: 'relative', paddingTop: '150%' }}>
                  <Image src={posterUrl} alt={movie.title} fill style={{ objectFit: 'cover' }} />
                </Card>
              ) : (
                <Card
                  sx={{
                    position: 'relative',
                    paddingTop: '150%',
                    bgcolor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon icon="mdi:movie-outline" size={64} color="grey.500" />
                </Card>
              )}

              <Box sx={{ mt: 3 }}>
                {!isWatched && (
                  <Button
                    fullWidth
                    variant={isInWatchlist ? 'outlined' : 'contained'}
                    color="primary"
                    startIcon={
                      <AppIcon icon={isInWatchlist ? 'mdi:bookmark-check' : 'mdi:bookmark-plus'} />
                    }
                    onClick={isInWatchlist ? handleRemoveFromWatchlist : handleAddToWatchlist}
                    disabled={actionLoading}
                    sx={{ mb: 2 }}
                  >
                    {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  </Button>
                )}

                <Button
                  fullWidth
                  variant={isWatched ? 'contained' : 'outlined'}
                  color={isWatched ? 'success' : 'primary'}
                  startIcon={<AppIcon icon={isWatched ? 'mdi:check-circle' : 'mdi:check'} />}
                  onClick={handleMarkAsWatched}
                  disabled={actionLoading || isWatched}
                >
                  {isWatched ? 'Watched' : 'Mark as Watched'}
                </Button>

                {isWatched && userMovie?.rating && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" gutterBottom>
                      Your Rating
                    </Typography>
                    <Rating value={userMovie.rating} readOnly size="large" />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                {movie.title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  {releaseYear}
                </Typography>
                {movie.runtime && (
                  <Typography variant="h6" color="text.secondary">
                    • {movie.runtime} min
                  </Typography>
                )}
                {movie.voteAverage && (
                  <Chip
                    label={movie.voteAverage.toFixed(1)}
                    color="primary"
                    icon={<AppIcon icon="mdi:star" size={16} />}
                  />
                )}
              </Box>

              {movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  {movie.genres.map(
                    (genre: string | number | { id: number; name: string }, index: number) => {
                      const genreId = typeof genre === 'object' ? genre.id : genre;
                      const genreLabel = typeof genre === 'object' ? genre.name : `Genre ${genre}`;
                      return (
                        <Chip
                          key={`genre-${genreId}-${index}`}
                          label={genreLabel}
                          variant="outlined"
                        />
                      );
                    },
                  )}
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h5" gutterBottom>
                Overview
              </Typography>
              <Typography variant="body1" paragraph>
                {movie.overview || 'No overview available'}
              </Typography>

              {movie.tagline && (
                <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', mb: 3 }}>
                  &ldquo;{movie.tagline}&rdquo;
                </Typography>
              )}

              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                <Tab label="Details" />
                <Tab label="Cast & Crew" />
                <Tab label="Videos" />
                <Tab label="Production" />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Grid container spacing={2}>
                    {movie.status && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body1">{movie.status}</Typography>
                      </Grid>
                    )}
                    {movie.originalLanguage && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Original Language
                        </Typography>
                        <Typography variant="body1">
                          {movie.originalLanguage.toUpperCase()}
                        </Typography>
                      </Grid>
                    )}
                    {movie.budget && movie.budget !== '0' && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Budget
                        </Typography>
                        <Typography variant="body1">
                          ${parseInt(movie.budget).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {movie.revenue && movie.revenue !== '0' && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Revenue
                        </Typography>
                        <Typography variant="body1">
                          ${parseInt(movie.revenue).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {movie.popularity && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Popularity
                        </Typography>
                        <Typography variant="body1">{movie.popularity.toFixed(1)}</Typography>
                      </Grid>
                    )}
                    {movie.voteCount && (
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Vote Count
                        </Typography>
                        <Typography variant="body1">{movie.voteCount.toLocaleString()}</Typography>
                      </Grid>
                    )}
                  </Grid>

                  {movie.spokenLanguages && movie.spokenLanguages.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Spoken Languages
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {movie.spokenLanguages.map((lang) => (
                          <Chip
                            key={lang.iso6391}
                            label={lang.englishName || lang.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {movie.homepage && (
                    <Box sx={{ mt: 3 }}>
                      <Link href={movie.homepage} target="_blank" rel="noopener">
                        <Button variant="outlined" startIcon={<AppIcon icon="mdi:open-in-new" />}>
                          Official Website
                        </Button>
                      </Link>
                    </Box>
                  )}

                  {movie.imdbId && (
                    <Box sx={{ mt: 2 }}>
                      <Link
                        href={`https://www.imdb.com/title/${movie.imdbId}`}
                        target="_blank"
                        rel="noopener"
                      >
                        <Button variant="outlined" startIcon={<AppIcon icon="mdi:imdb" />}>
                          View on IMDb
                        </Button>
                      </Link>
                    </Box>
                  )}
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  {movie.cast && movie.cast.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Cast
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {movie.cast.map((person) => (
                          <Grid key={person.personId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
                              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                                <Avatar
                                  src={
                                    person.person?.profilePath
                                      ? `${TMDB_CONFIG.IMAGE_BASE_URL}/w92${person.person.profilePath}`
                                      : undefined
                                  }
                                  sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}
                                >
                                  {!person.person?.profilePath && person.person?.name?.[0]}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                  >
                                    {person.person?.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                  >
                                    {person.character}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}

                  {movie.crew && movie.crew.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Crew
                      </Typography>
                      <Grid container spacing={2}>
                        {movie.crew.map((person, index) => (
                          <Grid
                            key={`${person.personId}-${index}`}
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                          >
                            <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
                              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                                <Avatar
                                  src={
                                    person.person?.profilePath
                                      ? `${TMDB_CONFIG.IMAGE_BASE_URL}/w92${person.person.profilePath}`
                                      : undefined
                                  }
                                  sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}
                                >
                                  {!person.person?.profilePath && person.person?.name?.[0]}
                                </Avatar>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                  >
                                    {person.person?.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                  >
                                    {person.job}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  {movie.videos && movie.videos.length > 0 ? (
                    <Grid container spacing={2}>
                      {movie.videos
                        .filter((video) => video.site === 'YouTube')
                        .map((video) => (
                          <Grid key={video.key} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card>
                              <Box
                                sx={{
                                  position: 'relative',
                                  paddingTop: '56.25%',
                                  backgroundColor: 'black',
                                }}
                              >
                                <iframe
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                  }}
                                  src={`https://www.youtube.com/embed/${video.key}`}
                                  title={video.name}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </Box>
                              <Box sx={{ p: 2 }}>
                                <Typography variant="subtitle2" noWrap>
                                  {video.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {video.type} • {video.official ? 'Official' : 'Unofficial'}
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">No videos available</Typography>
                  )}
                </Box>
              )}

              {tabValue === 3 && (
                <Box>
                  {movie.productionCompanies && movie.productionCompanies.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Production Companies
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {movie.productionCompanies.map((company) => (
                          <Grid key={company.companyId} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ p: 2 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                {company.logoPath && (
                                  <Box
                                    component="img"
                                    src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${company.logoPath}`}
                                    alt={company.name}
                                    sx={{ height: 40, objectFit: 'contain' }}
                                  />
                                )}
                                <Box>
                                  <Typography variant="subtitle2">{company.name}</Typography>
                                  {company.originCountry && (
                                    <Typography variant="caption" color="text.secondary">
                                      {company.originCountry}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}

                  {movie.productionCountries && movie.productionCountries.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Production Countries
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                        {movie.productionCountries.map((country) => (
                          <Chip
                            key={country.iso31661}
                            label={country.name}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
        <DialogTitle>Rate this movie</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography gutterBottom>How would you rate {movie.title}?</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWatched} variant="contained" disabled={actionLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </MainLayout>
  );
}
