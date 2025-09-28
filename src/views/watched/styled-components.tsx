import { Box, Container, Card, styled } from '@mui/material';

export const WatchedPageContainer = styled(Container)(({ theme }) => ({
  ['& .page-wrapper']: {
    padding: theme.spacing(4, 0),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  ['& .page-header']: {
    marginBottom: theme.spacing(4),

    ['& .page-title']: {
      fontSize: '2.125rem',

      [theme.breakpoints.down('md')]: {
        fontSize: '1.75rem',
      },

      [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
      },
    },
  },
}));

export const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
  },

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
  },
}));

export const StatCard = styled(Card)(({ theme }) => ({
  ['& .stat-content']: {
    padding: theme.spacing(3),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },

    ['& .stat-icon']: {
      marginBottom: theme.spacing(1),
    },

    ['& .stat-value']: {
      fontSize: '2.125rem',
      marginTop: theme.spacing(1),

      [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
      },
    },

    ['& .stat-label']: {
      fontSize: '0.875rem',
      color: theme.palette.text.secondary,

      [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem',
      },
    },

    ['& .stat-subtitle']: {
      fontSize: '1rem',
      marginTop: theme.spacing(1),
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',

      [theme.breakpoints.down('sm')]: {
        fontSize: '0.875rem',
      },
    },
  },
}));

export const MoviesSection = styled(Box)(({ theme }) => ({
  ['& .section-header']: {
    marginBottom: theme.spacing(2),

    ['& .section-title']: {
      fontSize: '1.25rem',

      [theme.breakpoints.down('sm')]: {
        fontSize: '1.125rem',
      },
    },
  },

  ['& .sort-chips-container']: {
    display: 'flex',
    gap: theme.spacing(1),
    overflowX: 'auto',
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(3),

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

export const MoviesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: theme.spacing(2),

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));
