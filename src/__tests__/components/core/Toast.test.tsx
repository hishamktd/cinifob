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
      <Toast open={true} message="Operation successful!" severity="success" onClose={() => {}} />,
    );

    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
  });

  it('renders error toast', () => {
    renderWithTheme(
      <Toast open={true} message="An error occurred" severity="error" onClose={() => {}} />,
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledError');
  });

  it('renders warning toast', () => {
    renderWithTheme(
      <Toast open={true} message="Warning message" severity="warning" onClose={() => {}} />,
    );

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledWarning');
  });

  it('renders info toast by default', () => {
    renderWithTheme(<Toast open={true} message="Information message" onClose={() => {}} />);

    expect(screen.getByText('Information message')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledInfo');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    renderWithTheme(
      <Toast open={true} message="Test message" severity="success" onClose={handleClose} />,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('auto-hides after duration', async () => {
    const handleClose = vi.fn();

    renderWithTheme(
      <Toast
        open={true}
        message="Auto-hide message"
        severity="info"
        onClose={handleClose}
        duration={100} // Use short duration for testing
      />,
    );

    await waitFor(
      () => {
        expect(handleClose).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );
  });

  it('does not render when closed', () => {
    renderWithTheme(
      <Toast open={false} message="Hidden message" severity="success" onClose={() => {}} />,
    );

    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
  });

  it('renders at bottom center by default', () => {
    const { container } = renderWithTheme(
      <Toast open={true} message="Bottom center message" severity="success" onClose={() => {}} />,
    );

    const snackbar = container.querySelector('.MuiSnackbar-anchorOriginBottomCenter');
    expect(snackbar).toBeInTheDocument();
  });

  it('uses default duration when not specified', () => {
    const handleClose = vi.fn();
    renderWithTheme(
      <Toast open={true} message="Default duration" severity="success" onClose={handleClose} />,
    );

    // Should render without errors
    expect(screen.getByText('Default duration')).toBeInTheDocument();
  });

  it('renders filled variant by default', () => {
    renderWithTheme(
      <Toast open={true} message="Filled toast" severity="success" onClose={() => {}} />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filled');
  });
});
