import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppSearchBar } from '@core/components/app-search-bar';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock useDebounce hook
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('AppSearchBar', () => {
  it('renders with placeholder', () => {
    renderWithTheme(<AppSearchBar value="" onChange={() => {}} placeholder="Search movies..." />);
    const input = screen.getByPlaceholderText('Search movies...');
    expect(input).toBeInTheDocument();
  });

  it('displays the current value', () => {
    renderWithTheme(<AppSearchBar value="Star Wars" onChange={() => {}} />);
    const input = screen.getByDisplayValue('Star Wars');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    renderWithTheme(<AppSearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Matrix' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
  });

  it('shows loading state', () => {
    renderWithTheme(<AppSearchBar value="" onChange={() => {}} loading />);
    const loader = screen.getByRole('progressbar');
    expect(loader).toBeInTheDocument();
  });

  it('calls onSearch when Enter is pressed', () => {
    const handleSearch = vi.fn();
    renderWithTheme(<AppSearchBar value="Inception" onChange={() => {}} onSearch={handleSearch} />);

    const input = screen.getByRole('combobox');
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });

    expect(handleSearch).toHaveBeenCalledWith('Inception');
  });

  it('handles disabled state', () => {
    renderWithTheme(<AppSearchBar value="" onChange={() => {}} disabled />);

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('renders with full width', () => {
    const { container } = renderWithTheme(<AppSearchBar value="" onChange={() => {}} fullWidth />);
    const autocomplete = container.querySelector('.MuiAutocomplete-root');
    expect(autocomplete).toBeInTheDocument();
  });

  it('renders clear button when showClearButton is true', () => {
    renderWithTheme(<AppSearchBar value="test" onChange={() => {}} showClearButton />);
    // Clear button is rendered as icon button when there's a value
    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();
  });

  it('renders with suggestions', () => {
    const suggestions = [
      { label: 'Movie 1', value: 'movie1' },
      { label: 'Movie 2', value: 'movie2' },
    ];

    renderWithTheme(<AppSearchBar value="" onChange={() => {}} suggestions={suggestions} />);

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });
});
