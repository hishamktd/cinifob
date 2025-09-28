import { Box, Card, ToggleButtonGroup, styled } from '@mui/material';

export const RelatedContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 0),

  ['& .content-header']: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),

    ['& .content-title']: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },

  ['& .content-grid']: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing(3),

    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },

  ['& .show-more-wrapper']: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(4),
  },
}));

export const LoadingWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 0),

  ['& .loading-content']: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(4, 0),
  },
}));

export const EmptyStateCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,

  ['& .empty-state-content']: {
    textAlign: 'center',
    padding: theme.spacing(4),

    ['& .empty-icon']: {
      marginBottom: theme.spacing(2),
    },

    ['& .empty-text']: {
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(2),
    },
  },
}));

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  ['& .MuiToggleButton-root']: {
    textTransform: 'none',
    padding: theme.spacing(0.5, 2),

    ['& .icon-wrapper']: {
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(0.5),
    },
  },
}));
