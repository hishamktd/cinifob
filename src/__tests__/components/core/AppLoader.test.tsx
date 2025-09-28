import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppLoader } from '@core/components/app-loader';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppLoader', () => {
  it('renders circular progress by default', () => {
    renderWithTheme(<AppLoader />);
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    renderWithTheme(<AppLoader size="large" />);
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });

  it('renders fullscreen loader', () => {
    const { container } = renderWithTheme(<AppLoader fullscreen />);
    const loaderContainer = container.firstChild;
    expect(loaderContainer).toHaveStyle({ position: 'fixed' });
  });

  it('renders with custom color', () => {
    renderWithTheme(<AppLoader color="secondary" />);
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });

  it('renders linear type', () => {
    renderWithTheme(<AppLoader type="linear" />);
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });

  it('renders with message', () => {
    renderWithTheme(<AppLoader message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders skeleton type', () => {
    renderWithTheme(<AppLoader type="skeleton" />);
    // Skeleton doesn't have progressbar role, just check it renders
    expect(screen.getByTestId('app-loader')).toBeInTheDocument();
  });

  it('renders dots type', () => {
    renderWithTheme(<AppLoader type="dots" />);
    // Check if the component renders without errors
    expect(screen.getByTestId('app-loader')).toBeInTheDocument();
  });
});
