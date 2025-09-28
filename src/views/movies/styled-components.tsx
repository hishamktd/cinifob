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
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(3),

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

export const SkeletonGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(3),

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

export const TabsWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));
