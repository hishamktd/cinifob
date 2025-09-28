import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppRating } from '@core/components/app-rating';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppRating', () => {
  it('renders with value', () => {
    renderWithTheme(<AppRating value={3} />);
    const rating = screen.getByRole('radio', { name: '3 Stars' });
    expect(rating).toBeInTheDocument();
    expect(rating).toBeChecked();
  });

  it('renders read-only by default', () => {
    const { container } = renderWithTheme(<AppRating value={4} />);
    const rating = container.querySelector('.MuiRating-root');
    expect(rating).toBeInTheDocument();
  });

  it('handles onChange when not read-only', () => {
    const handleChange = vi.fn();
    renderWithTheme(<AppRating value={2} onChange={handleChange} readOnly={false} />);

    const star4 = screen.getByRole('radio', { name: '4 Stars' });
    fireEvent.click(star4);

    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), 4);
  });

  it('renders with custom max value', () => {
    const { container } = renderWithTheme(<AppRating value={7} max={10} />);
    // With max=10, should render more radio buttons
    const rating = container.querySelector('.MuiRating-root');
    expect(rating).toBeInTheDocument();
  });

  it('renders with precision', () => {
    const { container } = renderWithTheme(<AppRating value={3.5} precision={0.5} />);
    // With precision 0.5, value might be handled differently
    const rating = container.querySelector('.MuiRating-root');
    expect(rating).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = renderWithTheme(<AppRating value={4} size="large" />);
    const rating = container.querySelector('.MuiRating-sizeLarge');
    expect(rating).toBeInTheDocument();
  });

  it('displays empty when value is 0', () => {
    renderWithTheme(<AppRating value={0} />);
    const emptyRating = screen.getByRole('radio', { name: 'Empty' });
    expect(emptyRating).toBeInTheDocument();
  });

  it('shows value when showValue is true', () => {
    renderWithTheme(<AppRating value={4} showValue />);
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('renders with label', () => {
    renderWithTheme(<AppRating value={4} label="Rating" />);
    expect(screen.getByText('Rating:')).toBeInTheDocument();
  });

  it('renders detailed variant', () => {
    renderWithTheme(<AppRating value={4} variant="detailed" showValue />);
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    renderWithTheme(<AppRating value={4} variant="compact" />);
    const rating = screen.getByRole('radio', { name: '4 Stars' });
    expect(rating).toBeInTheDocument();
  });
});
