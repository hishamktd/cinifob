import { styled } from '@mui/material/styles';
import { Box, Card, Typography, IconButton } from '@mui/material';

export const WatchedMovieCardWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const StyledMovieCard = styled(Card)(() => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    border: '2px solid #4caf50',
    clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
    pointerEvents: 'none',
    zIndex: 10,
  },
  '&:hover': {
    '&::before': {
      animation: 'borderReveal 1.5s linear forwards',
    },
  },
  '@keyframes borderReveal': {
    '0%': {
      clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)',
    },
    '25%': {
      clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
    },
    '50%': {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 0)',
    },
    '75%': {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0)',
    },
    '100%': {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
  },
}));

export const PosterWrapper = styled(Box)({
  position: 'relative',
  paddingTop: '150%',
  overflow: 'hidden',
});

export const PosterPlaceholder = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: theme.palette.action.disabledBackground,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const RatingBadge = styled(Box)({
  position: 'absolute',
  top: 6,
  right: 6,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 4,
  padding: '2px 6px',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
});

export const WatchedIndicator = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(76, 175, 80, 0.95)',
  padding: '4px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
});

export const MovieTitle = styled(Typography)({
  fontWeight: 600,
  marginBottom: 4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
});

export const WatchedDateSection = styled(Box)(({ theme }) => ({
  marginTop: 6,
  padding: 6,
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
  borderRadius: 4,
}));

export const DateDisplay = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '& .date-info': {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
});

export const EditDateButton = styled(IconButton)({
  padding: 2,
  color: 'text.secondary',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
});

export const UserRatingSection = styled(Box)({
  marginTop: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '0 6px',
});

export const ActionButtonsWrapper = styled(Box)({
  marginTop: 6,
  display: 'flex',
  gap: 4,
});
