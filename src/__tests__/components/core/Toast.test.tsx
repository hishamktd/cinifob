import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from '@core/components/toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Toast', () => {
  it('renders success toast', () => {
    renderWithTheme(
      <Toast
        open={true}
        message="Operation successful!"
        severity="success"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
  });

  it('renders error toast', () => {
    renderWithTheme(
      <Toast
        open={true}
        message="An error occurred"
        severity="error"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledError');
  });

  it('renders warning toast', () => {
    renderWithTheme(
      <Toast
        open={true}
        message="Warning message"
        severity="warning"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledWarning');
  });

  it('renders info toast', () => {
    renderWithTheme(
      <Toast
        open={true}
        message="Information message"
        severity="info"
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Information message')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledInfo');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    renderWithTheme(
      <Toast
        open={true}
        message="Test message"
        severity="success"
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('auto-hides after duration', async () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();

    renderWithTheme(
      <Toast
        open={true}
        message="Auto-hide message"
        severity="info"
        onClose={handleClose}
        autoHideDuration={3000}
      />
    );

    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });

  it('does not render when closed', () => {
    renderWithTheme(
      <Toast
        open={false}
        message="Hidden message"
        severity="success"
        onClose={() => {}}
      />
    );

    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
  });

  it('renders at different positions', () => {
    const { container } = renderWithTheme(
      <Toast
        open={true}
        message="Top right message"
        severity="success"
        onClose={() => {}}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    );

    const snackbar = container.querySelector('.MuiSnackbar-anchorOriginTopRight');
    expect(snackbar).toBeInTheDocument();
  });

  it('renders with custom action', () => {
    const handleAction = vi.fn();

    renderWithTheme(
      <Toast
        open={true}
        message="Message with action"
        severity="info"
        onClose={() => {}}
        action={
          <button onClick={handleAction}>Undo</button>
        }
      />
    );

    const actionButton = screen.getByRole('button', { name: 'Undo' });
    fireEvent.click(actionButton);

    expect(handleAction).toHaveBeenCalled();
  });

  it('handles variant prop', () => {
    renderWithTheme(
      <Toast
        open={true}
        message="Outlined toast"
        severity="success"
        variant="outlined"
        onClose={() => {}}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-outlinedSuccess');
  });
});