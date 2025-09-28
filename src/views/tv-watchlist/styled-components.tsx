import { Box, Container, styled } from '@mui/material';

export const WatchlistPageContainer = styled(Container)(({ theme }) => ({
  ['& .page-wrapper']: {
    padding: theme.spacing(4, 0),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  ['& .page-header']: {
    marginBottom: theme.spacing(4),

    ['& .header-content']: {
      marginBottom: theme.spacing(2),
    },

    ['& .page-title']: {
      fontSize: '2.125rem',
      marginBottom: theme.spacing(1),

      [theme.breakpoints.down('md')]: {
        fontSize: '1.75rem',
      },

      [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
      },
    },

    ['& .page-subtitle']: {
      color: theme.palette.text.secondary,
    },
  },

  ['& .sort-chips-container']: {
    display: 'flex',
    gap: theme.spacing(1),
    overflowX: 'auto',
    paddingBottom: theme.spacing(1),

    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(0.5),
    },

    '&::-webkit-scrollbar': {
      height: 4,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.action.hover,
      borderRadius: 2,
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.action.disabled,
      borderRadius: 2,
    },

    ['& .MuiChip-root']: {
      flexShrink: 0,
    },
  },
}));

export const WatchlistGrid = styled(Box)(({ theme }) => ({
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
