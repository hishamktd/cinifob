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
    renderWithTheme(<AppLoader size={60} />);
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });

  it('renders fullscreen loader', () => {
    renderWithTheme(<AppLoader fullScreen />);
    const container = screen.getByRole('progressbar').parentElement;
    expect(container).toHaveStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh'
    });
  });

  it('renders with custom color', () => {
    renderWithTheme(<AppLoader color="secondary" />);
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });
});