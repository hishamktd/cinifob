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
    const rating = screen.getByRole('img', { name: '3 Stars' });
    expect(rating).toBeInTheDocument();
  });

  it('renders read-only by default', () => {
    const { container } = renderWithTheme(<AppRating value={4} />);
    const rating = container.querySelector('.MuiRating-readOnly');
    expect(rating).toBeInTheDocument();
  });

  it('handles onChange when not read-only', () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <AppRating
        value={2}
        onChange={handleChange}
        readOnly={false}
      />
    );

    const star4 = screen.getByRole('radio', { name: '4 Stars' });
    fireEvent.click(star4);

    expect(handleChange).toHaveBeenCalledWith(expect.any(Object), 4);
  });

  it('renders with custom max value', () => {
    renderWithTheme(<AppRating value={7} max={10} />);
    const rating = screen.getByRole('img', { name: '7 Stars' });
    expect(rating).toBeInTheDocument();
  });

  it('renders with precision', () => {
    renderWithTheme(<AppRating value={3.5} precision={0.5} />);
    const rating = screen.getByRole('img', { name: '3.5 Stars' });
    expect(rating).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = renderWithTheme(
      <AppRating value={4} size="large" />
    );
    const rating = container.querySelector('.MuiRating-sizeLarge');
    expect(rating).toBeInTheDocument();
  });

  it('displays empty when value is 0', () => {
    renderWithTheme(<AppRating value={0} />);
    const rating = screen.getByRole('img', { name: '0 Stars' });
    expect(rating).toBeInTheDocument();
  });

  it('shows labels when showLabel is true', () => {
    renderWithTheme(
      <AppRating value={4} showLabel />
    );
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
  });
});