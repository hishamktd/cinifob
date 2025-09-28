import { Box, Container, styled } from '@mui/material';

export const MoviesPageContainer = styled(Container)(({ theme }) => ({
  ['& .page-wrapper']: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },

  ['& .page-header']: {
    marginBottom: theme.spacing(3),

    ['& .page-title']: {
      fontWeight: 600,
      marginBottom: theme.spacing(1),
    },
  },

  ['& .search-section']: {
    marginBottom: theme.spacing(3),
    width: '100%',
  },

  ['& .content-section']: {
    marginBottom: theme.spacing(4),
  },
}));

export const MoviesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(1.5),

  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: theme.spacing(2.5),
  },

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: theme.spacing(3),
  },

  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  },

  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  },
}));

export const SkeletonGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(1.5),

  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: theme.spacing(2.5),
  },

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: theme.spacing(3),
  },

  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  },

  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  },
}));

export const TabsWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));
