import { Box, Container, styled } from '@mui/material';

export const WatchlistPageContainer = styled(Container)(({ theme }) => ({
  ['& .page-wrapper']: {
    padding: theme.spacing(4, 0),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 0),
    },
  },

  ['& .page-header']: {
    marginBottom: theme.spacing(4),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(2),

    ['& .header-content']: {
      marginBottom: theme.spacing(3),
    },

    ['& .page-title']: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: theme.spacing(0.5),
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',

      [theme.breakpoints.down('md')]: {
        fontSize: '2rem',
      },

      [theme.breakpoints.down('sm')]: {
        fontSize: '1.75rem',
      },
    },

    ['& .page-subtitle']: {
      color: theme.palette.text.secondary,
      fontSize: '0.95rem',
      fontWeight: 500,
    },
  },

  ['& .content-filter']: {
    marginBottom: theme.spacing(2),
  },

  ['& .sort-chips-container']: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    alignItems: 'center',

    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(0.75),
    },

    ['& .MuiChip-root']: {
      fontWeight: 500,
      transition: 'all 0.2s ease',
      cursor: 'pointer',

      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[2],
      },

      '&.MuiChip-filled': {
        boxShadow: theme.shadows[1],
      },
    },
  },
}));

export const WatchlistGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(2),

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

  [theme.breakpoints.down('xs')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
}));
